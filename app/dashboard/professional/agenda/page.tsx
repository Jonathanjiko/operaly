"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Clock,
  Zap,
  CheckSquare,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import CalendarView from "@/components/CalendarView"

type EventItem = {
  id: string
  title: string
  dateKey: string
  timeLabel: string
  type: "task" | "automation"
  sourceAt: string
}

type ClientPrefs = {
  locale: string
  timeZone: string
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return null

  return parsed
}

function getDateKeyInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return formatter.format(date)
}

function getTimeLabelInTimeZone(date: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function mapLanguageToLocale(language: string | null | undefined): string {
  const value = String(language || "").trim().toLowerCase()

  if (value === "en") return "en-US"
  if (value === "pt") return "pt-BR"
  if (value === "fr") return "fr-FR"
  if (value === "de") return "de-DE"
  if (value === "it") return "it-IT"

  return "es-PE"
}

function formatStoredDateTime(value: string, locale: string, timeZone: string): string {
  const parsed = safeDate(value)

  if (!parsed) return value

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [events, setEvents] = useState<EventItem[]>([])
  const [clientPrefs, setClientPrefs] = useState<ClientPrefs>({
    locale: "es-PE",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima",
  })

  useEffect(() => {
    const init = async () => {
      try {
        setErrorMessage("")

        const clientId = await getCurrentClientId()
        const prefs = await loadClientPrefs(clientId)

        setClientPrefs(prefs)
        setSelectedDate(getDateKeyInTimeZone(new Date(), prefs.timeZone))

        await loadEvents(clientId, prefs)
      } catch (err: any) {
        console.error(err)
        setErrorMessage(err?.message || "No se pudo cargar la agenda.")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const loadClientPrefs = async (clientId: string): Promise<ClientPrefs> => {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima"

    const { data: clientRow, error } = await supabase
      .from("clients")
      .select("timezone, timezone_auto, preferred_language, language")
      .eq("id", clientId)
      .maybeSingle()

    if (error) {
      console.error("Error cargando preferencias del cliente:", error)
    }

    const storedTimeZone = String(clientRow?.timezone || "").trim()
    const autoTimeZone = String(clientRow?.timezone_auto || "").trim()

    const resolvedTimeZone =
      autoTimeZone ||
      (storedTimeZone && storedTimeZone !== "America/Lima"
        ? storedTimeZone
        : browserTimeZone)

    const language = clientRow?.preferred_language || clientRow?.language || "es"

    return {
      locale: mapLanguageToLocale(language),
      timeZone: resolvedTimeZone || "America/Lima",
    }
  }

  const loadEvents = async (clientId: string, prefs: ClientPrefs) => {
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, due_at, status")
      .eq("client_id", clientId)
      .in("status", ["pending", "in_progress"])
      .order("due_at", { ascending: true })

    if (tasksError) {
      throw tasksError
    }

    const { data: automations, error: automationsError } = await supabase
      .from("recurring_tasks")
      .select("id, title, next_run, status")
      .eq("client_id", clientId)
      .eq("status", "active")
      .order("next_run", { ascending: true })

    if (automationsError) {
      throw automationsError
    }

    const mappedTasks: EventItem[] = (tasks || [])
      .filter((task: any) => task.due_at)
      .map((task: any) => {
        const parsed = safeDate(task.due_at)
        if (!parsed) return null

        return {
          id: task.id,
          title: task.title || "Tarea",
          dateKey: getDateKeyInTimeZone(parsed, prefs.timeZone),
          timeLabel: getTimeLabelInTimeZone(parsed, prefs.locale, prefs.timeZone),
          type: "task" as const,
          sourceAt: task.due_at,
        }
      })
      .filter(Boolean) as EventItem[]

    const mappedAutomations: EventItem[] = (automations || [])
      .filter((item: any) => item.next_run)
      .map((item: any) => {
        const parsed = safeDate(item.next_run)
        if (!parsed) return null

        return {
          id: item.id,
          title: item.title || "Automatización",
          dateKey: getDateKeyInTimeZone(parsed, prefs.timeZone),
          timeLabel: getTimeLabelInTimeZone(parsed, prefs.locale, prefs.timeZone),
          type: "automation" as const,
          sourceAt: item.next_run,
        }
      })
      .filter(Boolean) as EventItem[]

    const merged = [...mappedTasks, ...mappedAutomations].sort(
      (a, b) => new Date(a.sourceAt).getTime() - new Date(b.sourceAt).getTime()
    )

    setEvents(merged)
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => event.dateKey === selectedDate)
  }, [events, selectedDate])

  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      dateKey: event.dateKey,
      timeLabel: event.timeLabel,
      type: event.type,
      sourceAt: event.sourceAt,
    }))
  }, [events])

  const taskCount = useMemo(() => {
    return events.filter((event) => event.type === "task").length
  }, [events])

  const automationCount = useMemo(() => {
    return events.filter((event) => event.type === "automation").length
  }, [events])

  const upcomingCount = filteredEvents.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza tareas y automatizaciones en calendario.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/professional/tareas">
            <Button variant="outline" className="rounded-xl">
              <CheckSquare className="w-4 h-4 mr-2" />
              Ver tareas
            </Button>
          </Link>

          <Link href="/dashboard/professional/automatizaciones">
            <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90">
              <Zap className="w-4 h-4 mr-2" />
              Ver automatizaciones
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[#3B82F6]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0F1F63]">{events.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Eventos programados</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-[#7C3AED]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0F1F63]">{taskCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Tareas con fecha</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#06B6D4]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0F1F63]">{automationCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Automatizaciones activas</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        {loading ? (
          <p className="text-muted-foreground">Cargando agenda...</p>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-dashed border-[#FCA5A5] bg-[#FEF2F2] p-8 text-center">
            <p className="font-medium text-[#991B1B]">No se pudo cargar la agenda.</p>
            <p className="text-sm text-[#B91C1C] mt-2">{errorMessage}</p>
          </div>
        ) : (
          <CalendarView
            events={calendarEvents as any[]}
            locale={clientPrefs.locale}
            selectedDate={selectedDate}
            onSelectDate={(dateKey) => setSelectedDate(dateKey)}
          />
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F1F63]">Eventos del día</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingCount > 0
                ? `${upcomingCount} evento(s) para la fecha seleccionada`
                : "No hay eventos programados para la fecha seleccionada"}
            </p>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-11 border border-border rounded-xl px-4 py-2 bg-background"
          />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-8 text-center">
            <p className="text-[#0F1F63] font-medium">
              No hay eventos para la fecha seleccionada.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Cuando crees tareas con fecha o automatizaciones activas, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={`${event.type}-${event.id}-${event.sourceAt}`}
                className="rounded-xl border border-border p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      event.type === "task" ? "bg-[#3B82F6]/10" : "bg-[#7C3AED]/10"
                    }`}
                  >
                    {event.type === "task" ? (
                      <CheckSquare className="w-4 h-4 text-[#3B82F6]" />
                    ) : (
                      <Zap className="w-4 h-4 text-[#7C3AED]" />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-[#0F1F63]">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.type === "task" ? "Tarea" : "Automatización"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {event.timeLabel}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatStoredDateTime(
                      event.sourceAt,
                      clientPrefs.locale,
                      clientPrefs.timeZone
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0F1F63]">Siguiente paso</h2>
          <Link href="/dashboard/professional/automatizaciones">
            <Button variant="ghost" size="sm" className="text-[#3B82F6]">
              Ir a automatizaciones
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-6">
          <p className="text-[#0F1F63] font-medium">
            La agenda ya refleja tareas y automatizaciones reales.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            El siguiente bloque lógico es conectar edición rápida desde agenda y luego
            sincronización visible con Google Calendar según el plan del usuario.
          </p>
        </div>
      </div>
    </div>
  )
}
