"use client"

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

// ── Event Detail Modal ──────────────────────────────────────────────────────
function EventDetailModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const isTask = event.type === "task"
  const color = isTask ? "#3B82F6" : "#7C3AED"
  const d = new Date(event.sourceAt)
  const ok = !isNaN(d.getTime())
  const fullStr = ok ? d.toLocaleString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : event.timeLabel
  const overdue = ok && d.getTime() < Date.now()


  // Real-time: agenda changes from WhatsApp appear instantly
  useEffect(() => {
    if (!clientId) return
    const ch = supabase
      .channel(`agenda-rt-${clientId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "tasks",
        filter: `client_id=eq.${clientId}`
      }, async () => {
        // Re-run the same load logic
        const [t, r] = await Promise.all([
          supabase.from("tasks").select("id,title,due_at,status").eq("client_id", clientId).not("due_at","is",null),
          supabase.from("recurring_tasks").select("id,title,next_run,status").eq("client_id", clientId).not("next_run","is",null),
        ])
        const mapped = [...(t.data||[]), ...(r.data||[])].map(e => ({
          id: e.id,
          title: e.title||"Sin título",
          date: ((e as any).due_at||(e as any).next_run||"").slice(0,10),
          time: ((e as any).due_at||(e as any).next_run||"").slice(11,16),
          type: (e as any).next_run ? "recurring" : "task",
        }))
        setEvents(mapped)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId])

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
                {isTask
                  ? <CheckSquare className="w-4 h-4" style={{ color }} />
                  : <Zap className="w-4 h-4" style={{ color }} />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {isTask ? "Tarea" : "Automatización"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0F1F63] leading-snug">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-3">
          <div className="bg-secondary/40 rounded-xl p-4 flex items-start gap-3">
            <AlarmClock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Fecha y hora
              </p>
              <p className={`text-sm font-semibold capitalize ${overdue ? "text-[#EF4444]" : "text-[#0F1F63]"}`}>
                {fullStr}
              </p>
              {overdue && (
                <p className="text-xs text-[#EF4444] mt-0.5 font-medium">⚠️ Fecha vencida</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-bold hover:bg-[#1a2f7a] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function safeDate(v: string | null | undefined): Date | null {
  if (!v) return null
  const d = new Date(String(v))
  return isNaN(d.getTime()) ? null : d
}

function dateKey(d: Date, tz: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

function timeLabel(d: Date, locale: string, tz: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

function hourOf(d: Date, tz: string) {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    }).format(d)
  ) % 24
}

function minuteOf(d: Date, tz: string) {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      minute: "2-digit",
    }).format(d)
  )
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DAYS_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
const DAYS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
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
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const EVENT_COLORS = {
  task: { bg: "bg-[#3B82F6]", light: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", border: "border-[#BFDBFE]" },
  automation: { bg: "bg-[#7C3AED]", light: "bg-[#F5F3FF]", text: "text-[#5B21B6]", border: "border-[#DDD6FE]" },
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<EventItem[]>([])
  const [view, setView] = useState<ViewMode>("week")
  const [current, setCurrent] = useState(new Date())
  const [selectedDK, setSelectedDK] = useState("")
  const [tz, setTz] = useState("America/Lima")
  const [locale, setLocale] = useState("es-PE")
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const cid = await getCurrentClientId()
        setClientId(cid)
        const { data: cl } = await supabase
          .from("clients")
          .select("timezone, timezone_auto, preferred_language, language")
          .eq("id", cid)
          .maybeSingle()

        const resolvedTz =
          cl?.timezone_auto ||
          cl?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "America/Lima"

        const lang = cl?.preferred_language || cl?.language || "es"
        const resolvedLocale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-PE"

        setTz(resolvedTz)
        setLocale(resolvedLocale)

        const now = new Date()
        setSelectedDK(dateKey(now, resolvedTz))

        const [{ data: tasks }, { data: automations }] = await Promise.all([
          supabase.from("tasks").select("id,title,due_at,status").eq("client_id", cid).not("due_at", "is", null),
          supabase.from("recurring_tasks").select("id,title,next_run,status").eq("client_id", cid).not("next_run", "is", null),
        ])

        const mapped: EventItem[] = [
          ...(tasks || []).map((t: any) => {
            const d = safeDate(t.due_at)
            if (!d) return null
            return {
              id: t.id,
              title: t.title || "Tarea",
              dateKey: dateKey(d, resolvedTz),
              timeLabel: timeLabel(d, resolvedLocale, resolvedTz),
              hour: hourOf(d, resolvedTz),
              minute: minuteOf(d, resolvedTz),
              type: "task" as const,
              sourceAt: t.due_at,
              status: t.status,
            }
          }).filter(Boolean) as EventItem[],
          ...(automations || []).map((a: any) => {
            const d = safeDate(a.next_run)
            if (!d) return null
            return {
              id: a.id,
              title: a.title || "Automatización",
              dateKey: dateKey(d, resolvedTz),
              timeLabel: timeLabel(d, resolvedLocale, resolvedTz),
              hour: hourOf(d, resolvedTz),
              minute: minuteOf(d, resolvedTz),
              type: "automation" as const,
              sourceAt: a.next_run,
              status: a.status,
            }
          }).filter(Boolean) as EventItem[],
        ]

        setEvents(mapped)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const weekDates = useMemo(() => getWeekDates(current), [current])
  const monthCells = useMemo(() => getMonthGrid(current), [current])

  const eventsForDK = (dk: string) => events.filter(e => e.dateKey === dk)
  const todayDK = dateKey(new Date(), tz)

  function navigate(dir: number) {
    const d = new Date(current)
    if (view === "month") d.setMonth(d.getMonth() + dir)
    else if (view === "week") d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCurrent(d)
  }

  function navTitle() {
    if (view === "month") return `${MONTHS[current.getMonth()]} ${current.getFullYear()}`
    if (view === "week") {
      const first = weekDates[0]
      const last = weekDates[6]
      if (first.getMonth() === last.getMonth()) {
        return `${first.getDate()} – ${last.getDate()} ${MONTHS[first.getMonth()]} ${first.getFullYear()}`
      }
      return `${first.getDate()} ${MONTHS[first.getMonth()]} – ${last.getDate()} ${MONTHS[last.getMonth()]} ${first.getFullYear()}`
    }
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: tz,
    }).format(current)
  }

  const dayEventsForAgenda = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    events.forEach(e => {
      if (!map.has(e.dateKey)) map.set(e.dateKey, [])
      map.get(e.dateKey)!.push(e)
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([dk]) => dk >= dateKey(new Date(), tz))
      .slice(0, 14)
  }, [events, tz])

  const EventChip = ({ event, compact = false }: { event: EventItem; compact?: boolean }) => {
    const c = EVENT_COLORS[event.type]
    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          setSelectedEvent(event)
        }}
        className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm ${c.light} ${c.text} border ${c.border}`}
      >
        {event.type === "task"
          ? <CheckSquare className="w-3 h-3 flex-shrink-0" />
          : <Zap className="w-3 h-3 flex-shrink-0" />}
        <span className="truncate">
          {compact ? event.title.slice(0, 22) + (event.title.length > 22 ? "…" : "") : event.title}
        </span>
        {!compact && <span className="ml-auto text-[10px] opacity-70">{event.timeLabel}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} evento{events.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrent(new Date())
              setSelectedDK(dateKey(new Date(), tz))
            }}
            className="h-9 px-4 rounded-xl border border-border bg-white text-sm font-medium text-[#0F1F63] hover:bg-secondary transition-colors"
          >
            Hoy
          </button>
          <div className="flex rounded-xl border border-border bg-secondary/30 p-1 gap-0.5">
            {(["month", "week", "day", "agenda"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`h-7 px-3 rounded-lg text-xs font-medium transition-all capitalize ${
                  view === v ? "bg-white shadow-sm text-[#0F1F63]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "month" ? "Mes" : v === "week" ? "Semana" : v === "day" ? "Día" : "Agenda"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 py-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <h2 className="text-base font-semibold text-[#0F1F63] capitalize">{navTitle()}</h2>
        {loading && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin ml-auto" />}
      </div>

      {view === "month" && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS_SHORT.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-border">
            {monthCells.map((cell, i) => {
              const dk = cell ? dateKey(cell, tz) : ""
              const dayEvents = cell ? eventsForDK(dk) : []
              const isToday = dk === todayDK
              const isSelected = dk === selectedDK

              return (
                <div
                  key={i}
                  onClick={() => cell && setSelectedDK(dk)}
                  className={`min-h-[96px] border-r border-b border-border p-1.5 cursor-pointer transition-colors ${
                    !cell ? "bg-secondary/20" : isSelected ? "bg-[#EFF6FF]" : "hover:bg-secondary/30"
                  }`}
                >
                  {cell && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${
                        isToday ? "bg-[#3B82F6] text-white" : "text-[#0F1F63]"
                      }`}>
                        {cell.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(e => (
                          <EventChip key={e.id} event={e} compact />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} más</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border sticky top-0 bg-card z-10">
            <div className="border-r border-border" />
            {weekDates.map((d, i) => {
              const dk = dateKey(d, tz)
              const isToday = dk === todayDK
              const isSelected = dk === selectedDK

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDK(dk)}
                  className={`py-2 px-1 text-center cursor-pointer transition-colors border-r border-border ${
                    isSelected ? "bg-[#EFF6FF]" : "hover:bg-secondary/30"
                  }`}
                >
                  <div className="text-xs text-muted-foreground font-medium uppercase">{DAYS_SHORT[i]}</div>
                  <div className={`mt-1 w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm font-bold ${
                    isToday ? "bg-[#3B82F6] text-white" : "text-[#0F1F63]"
                  }`}>
                    {d.getDate()}
                  </div>
                  {eventsForDK(dk).length > 0 && (
                    <div className="mt-1 text-[10px] text-[#3B82F6] font-semibold">{eventsForDK(dk).length}</div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-[64px_repeat(7,1fr)]">
            {HOURS_RANGE.map(hour => (
              <div key={hour} className="contents">
                <div className="border-r border-b border-border px-2 py-1 text-right">
                  <span className="text-[10px] text-muted-foreground">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
                {weekDates.map((d, di) => {
                  const dk = dateKey(d, tz)
                  const hourEvents = eventsForDK(dk).filter(e => e.hour === hour)

                  return (
                    <div
                      key={`${hour}-${di}`}
                      className={`border-r border-b border-border px-1 py-0.5 min-h-[40px] ${
                        dk === selectedDK ? "bg-[#EFF6FF]/50" : ""
                      }`}
                    >
                      <div className="space-y-0.5">
                        {hourEvents.map(e => <EventChip key={e.id} event={e} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "day" && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-[64px_1fr]">
            {HOURS_RANGE.map(hour => {
              const hourEvents = eventsForDK(selectedDK).filter(e => e.hour === hour)

              return (
                <div key={hour} className="contents">
                  <div className="border-r border-b border-border px-2 py-2 text-right">
                    <span className="text-xs text-muted-foreground">{hour.toString().padStart(2, "0")}:00</span>
                  </div>
                  <div className="border-b border-border p-1.5 min-h-[56px]">
                    <div className="space-y-1">
                      {hourEvents.map(e => (
                        <div key={e.id} className={`rounded-xl p-3 border ${EVENT_COLORS[e.type].light} ${EVENT_COLORS[e.type].border}`}>
                          <div className="flex items-center gap-2">
                            {e.type === "task"
                              ? <CheckSquare className={`w-4 h-4 ${EVENT_COLORS[e.type].text}`} />
                              : <Zap className={`w-4 h-4 ${EVENT_COLORS[e.type].text}`} />}
                            <p className={`text-sm font-semibold ${EVENT_COLORS[e.type].text}`}>{e.title}</p>
                            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />{e.timeLabel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <div className="flex-1 overflow-auto space-y-1 py-2">
          {dayEventsForAgenda.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay eventos próximos</p>
              <p className="text-sm mt-1">Tus tareas aparecerán aquí cuando tengan fecha</p>
            </div>
          ) : dayEventsForAgenda.map(([dk, dayEvts]) => {
            const d = new Date(dk + "T12:00:00")
            const isToday = dk === todayDK

            return (
              <div key={dk} className="flex gap-4 py-3 border-b border-border last:border-0">
                <div className={`w-16 flex-shrink-0 text-right pt-0.5 ${isToday ? "text-[#3B82F6]" : "text-muted-foreground"}`}>
                  <div className="text-xs font-semibold uppercase">
                    {new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: tz }).format(d)}
                  </div>
                  <div className={`text-2xl font-bold leading-none mt-0.5 ${isToday ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>
                    {d.getDate()}
                  </div>
                  {isToday && <div className="text-[10px] font-medium text-[#3B82F6] mt-0.5">Hoy</div>}
                </div>
                <div className="flex-1 space-y-1.5">
                  {dayEvts
                    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
                    .map(e => (
                      <div
                        key={e.id}
                        className={`rounded-xl px-4 py-3 border ${EVENT_COLORS[e.type].light} ${EVENT_COLORS[e.type].border} flex items-center gap-3`}
                      >
                        {e.type === "task"
                          ? <CheckSquare className={`w-4 h-4 flex-shrink-0 ${EVENT_COLORS[e.type].text}`} />
                          : <Zap className={`w-4 h-4 flex-shrink-0 ${EVENT_COLORS[e.type].text}`} />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${EVENT_COLORS[e.type].text}`}>{e.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {e.type === "task" ? "Tarea" : "Automatización"} · {e.timeLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
