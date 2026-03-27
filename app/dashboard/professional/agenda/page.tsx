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

  const calendarEvents = items
    .filter((item) => item.when)
    .map((item) => ({
      title: item.title,
      start: new Date(item.when),
      end: new Date(item.when),
    }))
  
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
    </div>
  )
