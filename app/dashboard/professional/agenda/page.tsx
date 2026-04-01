"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  ChevronLeft, ChevronRight, X,
  Plus, CalendarDays, Clock
} from "lucide-react"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type EventItem = {
  id: string
  title: string
  date: Date
}

// ─────────────────────────────────────────────
// MODAL (EDITABLE)
// ─────────────────────────────────────────────
function EventModal({ event, onClose }: any) {
  const [title, setTitle] = useState(event.title)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X />
        </button>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-bold outline-none"
        />

        <p className="text-sm text-gray-500 mt-2">
          {event.date.toLocaleString()}
        </p>

        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function AgendaUltra() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [current, setCurrent] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)

  // ── LOAD DATA
  useEffect(() => {
    const load = async () => {
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
        })) || []

      setEvents(mapped)
      setLoading(false)
    }

    load()
  }, [])

  // ─────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────
  function navigate(dir: number) {
    const d = new Date(current)
    if (view === "month") d.setMonth(d.getMonth() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCurrent(d)
  }

  // ─────────────────────────────────────────────
  // MONTH VIEW
  // ─────────────────────────────────────────────
  const renderMonth = () => {
    const year = current.getFullYear()
    const month = current.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const days = new Date(year, month + 1, 0).getDate()

    const cells = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={"empty" + i} />)
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d)

      const dayEvents = events.filter(
        (e) => e.date.toDateString() === date.toDateString()
      )

      cells.push(
        <div
          key={d}
          className="h-28 border bg-white p-2 flex flex-col gap-1 group hover:bg-gray-50 transition"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">{d}</span>

            <button
              onClick={() =>
                setEvents((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(),
                    title: "Nueva tarea",
                    date,
                  },
                ])
              }
              className="opacity-0 group-hover:opacity-100 transition"
            >
              <Plus size={14} />
            </button>
          </div>

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

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
        {cells}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // WEEK VIEW (PRO)
  // ─────────────────────────────────────────────
  const renderWeek = () => {
    const start = new Date(current)
    start.setDate(start.getDate() - start.getDay())

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })

    return (
      <div className="grid grid-cols-7 border rounded-xl overflow-hidden">
        {days.map((day, i) => (
          <div key={i} className="border h-96 p-2">
            <p className="text-xs font-bold mb-2">
              {day.toLocaleDateString("es", { weekday: "short", day: "numeric" })}
            </p>

            {events
              .filter((e) => e.date.toDateString() === day.toDateString())
              .map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 mb-1 rounded cursor-pointer"
                >
                  {e.title}
                </div>
              ))}
          </div>
        ))}
      </div>
    )
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
          {["month", "week"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-3 py-1 rounded-lg text-sm ${
                view === v
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
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

        <span className="font-semibold capitalize">
          {current.toLocaleDateString("es", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div>Cargando...</div>
      ) : view === "month" ? (
        renderMonth()
      ) : (
        renderWeek()
      )}

      {/* MODAL */}
      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
