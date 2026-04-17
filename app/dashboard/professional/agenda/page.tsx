"use client"

import { useEffect, useMemo, useState } from "react"
import { AlarmClock, CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Clock, RefreshCw, X, Zap } from "lucide-react"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

type EventItem = { id: string; title: string; dateKey: string; timeLabel: string; hour: number; minute: number; type: "task" | "automation"; sourceAt: string }
type ViewMode = "month" | "week" | "day" | "agenda"
type GoogleProduct = "calendar" | "drive" | "gmail" | "contacts"
type GoogleProductState = {
  enabled?: boolean | null
  sync_status?: string | null
  last_synced_at?: string | null
  last_error?: string | null
}
type GoogleStatusPayload = {
  products?: Partial<Record<GoogleProduct, GoogleProductState>>
  calendar?: GoogleProductState
  contacts?: GoogleProductState
  connection?: {
    authorized_products?: string[] | null
  } | null
}

type DashboardAgendaPayload = {
  events?: Array<Record<string, any>>
  google_calendar_count?: number
  google_calendar_connected?: boolean
}

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: { title: "Agenda", subtitle: "Vea su dia con claridad y sin enredos.", sync: "Se mantiene al dia con sus cambios", reminder: "Lo que programe aqui ayuda a que Operaly le recuerde, le acompane y no pierda contexto.", task: "Tarea", automation: "Automatizacion", dateTime: "Fecha y hora", close: "Cerrar", today: "Hoy", month: "Mes", week: "Semana", day: "Dia", agenda: "Agenda", more: "mas", noEvents: "No tiene nada proximo", noEventsHint: "Lo que programe aparecera aqui.", totalEvents: "eventos" },
  en: { title: "Agenda", subtitle: "Operational view of dates, reminders, and active automations.", sync: "Synced with Supabase and WhatsApp", reminder: "By contract, scheduled items respect timezone and use the default 10-minute reminder unless changed explicitly.", task: "Task", automation: "Automation", dateTime: "Date and time", close: "Close", today: "Today", month: "Month", week: "Week", day: "Day", agenda: "Agenda", more: "more", noEvents: "No upcoming events", noEventsHint: "Your dated tasks and automations will appear here.", totalEvents: "total events" },
  pt: { title: "Agenda", subtitle: "Visão operacional de datas, lembretes e automações ativas.", sync: "Sincronizado com Supabase e WhatsApp", reminder: "Por contrato, o que é programado aqui respeita o fuso e usa lembrete base de 10 min salvo ajuste explícito.", task: "Tarefa", automation: "Automação", dateTime: "Data e hora", close: "Fechar", today: "Hoje", month: "Mês", week: "Semana", day: "Dia", agenda: "Agenda", more: "mais", noEvents: "Sem próximos eventos", noEventsHint: "Suas tarefas e automações com data aparecerão aqui.", totalEvents: "eventos no total" },
  de: { title: "Agenda", subtitle: "Operative Ansicht von Terminen, Erinnerungen und aktiven Automationen.", sync: "Mit Supabase und WhatsApp synchronisiert", reminder: "Geplante Elemente respektieren den Zeitzonen-Vertrag und nutzen standardmäßig einen 10-Minuten-Reminder.", task: "Aufgabe", automation: "Automatisierung", dateTime: "Datum und Uhrzeit", close: "Schließen", today: "Heute", month: "Monat", week: "Woche", day: "Tag", agenda: "Agenda", more: "mehr", noEvents: "Keine bevorstehenden Termine", noEventsHint: "Deine datierten Aufgaben und Automationen erscheinen hier.", totalEvents: "Ereignisse gesamt" },
  fr: { title: "Agenda", subtitle: "Vue opérationnelle des dates, rappels et automatisations actives.", sync: "Synchronisé avec Supabase et WhatsApp", reminder: "Par contrat, ce qui est programmé ici respecte le fuseau et le rappel de base de 10 min sauf changement explicite.", task: "Tâche", automation: "Automatisation", dateTime: "Date et heure", close: "Fermer", today: "Aujourd’hui", month: "Mois", week: "Semaine", day: "Jour", agenda: "Agenda", more: "plus", noEvents: "Aucun événement à venir", noEventsHint: "Tes tâches et automatisations datées apparaîtront ici.", totalEvents: "événements au total" },
  it: { title: "Agenda", subtitle: "Vista operativa di date, promemoria e automazioni attive.", sync: "Sincronizzato con Supabase e WhatsApp", reminder: "Per contratto, ciò che programmi qui rispetta il fuso e il promemoria base di 10 min salvo modifica esplicita.", task: "Attività", automation: "Automazione", dateTime: "Data e ora", close: "Chiudi", today: "Oggi", month: "Mese", week: "Settimana", day: "Giorno", agenda: "Agenda", more: "altro", noEvents: "Nessun evento imminente", noEventsHint: "Le attività e automazioni con data appariranno qui.", totalEvents: "eventi totali" },
}

function safeDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function dateKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
}

function timeLabel(date: Date, locale: string, timezone: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: timezone, hour: "2-digit", minute: "2-digit" }).format(date)
}

function weekdayShort(date: Date, locale: string, timezone: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: timezone, weekday: "short" }).format(date)
}

function monthLabel(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date)
}

function asArray<T = Record<string, any>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

const AGENDA_FETCH_TIMEOUT_MS = 8000

async function fetchWithAgendaTimeout(input: string, init: RequestInit) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), AGENDA_FETCH_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("La agenda auth-bound tardó demasiado. Supabase o el backend siguen degradados.")
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

function getWeekDates(source: Date) {
  const date = new Date(source)
  const dayOfWeek = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday)
    next.setDate(monday.getDate() + index)
    return next
  })
}

function getMonthGrid(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const cells: (Date | null)[] = []
  for (let index = 0; index < startOffset; index += 1) cells.push(null)
  for (let day = 1; day <= last.getDate(); day += 1) cells.push(new Date(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function EventDetail({ event, locale, language, onClose }: { event: EventItem; locale: string; language: SupportedLanguage; onClose: () => void }) {
  const copy = COPY[language]
  const isTask = event.type === "task"
  const color = isTask ? "#3B82F6" : "#7C3AED"
  const sourceDate = new Date(event.sourceAt)
  const fullLabel = Number.isNaN(sourceDate.getTime()) ? event.timeLabel : sourceDate.toLocaleString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>{isTask ? <CheckSquare className="w-4 h-4" style={{ color }} /> : <Zap className="w-4 h-4" style={{ color }} />}</div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{isTask ? copy.task : copy.automation}</span>
            </div>
            <h2 className="text-lg font-bold text-[#0F1F63] leading-snug">{event.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 pb-6 space-y-3">
          <div className="bg-secondary/40 rounded-xl p-4 flex items-start gap-3">
            <AlarmClock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{copy.dateTime}</p>
              <p className="text-sm font-semibold capitalize text-[#0F1F63]">{fullLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-full h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-bold hover:bg-[#1a2f7a]">{copy.close}</button>
        </div>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<EventItem[]>([])
  const [view, setView] = useState<ViewMode>("week")
  const [current, setCurrent] = useState(new Date())
  const [selectedKey, setSelectedKey] = useState("")
  const [timezone, setTimezone] = useState("America/Lima")
  const [locale, setLocale] = useState("es-PE")
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [clientId, setClientId] = useState("")
  const [contactSignals, setContactSignals] = useState({
    total: 0,
    birthdays: 0,
    withEmail: 0,
    googleLike: 0,
  })
  const [googleSignals, setGoogleSignals] = useState({
    calendarConnected: false,
    contactsConnected: false,
    calendarSyncStatus: "",
    contactsSyncStatus: "",
  })
  const [agendaSource, setAgendaSource] = useState<"auth_bound" | "fallback" | "mixed" | "unknown">("unknown")
  const [agendaWarning, setAgendaWarning] = useState("")

  const copy = COPY[language]

  async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error("No hay sesión activa.")
    return { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const init = async () => {
      setAgendaWarning("")
      try {
        const currentClientId = await getCurrentClientId()
        setClientId(currentClientId)
        const { data: client } = await supabase
          .from("clients")
          .select("timezone,timezone_auto,preferred_language,language")
          .eq("id", currentClientId)
          .maybeSingle()
        const resolvedTimezone = client?.timezone_auto || client?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima"
        const resolvedLanguage = resolveLanguageCode(client?.preferred_language || client?.language || "es")
        const resolvedLocale = localeFromLanguage(resolvedLanguage)
        setTimezone(resolvedTimezone)
        setLanguage(resolvedLanguage)
        setLocale(resolvedLocale)
        const todayKey = dateKey(new Date(), resolvedTimezone)
        setSelectedKey(todayKey)

        const headers = await getAuthHeaders().catch(() => null)
        let usedDashboardAgenda = false

        const [{ data: tasks }, { data: recurring }, { data: contacts }] = await Promise.all([
          supabase.from("tasks").select("id,title,due_at").eq("client_id", currentClientId).not("due_at", "is", null),
          supabase.from("recurring_tasks").select("id,title,next_run").eq("client_id", currentClientId).not("next_run", "is", null),
          supabase.from("contacts").select("id,email,birthday,source").eq("client_id", currentClientId),
        ])

        if (headers) {
          try {
            const dashboardAgendaResponse = await fetchWithAgendaTimeout("/api/dashboard/agenda", {
              method: "GET",
              headers,
              cache: "no-store",
            })
            const dashboardAgendaPayload = (await dashboardAgendaResponse.json().catch(() => ({}))) as DashboardAgendaPayload
            if (dashboardAgendaResponse.ok) {
              const liveEvents = asArray<Record<string, any>>(dashboardAgendaPayload?.events)
                .map((event) => {
                  const sourceAt = String(
                    event.scheduled_at ||
                      event.start_at ||
                      event.starts_at ||
                      event.start_time ||
                      event.due_at ||
                      ""
                  )
                  const date = safeDate(sourceAt)
                  if (!date) return null
                  return {
                    id: String(event.id || event.external_id || event.google_event_id || Math.random()),
                    title: String(event.title || event.summary || event.name || copy.task),
                    dateKey: dateKey(date, resolvedTimezone),
                    timeLabel: timeLabel(date, resolvedLocale, resolvedTimezone),
                    hour:
                      Number(
                        new Intl.DateTimeFormat("en-US", {
                          timeZone: resolvedTimezone,
                          hour: "numeric",
                          hour12: false,
                        }).format(date)
                      ) % 24,
                    minute: Number(
                      new Intl.DateTimeFormat("en-US", {
                        timeZone: resolvedTimezone,
                        minute: "2-digit",
                      }).format(date)
                    ),
                    type: String(event.type || event.kind || event.source || "").toLowerCase().includes("automation")
                      ? ("automation" as const)
                      : ("task" as const),
                    sourceAt,
                  }
                })
                .filter(Boolean) as EventItem[]

              if (liveEvents.length > 0) {
                usedDashboardAgenda = true
                setEvents(liveEvents)
                setAgendaSource("auth_bound")
              }
              if (!liveEvents.length) setAgendaSource("mixed")

              setGoogleSignals((current) => ({
                ...current,
                calendarConnected:
                  Boolean(dashboardAgendaPayload?.google_calendar_connected) ||
                  Number(dashboardAgendaPayload?.google_calendar_count || 0) > 0,
              }))
            }
          } catch (dashboardAgendaError) {
            console.error("No se pudo leer la agenda auth-bound:", dashboardAgendaError)
            setAgendaWarning(
              dashboardAgendaError instanceof Error
                ? dashboardAgendaError.message
                : "La agenda auth-bound no respondió a tiempo. Se muestran datos degradados."
            )
          }
        }

        if (!usedDashboardAgenda) {
          const mapped = [
            ...(tasks || []).map((task) => {
              const date = safeDate(task.due_at)
              if (!date) return null
              return { id: task.id, title: task.title || copy.task, dateKey: dateKey(date, resolvedTimezone), timeLabel: timeLabel(date, resolvedLocale, resolvedTimezone), hour: Number(new Intl.DateTimeFormat("en-US", { timeZone: resolvedTimezone, hour: "numeric", hour12: false }).format(date)) % 24, minute: Number(new Intl.DateTimeFormat("en-US", { timeZone: resolvedTimezone, minute: "2-digit" }).format(date)), type: "task" as const, sourceAt: task.due_at }
            }),
            ...(recurring || []).map((automation) => {
              const date = safeDate(automation.next_run)
              if (!date) return null
              return { id: automation.id, title: automation.title || copy.automation, dateKey: dateKey(date, resolvedTimezone), timeLabel: timeLabel(date, resolvedLocale, resolvedTimezone), hour: Number(new Intl.DateTimeFormat("en-US", { timeZone: resolvedTimezone, hour: "numeric", hour12: false }).format(date)) % 24, minute: Number(new Intl.DateTimeFormat("en-US", { timeZone: resolvedTimezone, minute: "2-digit" }).format(date)), type: "automation" as const, sourceAt: automation.next_run }
            }),
          ].filter(Boolean) as EventItem[]

          setEvents(mapped)
          setAgendaSource("fallback")
        }

        const contactRows = contacts || []
        setContactSignals({
          total: contactRows.length,
          birthdays: contactRows.filter((contact) => Boolean(contact.birthday)).length,
          withEmail: contactRows.filter((contact) => Boolean(contact.email)).length,
          googleLike: contactRows.filter((contact) => {
            const source = String(contact.source || "").toLowerCase()
            return source.includes("google") || source.includes("merge")
          }).length,
        })
        try {
          const googleHeaders = headers || (await getAuthHeaders().catch(() => null))
          const googleResponse = await fetchWithAgendaTimeout("/api/google/status", {
            method: "GET",
            headers: googleHeaders || undefined,
            cache: "no-store",
          })
          const googlePayload = (await googleResponse.json().catch(() => ({}))) as GoogleStatusPayload
          if (googleResponse.ok) {
            const authorizedProducts = googlePayload?.connection?.authorized_products || []
            const calendarState = googlePayload?.products?.calendar || googlePayload?.calendar || null
            const contactsState = googlePayload?.products?.contacts || googlePayload?.contacts || null
            setGoogleSignals({
              calendarConnected: Boolean(calendarState?.enabled) || authorizedProducts.includes("calendar"),
              contactsConnected: Boolean(contactsState?.enabled) || authorizedProducts.includes("contacts"),
              calendarSyncStatus: String(calendarState?.sync_status || ""),
              contactsSyncStatus: String(contactsState?.sync_status || ""),
            })
          }
        } catch (googleError) {
          console.error("No se pudo leer el estado Google de agenda:", googleError)
          setAgendaWarning((current) =>
            current || "No se pudo confirmar Google en tiempo útil. La agenda sigue mostrando el mejor estado local disponible."
          )
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [reloadKey])

  useEffect(() => {
    if (!clientId) return
    const channel = supabase
      .channel(`agenda-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `client_id=eq.${clientId}` }, () => setReloadKey((prev) => prev + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "recurring_tasks", filter: `client_id=eq.${clientId}` }, () => setReloadKey((prev) => prev + 1))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setReloadKey((prev) => prev + 1)
    }, 45000)
    return () => window.clearInterval(interval)
  }, [])

  const weekDates = useMemo(() => getWeekDates(current), [current])
  const monthGrid = useMemo(() => getMonthGrid(current), [current])
  const todayKey = dateKey(new Date(), timezone)
  const eventsForKey = (currentKey: string) => events.filter((event) => event.dateKey === currentKey)

  function navigate(direction: number) {
    const next = new Date(current)
    if (view === "month") next.setMonth(next.getMonth() + direction)
    else if (view === "week") next.setDate(next.getDate() + (direction * 7))
    else next.setDate(next.getDate() + direction)
    setCurrent(next)
  }

  function navTitle() {
    if (view === "month") return `${monthLabel(current, locale)} ${current.getFullYear()}`
    if (view === "week") {
      const first = weekDates[0]
      const last = weekDates[6]
      return `${first.getDate()} ${monthLabel(first, locale)} – ${last.getDate()} ${monthLabel(last, locale)}`
    }
    return new Intl.DateTimeFormat(locale, { timeZone: timezone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(current)
  }

  const agendaItems = useMemo(() => {
    const grouped = new Map<string, EventItem[]>()
    events.forEach((event) => {
      if (!grouped.has(event.dateKey)) grouped.set(event.dateKey, [])
      grouped.get(event.dateKey)!.push(event)
    })
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).filter(([key]) => key >= todayKey).slice(0, 14)
  }, [events, todayKey])

  const hours = Array.from({ length: 24 }, (_, index) => index)

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">{copy.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{events.length} {copy.totalEvents}</p>
          <p className="text-xs text-muted-foreground mt-1">{copy.sync} · {labelForLanguage(language)} · {locale} · {timezone}</p>
          <p className="text-xs text-[#5F6B7A] mt-1">{copy.reminder}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {agendaSource === "auth_bound"
              ? "Leyendo agenda desde el snapshot auth-bound con señal viva de Google Calendar."
              : agendaSource === "mixed"
                ? "El snapshot auth-bound respondió, pero sin eventos visibles; se complementa con tareas locales."
                : agendaSource === "fallback"
                  ? "Mostrando tareas y automatizaciones locales mientras la lectura auth-bound no respondió."
                  : "Preparando lectura operativa de la agenda."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setReloadKey((prev) => prev + 1)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary" title="Actualizar agenda">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setCurrent(new Date()); setSelectedKey(todayKey) }} className="h-9 px-4 rounded-xl border border-border bg-white text-sm font-medium text-[#0F1F63] hover:bg-secondary">{copy.today}</button>
          <div className="flex rounded-xl border border-border bg-secondary/30 p-1 gap-0.5">
            {(["month", "week", "day", "agenda"] as ViewMode[]).map((mode) => <button key={mode} onClick={() => setView(mode)} className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${view === mode ? "bg-white shadow-sm text-[#0F1F63]" : "text-muted-foreground hover:text-foreground"}`}>{copy[mode]}</button>)}
          </div>
        </div>
      </div>

      {agendaWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {agendaWarning}
        </div>
      ) : null}

      <div className="flex items-center gap-3 py-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => navigate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
        <h2 className="text-base font-semibold text-[#0F1F63] capitalize">{navTitle()}</h2>
        {loading && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin ml-auto" />}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">en agenda</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{events.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Todo lo que ya tiene programado para hoy o despues.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">personas</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{contactSignals.total}</p>
          <p className="mt-1 text-xs text-muted-foreground">Personas listas para reuniones, correos y seguimiento.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">cumpleanos</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{contactSignals.birthdays}</p>
          <p className="mt-1 text-xs text-slate-600">Pueden ayudarle a preparar recordatorios, saludos y seguimiento.</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-600">apoyo google</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{contactSignals.googleLike > 0 ? "Visible" : "Pendiente"}</p>
          <p className="mt-1 text-xs text-slate-600">{contactSignals.googleLike} contacto{contactSignals.googleLike !== 1 ? "s" : ""} de Google o ya unido{contactSignals.googleLike !== 1 ? "s" : ""}.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${googleSignals.calendarConnected ? "border-emerald-200 bg-emerald-50" : "border-sky-200 bg-sky-50"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">google calendar</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleSignals.calendarConnected ? "Conectado" : "Pendiente"}</p>
          <p className="mt-1 text-xs text-slate-600">
            {googleSignals.calendarConnected
              ? "Su calendario ya puede ayudar a completar lo que ve aqui y lo que pregunta por WhatsApp."
              : "Su agenda ya funciona aqui. Cuando conecte Google Calendar, tambien podra ver lo que agregue desde fuera."}
          </p>
        </div>
        <div className={`rounded-2xl border p-4 ${googleSignals.contactsConnected ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">personas para agenda</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {googleSignals.contactsConnected ? "Listas para usar" : contactSignals.googleLike > 0 ? "Con apoyo de Google" : "Base interna"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {googleSignals.contactsConnected
              ? "Sus personas ya pueden ayudar a completar reuniones, cumpleaños y contexto."
              : "Por ahora esta agenda se apoya en su libreta interna y en lo que ya se haya unido desde Google."}
          </p>
        </div>
      </div>

      <div className={`rounded-2xl border px-4 py-3 text-sm ${contactSignals.googleLike > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
        {contactSignals.googleLike > 0
          ? "Esta agenda ya puede apoyarse en personas sincronizadas para reuniones, cumpleaños y contexto."
          : "La agenda ya usa su base interna de personas. Cuando Google Contacts quede listo, aqui deberia sentirse mejor el apoyo por persona."}
      </div>

      {view === "month" && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDates.map((date) => <div key={`day-${date.toISOString()}`} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{weekdayShort(date, locale, timezone)}</div>)}
          </div>
          <div className="grid grid-cols-7 border-l border-border">
            {monthGrid.map((cell, index) => {
              const key = cell ? dateKey(cell, timezone) : ""
              const dayEvents = cell ? eventsForKey(key) : []
              const isToday = key === todayKey
              const isSelected = key === selectedKey
              return (
                <div key={`${key}-${index}`} onClick={() => cell && setSelectedKey(key)} className={`min-h-[96px] border-r border-b border-border p-1.5 cursor-pointer ${!cell ? "bg-secondary/20" : isSelected ? "bg-[#EFF6FF]" : "hover:bg-secondary/30"}`}>
                  {cell && <>
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${isToday ? "bg-[#3B82F6] text-white" : "text-[#0F1F63]"}`}>{cell.getDate()}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => <button key={event.id} onClick={(evt) => { evt.stopPropagation(); setSelectedEvent(event) }} className={`w-full text-left rounded-lg px-2 py-1 text-xs font-semibold border ${event.type === "task" ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" : "bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]"}`}>{event.title}</button>)}
                      {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} {copy.more}</div>}
                    </div>
                  </>}
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
            {weekDates.map((date) => {
              const key = dateKey(date, timezone)
              const isToday = key === todayKey
              const isSelected = key === selectedKey
              return (
                <div key={key} onClick={() => setSelectedKey(key)} className={`py-2 px-1 text-center cursor-pointer border-r border-border ${isSelected ? "bg-[#EFF6FF]" : "hover:bg-secondary/30"}`}>
                  <div className="text-xs text-muted-foreground font-medium uppercase">{weekdayShort(date, locale, timezone)}</div>
                  <div className={`mt-1 w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-[#3B82F6] text-white" : "text-[#0F1F63]"}`}>{date.getDate()}</div>
                  {eventsForKey(key).length > 0 && <div className="mt-1 text-[10px] text-[#3B82F6] font-semibold">{eventsForKey(key).length}</div>}
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-[64px_repeat(7,1fr)]">
            {hours.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-r border-b border-border px-2 py-1 text-right"><span className="text-[10px] text-muted-foreground">{String(hour).padStart(2, "0")}:00</span></div>
                {weekDates.map((date) => {
                  const key = dateKey(date, timezone)
                  const hourEvents = eventsForKey(key).filter((event) => event.hour === hour)
                  return (
                    <div key={`${key}-${hour}`} className={`border-r border-b border-border px-1 py-0.5 min-h-[40px] ${key === selectedKey ? "bg-[#EFF6FF]/50" : ""}`}>
                      <div className="space-y-0.5">
                        {hourEvents.map((event) => <button key={event.id} onClick={() => setSelectedEvent(event)} className={`w-full text-left rounded-lg px-2 py-1 text-xs font-semibold border ${event.type === "task" ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" : "bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]"}`}>{event.title} · {event.timeLabel}</button>)}
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
            {hours.map((hour) => {
              const hourEvents = eventsForKey(selectedKey).filter((event) => event.hour === hour)
              return (
                <div key={hour} className="contents">
                  <div className="border-r border-b border-border px-2 py-2 text-right"><span className="text-xs text-muted-foreground">{String(hour).padStart(2, "0")}:00</span></div>
                  <div className="border-b border-border p-1.5 min-h-[56px]">
                    <div className="space-y-1">
                      {hourEvents.map((event) => (
                        <button key={event.id} onClick={() => setSelectedEvent(event)} className={`w-full rounded-xl p-3 border text-left ${event.type === "task" ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]" : "bg-[#F5F3FF] border-[#DDD6FE] text-[#5B21B6]"}`}>
                          <div className="flex items-center gap-2">
                            {event.type === "task" ? <CheckSquare className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                            <p className="text-sm font-semibold">{event.title}</p>
                            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{event.timeLabel}</span>
                          </div>
                        </button>
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
          {agendaItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{copy.noEvents}</p>
              <p className="text-sm mt-1">{copy.noEventsHint}</p>
            </div>
          ) : agendaItems.map(([key, items]) => {
            const date = new Date(`${key}T12:00:00`)
            const isToday = key === todayKey
            return (
              <div key={key} className="flex gap-4 py-3 border-b border-border last:border-0">
                <div className={`w-16 flex-shrink-0 text-right pt-0.5 ${isToday ? "text-[#3B82F6]" : "text-muted-foreground"}`}>
                  <div className="text-xs font-semibold uppercase">{weekdayShort(date, locale, timezone)}</div>
                  <div className={`text-2xl font-bold leading-none mt-0.5 ${isToday ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>{date.getDate()}</div>
                  {isToday && <div className="text-[10px] font-medium text-[#3B82F6] mt-0.5">{copy.today}</div>}
                </div>
                <div className="flex-1 space-y-1.5">
                  {items.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)).map((event) => (
                    <button key={event.id} onClick={() => setSelectedEvent(event)} className={`w-full rounded-xl px-4 py-3 border flex items-center gap-3 text-left ${event.type === "task" ? "bg-[#EFF6FF] border-[#BFDBFE]" : "bg-[#F5F3FF] border-[#DDD6FE]"}`}>
                      {event.type === "task" ? <CheckSquare className="w-4 h-4 flex-shrink-0 text-[#1D4ED8]" /> : <Zap className="w-4 h-4 flex-shrink-0 text-[#5B21B6]" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${event.type === "task" ? "text-[#1D4ED8]" : "text-[#5B21B6]"}`}>{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.type === "task" ? copy.task : copy.automation} · {event.timeLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedEvent && <EventDetail event={selectedEvent} locale={locale} language={language} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}
