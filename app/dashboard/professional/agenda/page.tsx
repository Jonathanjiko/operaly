"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import CalendarView from "@/components/CalendarView"

type EventItem = {
  id: string
  title: string
  dateKey: string
  type: "task" | "automation"
  sourceAt: string
}

type ClientPrefs = {
  timezone: string
  locale: string
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

function formatDateTimeInTimeZone(
  value: string,
  timeZone: string,
  locale: string
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

function mapLanguageToLocale(language: string | null | undefined): string {
  const value = String(language || "").trim().toLowerCase()

  if (value === "en") return "en-US"
  if (value === "pt") return "pt-BR"
  if (value === "fr") return "fr-FR"
  if (value === "de") return "de-DE"
  if (value === "it") return "it-IT"

  return "es-PE"
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [events, setEvents] = useState<EventItem[]>([])
  const [clientPrefs, setClientPrefs] = useState<ClientPrefs>({
    timezone: "America/Lima",
    locale: "es-PE",
  })

  useEffect(() => {
    const init = async () => {
      try {
        const clientId = await getCurrentClientId()
        const prefs = await loadClientPrefs(clientId)

        setClientPrefs(prefs)

        const todayKey = getDateKeyInTimeZone(new Date(), prefs.timezone)
        setSelectedDate(todayKey)

        await loadEvents(clientId, prefs.timezone)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const loadClientPrefs = async (clientId: string): Promise<ClientPrefs> => {
    const { data: clientRow } = await supabase
      .from("clients")
      .select("timezone, preferred_language, language")
      .eq("id", clientId)
      .maybeSingle()

    const timezone =
      clientRow?.timezone && String(clientRow.timezone).trim()
        ? String(clientRow.timezone).trim()
        : "America/Lima"

    const language =
      clientRow?.preferred_language ||
      clientRow?.language ||
      "es"

    return {
      timezone,
      locale: mapLanguageToLocale(language),
    }
  }

  const loadEvents = async (clientId: string, timeZone: string) => {
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
        const dateKey = parsed
          ? getDateKeyInTimeZone(parsed, timeZone)
          : ""

        return {
          id: task.id,
          title: task.title || "Tarea",
          dateKey,
          type: "task",
          sourceAt: task.due_at,
        }
      })
      .filter((item) => item.dateKey)

    const mappedAutomations: EventItem[] = (automations || [])
      .filter((item: any) => item.next_run)
      .map((item: any) => {
        const parsed = safeDate(item.next_run)
        const dateKey = parsed
          ? getDateKeyInTimeZone(parsed, timeZone)
          : ""

        return {
          id: item.id,
          title: item.title || "Automatización",
          dateKey,
          type: "automation",
          sourceAt: item.next_run,
        }
      })
      .filter((item) => item.dateKey)

    setEvents([...mappedTasks, ...mappedAutomations])
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => event.dateKey === selectedDate)
  }, [events, selectedDate])

  const calendarEvents = useMemo(() => {
    return events
      .map((event) => {
        const parsed = safeDate(event.sourceAt)

        if (!parsed) {
          return null
        }

        return {
          id: event.id,
          title: event.title,
          start: parsed,
          end: parsed,
          type: event.type,
          sourceAt: event.sourceAt,
        }
      })
      .filter(Boolean)
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
            timeZone={clientPrefs.timezone}
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
                  {formatDateTimeInTimeZone(
                    event.sourceAt,
                    clientPrefs.timezone,
                    clientPrefs.locale
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
