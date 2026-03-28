"use client"

import { useEffect, useMemo, useState } from "react"
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
  if (!value) {
    return null
  }

  const parsed = new Date(String(value))

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

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

function formatStoredDateTime(
  value: string,
  locale: string,
  timeZone: string
): string {
  const parsed = safeDate(value)

  if (!parsed) {
    return value
  }

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
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [events, setEvents] = useState<EventItem[]>([])
  const [clientPrefs, setClientPrefs] = useState<ClientPrefs>({
    locale: "es-PE",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima",
  })

  useEffect(() => {
    const init = async () => {
      try {
        const clientId = await getCurrentClientId()
        const prefs = await loadClientPrefs(clientId)

        setClientPrefs(prefs)
        setSelectedDate(getDateKeyInTimeZone(new Date(), prefs.timeZone))

        await loadEvents(clientId, prefs)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const loadClientPrefs = async (clientId: string): Promise<ClientPrefs> => {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima"

    const { data: clientRow } = await supabase
      .from("clients")
      .select("timezone, timezone_auto, preferred_language, language")
      .eq("id", clientId)
      .maybeSingle()

    const storedTimeZone = String(clientRow?.timezone || "").trim()
    const autoTimeZone = String(clientRow?.timezone_auto || "").trim()

    const resolvedTimeZone =
      autoTimeZone ||
      (storedTimeZone && storedTimeZone !== "America/Lima"
        ? storedTimeZone
        : browserTimeZone)

    const language =
      clientRow?.preferred_language ||
      clientRow?.language ||
      "es"

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

    if (tasksError) {
      throw tasksError
    }

    const { data: automations, error: automationsError } = await supabase
      .from("recurring_tasks")
      .select("id, title, next_run, status")
      .eq("client_id", clientId)

    if (automationsError) {
      throw automationsError
    }

    const mappedTasks: EventItem[] = (tasks || [])
      .filter((task: any) => task.due_at)
      .map((task: any) => {
        const parsed = safeDate(task.due_at)

        if (!parsed) {
          return null
        }

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

        if (!parsed) {
          return null
        }

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

    setEvents([...mappedTasks, ...mappedAutomations])
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F1F63]">Agenda</h1>
        <p className="text-muted-foreground mt-1">
          Visualiza tareas y automatizaciones en calendario.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        {loading ? (
          <p className="text-muted-foreground">Cargando agenda...</p>
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
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-semibold text-[#0F1F63]">
            Eventos del día
          </h2>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-muted-foreground">
            No hay eventos para la fecha seleccionada.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={`${event.type}-${event.id}-${event.sourceAt}`}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>

                <p className="text-sm text-muted-foreground">
                  Tipo: {event.type === "task" ? "Tarea" : "Automatización"}
                </p>

                <p className="text-sm text-muted-foreground">
                  Fecha:{" "}
                  {formatStoredDateTime(
                    event.sourceAt,
                    clientPrefs.locale,
                    clientPrefs.timeZone
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
