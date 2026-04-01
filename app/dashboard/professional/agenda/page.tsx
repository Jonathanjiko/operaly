"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  ChevronLeft, ChevronRight, X, CalendarDays,
  CheckSquare, Zap, Clock, RefreshCw
} from "lucide-react"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type EventItem = {
  id: string
  title: string
  date: Date
  type: "task" | "automation"
}

// ─────────────────────────────────────────────
// MODAL (EDIT READY)
// ─────────────────────────────────────────────
function EventModal({ event, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X />
        </button>

        <h2 className="text-lg font-bold">{event.title}</h2>

        <p className="text-sm text-gray-500 mt-2">
          {event.date.toLocaleString()}
        </p>

        <div className="mt-4">
          <button className="w-full bg-blue-600 text-white rounded-lg py-2">
            Editar (próximo paso)
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function AgendaPro() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [current, setCurrent] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)

  // ── LOAD DATA ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const cid = await getCurrentClientId()

        const { data } = await supabase
          .from("tasks")
          .select("id,title,due_at")
          .eq("client_id", cid)

        const mapped =
          data?.map((t: any) => ({
            id: t.id,
            title: t.title,
            date: new Date(t.due_at),
            type: "task",
          })) || []

        setEvents(mapped)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  const daysInMonth = useMemo(() => {
    const year = current.getFullYear()
    const month = current.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }, [current])

  const startDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay()

  function navigate(dir: number) {
    const d = new Date(current)
    if (view === "month") d.setMonth(d.getMonth() + dir)
    if (view === "week") d.setDate(d.getDate() + dir * 7)
    if (view === "day") d.setDate(d.getDate() + dir)
    setCurrent(d)
  }

  // ─────────────────────────────────────────────
  // RENDER MONTH
  // ─────────────────────────────────────────────
  const renderMonth = () => {
    const cells = []

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={"empty" + i} />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(current.getFullYear(), current.getMonth(), d)

      const dayEvents = events.filter(
        (e) =>
          e.date.toDateString() === date.toDateString()
      )

      cells.push(
        <div
          key={d}
          className="border h-28 p-2 flex flex-col gap-1 hover:bg-gray-50"
        >
          <span className="text-xs font-bold">{d}</span>

          {dayEvents.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelected(e)}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-200"
            >
              {e.title}
            </div>
          ))}
        </div>
      )
    }

    return <div className="grid grid-cols-7 gap-px bg-gray-200">{cells}</div>
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agenda</h1>

        <div className="flex gap-2">
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-3 py-1 rounded ${
                view === v ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* NAV */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft />
        </button>

        <button onClick={() => navigate(1)}>
          <ChevronRight />
        </button>

        <span className="font-semibold">
          {current.toLocaleDateString("es", {
            month: "long",
            year: "numeric",
          })}
        </span>

        {loading && <RefreshCw className="animate-spin ml-2" />}
      </div>

      {/* CONTENT */}
      {view === "month" && renderMonth()}

      {/* MODAL */}
      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
