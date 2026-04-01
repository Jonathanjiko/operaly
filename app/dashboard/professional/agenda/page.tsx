"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

// ─────────────────────────────
// TYPES
// ─────────────────────────────
type EventSource = "local" | "google"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  source: EventSource
}

// ─────────────────────────────
// EVENT CHIP (PRO)
// ─────────────────────────────
function EventChip({ event }: { event: CalendarEvent }) {
  const sourceLabel =
    event.source === "google" ? "Google" : "Operaly"

  return (
    <div className="group px-2 py-1 rounded-md text-[12px] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition cursor-pointer">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[#111827]">
          {event.title}
        </span>

        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
          {sourceLabel}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────
// DAY CELL
// ─────────────────────────────
function DayCell({
  date,
  events,
}: {
  date: Date
  events: CalendarEvent[]
}) {
  return (
    <div className="min-h-[110px] p-2 border border-[#E5E7EB] hover:bg-[#FAFAFA] transition">
      <div className="text-xs font-semibold text-[#374151] mb-1">
        {date.getDate()}
      </div>

      <div className="flex flex-col gap-1">
        {events.map((e) => (
          <EventChip key={e.id} event={e} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────
// MAIN
// ─────────────────────────────
export default function AgendaFinal() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [current, setCurrent] = useState(new Date())
  const [locale, setLocale] = useState("es-PE")

  // ─────────────────────────────
  // LOAD DATA (LOCAL + GOOGLE)
  // ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      const cid = await getCurrentClientId()

      // 🔹 LOCAL TASKS
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id,title,due_at")
        .eq("client_id", cid)

      const localEvents =
        tasks?.map((t: any) => ({
          id: "task-" + t.id,
          title: t.title,
          start: new Date(t.due_at),
          source: "local" as const,
        })) || []

      // 🔹 GOOGLE EVENTS (DESDE TU BACKEND PYTHON)
      const res = await fetch("/api/google/calendar") // ← tu endpoint
      const googleData = await res.json()

      const googleEvents =
        googleData?.map((g: any) => ({
          id: "g-" + g.id,
          title: g.summary,
          start: new Date(g.start),
          source: "google" as const,
        })) || []

      setEvents([...localEvents, ...googleEvents])
    }

    load()
  }, [])

  // ─────────────────────────────
  // MONTH GRID
  // ─────────────────────────────
  const monthGrid = useMemo(() => {
    const year = current.getFullYear()
    const month = current.getMonth()

    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)

    const offset = first.getDay()
    const cells = []

    for (let i = 0; i < offset; i++) cells.push(null)
    for (let d = 1; d <= last.getDate(); d++)
      cells.push(new Date(year, month, d))

    return cells
  }, [current])

  const next = () => {
    const d = new Date(current)
    d.setMonth(d.getMonth() + 1)
    setCurrent(d)
  }

  const prev = () => {
    const d = new Date(current)
    d.setMonth(d.getMonth() - 1)
    setCurrent(d)
  }

  // ─────────────────────────────
  // RENDER
  // ─────────────────────────────
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#0F1F63]">
          {current.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <div className="flex gap-2">
          <button onClick={prev} className="text-sm px-2">
            ◀
          </button>
          <button onClick={next} className="text-sm px-2">
            ▶
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 border border-[#E5E7EB] rounded-xl overflow-hidden">
        {monthGrid.map((date, i) =>
          date ? (
            <DayCell
              key={i}
              date={date}
              events={events.filter(
                (e) =>
                  e.start.toDateString() === date.toDateString()
              )}
            />
          ) : (
            <div key={i} className="bg-[#F9FAFB]" />
          )
        )}
      </div>
    </div>
  )
}
