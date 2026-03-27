"use client"

import { useEffect, useState } from "react"
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
  const [clientId, setClientId] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [events, setEvents] = useState<EventItem[]>([])

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const init = async () => {
      const id = await getCurrentClientId()
      setClientId(id)
      setSelectedDate(today)
      loadEvents(id)
    }
    init()
  }, [])

  const loadEvents = async (clientId: string) => {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("client_id", clientId)

    const { data: automations } = await supabase
      .from("recurring_tasks")
      .select("*")
      .eq("client_id", clientId)

    const mapped: EventItem[] = [
      ...(tasks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        date: t.due_date?.slice(0, 10),
        type: "task",
      })),
      ...(automations || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        date: a.next_run?.slice(0, 10),
        type: "automation",
      })),
    ]

    setEvents(mapped)
  }

  const filtered = events.filter((e) => e.date === selectedDate)

  const calendarEvents = items.map((item) => ({
    title: item.title,
    start: new Date(item.when),
    end: new Date(item.when),
  }))
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agenda</h1>

      <div className="flex gap-6">
        {/* CALENDARIO SIMPLE */}
        <div className="bg-white p-4 rounded-xl shadow w-64">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* EVENTOS */}
        <div className="flex-1 bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Eventos del {selectedDate}
          </h2>

          {filtered.length === 0 && (
            <p className="text-gray-400">No hay eventos</p>
          )}

          {filtered.map((e) => (
            <div
              key={e.id}
              className={`p-3 rounded-lg mb-2 ${
                e.type === "task"
                  ? "bg-blue-50"
                  : "bg-purple-50"
              }`}
            >
              <p className="font-medium">{e.title}</p>
              <span className="text-xs text-gray-500">
                {e.type === "task" ? "Tarea" : "Automatización"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
