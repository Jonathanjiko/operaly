"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  ChevronLeft, ChevronRight, RefreshCw,
  Zap, CheckSquare, Clock, CalendarDays, X, AlarmClock,
} from "lucide-react"

type EventItem = {
  id: string
  title: string
  dateKey: string
  timeLabel: string
  hour: number
  minute: number
  type: "task" | "automation"
  sourceAt: string
  status?: string
}

type ViewMode = "month" | "week" | "day" | "agenda"

// ── Modal ─────────────────────────────────────────────
function EventDetailModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const isTask = event.type === "task"
  const color = isTask ? "#3B82F6" : "#7C3AED"
  const d = new Date(event.sourceAt)
  const ok = !isNaN(d.getTime())

  const fullStr = ok
    ? d.toLocaleString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : event.timeLabel

  const overdue = ok && d.getTime() < Date.now()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color + "15" }}
              >
                {isTask ? (
                  <CheckSquare className="w-4 h-4" style={{ color }} />
                ) : (
                  <Zap className="w-4 h-4" style={{ color }} />
                )}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {isTask ? "Tarea" : "Automatización"}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#0F1F63]">{event.title}</h2>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <div className="bg-secondary/40 rounded-xl p-4 flex items-start gap-3">
            <AlarmClock className="w-4 h-4 mt-0.5" style={{ color }} />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Fecha y hora
              </p>
              <p className={`text-sm font-semibold ${overdue ? "text-red-500" : ""}`}>
                {fullStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────
export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [current, setCurrent] = useState(new Date())

  useEffect(() => {
    const load = async () => {
      try {
        const cid = await getCurrentClientId()

        const { data } = await supabase
          .from("tasks")
          .select("id,title,due_at,status")
          .eq("client_id", cid)

        const mapped =
          data?.map((t: any) => {
            const d = new Date(t.due_at)
            return {
              id: t.id,
              title: t.title,
              dateKey: d.toISOString().split("T")[0],
              timeLabel: d.toLocaleTimeString(),
              hour: d.getHours(),
              minute: d.getMinutes(),
              type: "task" as const,
              sourceAt: t.due_at,
            }
          }) || []

        setEvents(mapped)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agenda</h1>

      {loading ? (
        <div className="flex gap-2 items-center">
          <RefreshCw className="animate-spin w-4 h-4" /> Cargando...
        </div>
      ) : events.length === 0 ? (
        <div>No hay eventos</div>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelectedEvent(e)}
              className="p-3 border rounded-xl cursor-pointer hover:bg-gray-50"
            >
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-gray-500">{e.timeLabel}</p>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL CORRECTO */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
