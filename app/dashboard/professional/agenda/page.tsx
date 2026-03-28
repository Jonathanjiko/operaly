"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import CalendarView from "@/components/CalendarView"

type EventItem = {
  id: string
  title: string
  date: string
  type: "task" | "automation"
  source_at: string
}

function parseLocalDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null
  }

  const raw = String(value).trim()

  if (!raw) {
    return null
  }

  const normalized = raw.replace(" ", "T")
  const parsed = new Date(normalized)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatEventDateTime(value: string): string {
  const parsed = parseLocalDate(value)

  if (!parsed) {
    return value
  }

  return parsed.toLocaleString()
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return toDateKey(new Date())
  })
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const clientId = await getCurrentClientId()
        await loadEvents(clientId)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

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
      .map((task: any) => {
        const parsed = parseLocalDate(task.due_at)
        const dateKey = parsed ? toDateKey(parsed) : String(task.due_at).slice(0, 10)

        return {
          id: task.id,
          title: task.title || "Tarea",
          date: dateKey,
          type: "task" as const,
          source_at: task.due_at,
        }
      })

    const mappedAutomations: EventItem[] = (automations || [])
      .filter((item: any) => item.next_run)
      .map((item: any) => {
        const parsed = parseLocalDate(item.next_run)
        const dateKey = parsed ? toDateKey(parsed) : String(item.next_run).slice(0, 10)

        return {
          id: item.id,
          title: item.title || "Automatización",
          date: dateKey,
          type: "automation" as const,
          source_at: item.next_run,
        }
      })

    setEvents([...mappedTasks, ...mappedAutomations])
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => event.date === selectedDate)
  }, [events, selectedDate])

  const calendarEvents = useMemo(() => {
    return events
      .map((event) => {
        const parsed = parseLocalDate(event.source_at)

        if (!parsed) {
          return null
        }

        return {
          title: event.title,
          start: parsed,
          end: parsed,
          resource: event,
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
            events={calendarEvents}
            onSelectEvent={(calendarEvent: any) => {
              const start = calendarEvent?.start

              if (start instanceof Date && !Number.isNaN(start.getTime())) {
                setSelectedDate(toDateKey(start))
              }
            }}
            onSelectSlot={(slotInfo: any) => {
              const start = slotInfo?.start

              if (start instanceof Date && !Number.isNaN(start.getTime())) {
                setSelectedDate(toDateKey(start))
              }
            }}
          />
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
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
                key={`${event.type}-${event.id}-${event.source_at}`}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {event.type === "task" ? "Tarea" : "Automatización"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fecha: {formatEventDateTime(event.source_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
