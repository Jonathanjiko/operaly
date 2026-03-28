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
}

function extractDateKey(value: string | null | undefined): string {
  if (!value) {
    return ""
  }

  const raw = String(value).trim()

  if (raw.length >= 10) {
    return raw.slice(0, 10)
  }

  return ""
}

function extractTimeLabel(value: string | null | undefined): string {
  if (!value) {
    return ""
  }

  const raw = String(value).trim()

  if (raw.length >= 16) {
    return raw.slice(11, 16)
  }

  return ""
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
  dateKey: string,
  timeLabel: string,
  locale: string
): string {
  const [year, month, day] = dateKey.split("-").map(Number)

  if (!year || !month || !day) {
    return `${dateKey}${timeLabel ? ` ${timeLabel}` : ""}`
  }

  const date = new Date(year, month - 1, day)

  const dateText = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)

  return timeLabel ? `${dateText} ${timeLabel}` : dateText
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [events, setEvents] = useState<EventItem[]>([])
  const [clientPrefs, setClientPrefs] = useState<ClientPrefs>({
    locale: "es-PE",
  })

  useEffect(() => {
    const init = async () => {
      try {
        const clientId = await getCurrentClientId()
        const prefs = await loadClientPrefs(clientId)

        setClientPrefs(prefs)

        const today = new Date()
        const todayKey = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
        ].join("-")

        setSelectedDate(todayKey)

        await loadEvents(clientId)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const loadClientPrefs = async (clientId: string): Promise<ClientPrefs> => {
    const { data: clientRow } = await supabase
      .from("clients")
      .select("preferred_language, language")
      .eq("id", clientId)
      .maybeSingle()

    const language =
      clientRow?.preferred_language ||
      clientRow?.language ||
      "es"

    return {
      locale: mapLanguageToLocale(language),
    }
  }

  const loadEvents = async (clientId: string) => {
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
      .map((task: any) => ({
        id: task.id,
        title: task.title || "Tarea",
        dateKey: extractDateKey(task.due_at),
        timeLabel: extractTimeLabel(task.due_at),
        type: "task" as const,
        sourceAt: task.due_at,
      }))
      .filter((item) => item.dateKey)

    const mappedAutomations: EventItem[] = (automations || [])
      .filter((item: any) => item.next_run)
      .map((item: any) => ({
        id: item.id,
        title: item.title || "Automatización",
        dateKey: extractDateKey(item.next_run),
        timeLabel: extractTimeLabel(item.next_run),
        type: "automation" as const,
        sourceAt: item.next_run,
      }))
      .filter((item) => item.dateKey)

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
                    event.dateKey,
                    event.timeLabel,
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
