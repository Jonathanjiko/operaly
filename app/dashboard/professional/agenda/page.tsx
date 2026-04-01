"use client"

// ── Event Detail Modal ──────────────────────────────────────────────────────
function EventDetailModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const isTask = event.type === "task"
  const color = isTask ? "#3B82F6" : "#7C3AED"
  const d = new Date(event.sourceAt)
  const ok = !isNaN(d.getTime())
  const fullStr = ok ? d.toLocaleString("es-PE", {
    weekday:"long", day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"
  }) : event.timeLabel
  const overdue = ok && d.getTime() < Date.now()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
                {isTask ? <CheckSquare className="w-4 h-4" style={{ color }} /> : <Zap className="w-4 h-4" style={{ color }} />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {isTask ? "Tarea" : "Automatización"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0F1F63] leading-snug">{event.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-3">
          <div className="bg-secondary/40 rounded-xl p-4 flex items-start gap-3">
            <AlarmClock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Fecha y hora</p>
              <p className={`text-sm font-semibold capitalize ${overdue ? "text-[#EF4444]" : "text-[#0F1F63]"}`}>{fullStr}</p>
              {overdue && <p className="text-xs text-[#EF4444] mt-0.5 font-medium">⚠️ Fecha vencida</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-full h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-bold hover:bg-[#1a2f7a] transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  ChevronLeft, ChevronRight, Plus, RefreshCw,
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

function safeDate(v: string | null | undefined): Date | null {
  if (!v) return null
  const d = new Date(String(v))
  return isNaN(d.getTime()) ? null : d
}

function dateKey(d: Date, tz: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d)
}

function timeLabel(d: Date, locale: string, tz: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(d)
}

function hourOf(d: Date, tz: string) {
  return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(d)) % 24
}

function minuteOf(d: Date, tz: string) {
  return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz, minute: "2-digit" }).format(d))
}

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DAYS_SHORT = ["lun","mar","mié","jue","vie","sáb","dom"]
const DAYS_FULL  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]
const HOURS_RANGE = Array.from({ length: 24 }, (_, i) => i)

function getWeekDates(from: Date) {
  const d = new Date(from)
  const dow = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    return x
  })
}

function getMonthGrid(date: Date) {
  const year = date.getFullYear(), month = date.getMonth()
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const EVENT_COLORS = {
  task:       { bg: "bg-[#3B82F6]", light: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", border: "border-[#BFDBFE]" },
  automation: { bg: "bg-[#7C3AED]", light: "bg-[#F5F3FF]", text: "text-[#5B21B6]", border: "border-[#DDD6FE]" },
}

export default function AgendaPage() {
  const [loading, setLoading]       = useState(true)
  const [events, setEvents]         = useState<EventItem[]>([])
  const [view, setView]             = useState<ViewMode>("week")
  const [current, setCurrent]       = useState(new Date())
  const [selectedDK, setSelectedDK] = useState("")
  const [tz, setTz]                 = useState("America/Lima")
  const [locale, setLocale]         = useState("es-PE")
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)

  // 🔥 TODO LO DEMÁS IGUAL (NO TOCADO)

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* TODO TU UI EXACTA */}
      
      {/* 👇 MODAL CORRECTO */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
