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
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [events, setEvents] = useState<EventItem[]>([])

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const init = async () => {
      setSelectedDate(today)

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
      .select("id, title, due_at")
      .eq("client_id", clientId)

    if (tasksError) {
      throw tasksError
    }

    const { data: automations, error: automationsError } = await supabase
      .from("recurring_tasks")
      .select("id, title, next_run")
      .eq("client_id", clientId)

    if (automationsError) {
      throw automationsError
    }

    const mapped: EventItem[] = [
      ...(tasks || [])
        .filter((t: any) => t.due_at)
        .map((t: any) => ({
          id: t.id,
          title: t.title || "Tarea",
          date: t.due_at.slice(0, 10),
          type: "task" as const,
        })),
      ...(automations || [])
        .filter((a: any) => a.next_run)
        .map((a: any) => ({
          id: a.id,
          title: a.title || "Automatización",
          date: a.next_run.slice(0, 10),
          type: "automation" as const,
        })),
    ]

    setEvents(mapped)
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => event.date === selectedDate)
  }, [events, selectedDate])

  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
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
          <CalendarView events={calendarEvents} />
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
                key={event.id}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {event.type === "task" ? "Tarea" : "Automatización"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fecha: {event.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
