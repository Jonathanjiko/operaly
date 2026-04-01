"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

// ─────────────────────────────
// TYPES
// ─────────────────────────────
type EventItem = {
  id: string
  title: string
  date: Date
}

// ─────────────────────────────
// EVENT BLOCK (INLINE EDIT)
// ─────────────────────────────
function EventBlock({ event, onUpdate }: any) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(event.title)

  const save = () => {
    setEditing(false)
    if (value !== event.title) onUpdate(event.id, value)
  }

  return (
    <div
      className="group text-[12px] px-2 py-1 rounded-md bg-[#E8F0FE] text-[#1D4ED8] hover:bg-[#DBEAFE] transition cursor-pointer"
      onClick={() => setEditing(true)}
    >
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save()
            if (e.key === "Escape") setEditing(false)
          }}
          className="w-full bg-white text-xs outline-none rounded px-1"
        />
      ) : (
        <span className="block truncate">{event.title}</span>
      )}
    </div>
  )
}

// ─────────────────────────────
// DAY CELL
// ─────────────────────────────
function DayCell({ date, events, onCreate, onUpdate, locale }: any) {
  const [creating, setCreating] = useState(false)
  const [value, setValue] = useState("")

  const handleCreate = () => {
    if (!value.trim()) return
    onCreate(value, date)
    setValue("")
    setCreating(false)
  }

  return (
    <div className="relative min-h-[110px] p-2 border border-[#E5E7EB] bg-white hover:bg-[#FAFAFA] transition">
      {/* DAY NUMBER */}
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-semibold text-[#374151]">
          {date.getDate()}
        </span>

        <button
          onClick={() => setCreating(true)}
          className="opacity-0 hover:opacity-100 group-hover:opacity-100 text-gray-400 text-xs"
        >
          +
        </button>
      </div>

      {/* EVENTS */}
      <div className="flex flex-col gap-1">
        {events.map((e: EventItem) => (
          <EventBlock key={e.id} event={e} onUpdate={onUpdate} />
        ))}

        {/* CREATE INLINE */}
        {creating && (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate()
              if (e.key === "Escape") setCreating(false)
            }}
            placeholder="Nueva tarea..."
            className="text-xs border rounded px-1 py-0.5 outline-none"
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────
// MAIN
// ─────────────────────────────
export default function AgendaPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [current, setCurrent] = useState(new Date())
  const [locale, setLocale] = useState("es-PE")

  // ── LOAD
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
    }

    load()
  }, [])

  // ── CREATE
  const createEvent = (title: string, date: Date) => {
    setEvents((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        title,
        date,
      },
    ])
  }

  // ── UPDATE
  const updateEvent = (id: string, title: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title } : e))
    )
  }

  // ── GRID
  const monthGrid = useMemo(() => {
    const year = current.getFullYear()
    const month = current.getMonth()

    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)

    const startOffset = first.getDay()

    const cells = []

    for (let i = 0; i < startOffset; i++) cells.push(null)

    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(year, month, d))
    }

    return cells
  }, [current])

  // ── NAV
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

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          {current.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <div className="flex gap-2">
          <button onClick={prev}>◀</button>
          <button onClick={next}>▶</button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 border border-[#E5E7EB] rounded-xl overflow-hidden">
        {monthGrid.map((date, i) => {
          if (!date) return <div key={i} className="bg-[#F9FAFB]" />

          const dayEvents = events.filter(
            (e) => e.date.toDateString() === date.toDateString()
          )

          return (
            <DayCell
              key={i}
              date={date}
              events={dayEvents}
              onCreate={createEvent}
              onUpdate={updateEvent}
              locale={locale}
            />
          )
        })}
      </div>
    </div>
  )
}
