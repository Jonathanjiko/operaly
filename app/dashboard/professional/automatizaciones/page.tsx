"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { calculateNextRun } from "@/lib/automation-engine"
import {
  fetchProfessionalRuntime,
  normalizeRuntimeStatus,
  type ProfessionalRuntimeSnapshot,
} from "@/lib/professional-runtime"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import {
  Bell,
  CalendarClock,
  CheckSquare,
  ChevronRight,
  Clock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type RecurringTaskRow = {
  id: string
  client_id: string
  title: string | null
  repeat_type: string | null
  repeat_interval: number | null
  status: string | null
  start_at: string | null
  next_run: string | null
}

const TEMPLATES = [
  {
    id: "reminder_weekly",
    icon: Bell,
    color: "#3B82F6",
    label: "Recordatorio semanal",
    desc: "Te avisa cada semana sobre algo importante",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Revisar pagos pendientes",
  },
  {
    id: "task_daily",
    icon: CheckSquare,
    color: "#10B981",
    label: "Tarea diaria",
    desc: "Una acción que repites todos los días",
    defaults: { repeat_type: "daily", repeat_interval: 1 },
    placeholder: "Ej: Revisar agenda del día",
  },
  {
    id: "followup_monthly",
    icon: CalendarClock,
    color: "#7C3AED",
    label: "Seguimiento mensual",
    desc: "Recordatorio de seguimiento cada mes",
    defaults: { repeat_type: "monthly", repeat_interval: 1 },
    placeholder: "Ej: Llamar a clientes activos",
  },
  {
    id: "custom",
    icon: Zap,
    color: "#F59E0B",
    label: "Personalizada",
    desc: "Configura tu propio ritmo y frecuencia",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Enviar reporte de avances",
  },
] as const

const REPEAT_LABELS: Record<string, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
}

const REPEAT_ICONS: Record<string, React.ElementType> = {
  daily: Clock,
  weekly: Repeat,
  monthly: CalendarClock,
}

function formatNextRun(value: string | null, locale: string) {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

function isAutomationEvent(eventType: string | null | undefined) {
  const normalized = String(eventType || "").toLowerCase()
  return normalized.includes("automation") || normalized.includes("recurring")
}

export default function AutomatizacionesPage() {
  const [clientId, setClientId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<RecurringTaskRow[]>([])
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<ProfessionalRuntimeSnapshot | null>(null)
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [locale, setLocale] = useState("es-PE")
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const [selectedTemplate, setSelectedTemplate] = useState<(typeof TEMPLATES)[number] | null>(null)
  const [title, setTitle] = useState("")
  const [repeatType, setRepeatType] = useState("weekly")
  const [interval, setInterval] = useState(1)

  useEffect(() => {
    const init = async () => {
      try {
        const id = await getCurrentClientId()
        setClientId(id)

        const { data: client } = await supabase
          .from("clients")
          .select("preferred_language, language")
          .eq("id", id)
          .maybeSingle()

        const resolvedLanguage = resolveLanguageCode(client?.preferred_language || client?.language || "es")
        setLanguage(resolvedLanguage)
        setLocale(localeFromLanguage(resolvedLanguage))

        await load(id)
        try {
          setRuntimeSnapshot(await fetchProfessionalRuntime())
        } catch (runtimeError) {
          console.error("No se pudo cargar runtime de automatizaciones:", runtimeError)
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const load = async (cid: string) => {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .select("*")
      .eq("client_id", cid)
      .order("created_at", { ascending: false })

    if (error) throw error
    setItems((data || []) as RecurringTaskRow[])
  }

  const openWizard = () => {
    setStep(1)
    setSelectedTemplate(null)
    setTitle("")
    setRepeatType("weekly")
    setInterval(1)
    setShowWizard(true)
  }

  const selectTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    setSelectedTemplate(tpl)
    setRepeatType(tpl.defaults.repeat_type)
    setInterval(tpl.defaults.repeat_interval)
    setStep(2)
  }

  const create = async () => {
    if (!clientId) return
    if (!title.trim()) {
      alert("Escribe un nombre para la automatización.")
      return
    }
    if (interval < 1) {
      alert("El intervalo debe ser al menos 1.")
      return
    }
    setSaving(true)
    try {
      const startAt = new Date().toISOString()
      const nextRun = calculateNextRun({
        start_at: startAt,
        repeat_type: repeatType,
        repeat_interval: interval,
      })
      const { error } = await supabase.from("recurring_tasks").insert({
        client_id: clientId,
        title: title.trim(),
        repeat_type: repeatType,
        repeat_interval: interval,
        status: "active",
        start_at: startAt,
        next_run: nextRun.toISOString(),
      })
      if (error) throw error
      setShowWizard(false)
      await load(clientId)
    } catch (err: any) {
      alert(err.message || "No se pudo crear la automatización.")
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (id: string, status: string | null) => {
    try {
      const next = status === "active" ? "paused" : "active"
      const { error } = await supabase
        .from("recurring_tasks")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
      await load(clientId)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("¿Eliminar esta automatización?")) return
    try {
      const { error } = await supabase.from("recurring_tasks").delete().eq("id", id)
      if (error) throw error
      await load(clientId)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const active = items.filter((item) => item.status === "active")
  const paused = items.filter((item) => item.status !== "active")
  const recentAutomationEvents = useMemo(() => {
    return (runtimeSnapshot?.recentEvents || []).filter((event) => isAutomationEvent(event?.event_type)).slice(0, 4)
  }, [runtimeSnapshot])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Automatizaciones</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Tareas que Operaly ejecuta por ti sin que tengas que recordarlas
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sincronizado con Supabase y WhatsApp · {labelForLanguage(language)} · {locale}
          </p>
        </div>
        <Button
          onClick={openWizard}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva automatización
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Activas", value: active.length, color: "#10B981", bg: "bg-[#F0FDF4]" },
          { label: "Pausadas", value: paused.length, color: "#F59E0B", bg: "bg-[#FFFBEB]" },
          { label: "Total", value: items.length, color: "#3B82F6", bg: "bg-[#EFF6FF]" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl border border-border p-4 text-center`}>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0F1F63]" />
            <h2 className="text-lg font-semibold text-[#0F1F63]">Estado operativo</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Este módulo ya muestra las recurrencias visibles en Supabase y ayuda a separar lo que ya está guardado de la ejecución viva que WhatsApp debe honrar.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Visibles</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{items.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Automatizaciones persistidas en tu cuenta.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Activas</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{active.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Listas para dispararse según su siguiente ejecución.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Señal backend</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {recentAutomationEvents.length > 0 ? "Con señal" : "Pendiente"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">La ejecución real por WhatsApp todavía depende de la siguiente capa backend.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F1F63]">Señales recientes</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aquí aparecerán los eventos recientes cuando el backend registre activaciones, pausas o ejecuciones de recurrencias.
          </p>
          <div className="mt-4 space-y-3">
            {recentAutomationEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                Aún no hay eventos recientes de automatizaciones en runtime.
              </div>
            ) : (
              recentAutomationEvents.map((event) => (
                <div key={String(event.id || event.created_at)} className="rounded-2xl border border-border bg-secondary/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Runtime</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
                    {normalizeRuntimeStatus(String(event.event_type || "automation_event"))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.created_at ? new Date(event.created_at).toLocaleString(locale) : "—"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" /> Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 to-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-[#7C3AED]" />
          </div>
          <p className="font-semibold text-[#0F1F63] text-lg">Sin automatizaciones aún</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Crea tu primera automatización y deja que Operaly haga el seguimiento por ti
          </p>
          <Button onClick={openWizard} className="mt-5 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB]">
            <Plus className="w-4 h-4 mr-2" /> Crear primera automatización
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const RepeatIcon = REPEAT_ICONS[item.repeat_type || "weekly"] || Repeat
            const isActive = item.status === "active"
            return (
              <div
                key={item.id}
                className={`bg-card rounded-2xl border p-5 flex items-center gap-4 transition-all ${
                  isActive ? "border-border" : "border-border opacity-60"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-gradient-to-br from-[#3B82F6]/10 to-[#7C3AED]/10" : "bg-secondary"
                  }`}
                >
                  <RepeatIcon className={`w-5 h-5 ${isActive ? "text-[#3B82F6]" : "text-muted-foreground"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F1F63] truncate">{item.title || "Automatización"}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {REPEAT_LABELS[item.repeat_type || "weekly"]} · cada {item.repeat_interval}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Próxima: {formatNextRun(item.next_run, locale)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                    isActive ? "bg-[#10B981]/10 text-[#059669]" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isActive ? "Activa" : "Pausada"}
                </span>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggle(item.id, item.status)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                    title={isActive ? "Pausar" : "Activar"}
                  >
                    {isActive ? (
                      <Pause className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Play className="w-4 h-4 text-[#10B981]" />
                    )}
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWizard(false)} />
          <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paso {step} de 2
                </p>
                <h3 className="text-lg font-bold text-[#0F1F63] mt-0.5">
                  {step === 1 ? "¿Qué tipo de automatización?" : "Configura el detalle"}
                </h3>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {step === 1 && (
              <div className="p-5 grid grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => selectTemplate(tpl)}
                      className="group p-4 rounded-2xl border border-border bg-background hover:border-[#3B82F6]/40 hover:bg-[#EFF6FF]/50 text-left transition-all"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${tpl.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: tpl.color }} />
                      </div>
                      <p className="font-semibold text-sm text-[#0F1F63] group-hover:text-[#1D4ED8]">{tpl.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{tpl.desc}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity">
                        Seleccionar <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 2 && selectedTemplate && (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selectedTemplate.color}15` }}
                  >
                    <selectedTemplate.icon className="w-4 h-4" style={{ color: selectedTemplate.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0F1F63]">{selectedTemplate.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.desc}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-[#3B82F6] hover:underline">
                    Cambiar
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1F63] mb-1.5">
                    ¿Qué hace esta automatización?
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={selectedTemplate.placeholder}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1F63] mb-1.5">Frecuencia</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "daily", label: "Diaria", icon: Clock },
                      { value: "weekly", label: "Semanal", icon: Repeat },
                      { value: "monthly", label: "Mensual", icon: CalendarClock },
                    ].map((opt) => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRepeatType(opt.value)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            repeatType === opt.value
                              ? "border-[#3B82F6] bg-[#EFF6FF]"
                              : "border-border bg-background hover:border-[#3B82F6]/40"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1.5 ${repeatType === opt.value ? "text-[#3B82F6]" : "text-muted-foreground"}`} />
                          <p className={`text-xs font-semibold ${repeatType === opt.value ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>
                            {opt.label}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1F63] mb-1.5">
                    Cada ¿cuántas {repeatType === "daily" ? "días" : repeatType === "weekly" ? "semanas" : "meses"}?
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInterval(Math.max(1, interval - 1))}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-lg font-bold hover:bg-secondary transition-colors"
                    >
                      −
                    </button>
                    <div className="flex-1 h-10 rounded-xl border border-[#3B82F6]/30 bg-[#EFF6FF] flex items-center justify-center text-lg font-bold text-[#1D4ED8]">
                      {interval}
                    </div>
                    <button
                      type="button"
                      onClick={() => setInterval(interval + 1)}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-lg font-bold hover:bg-secondary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-secondary/50 p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-[#0F1F63]">Resumen:</span>{" "}
                  {title || "Esta tarea"} se ejecutará {REPEAT_LABELS[repeatType]?.toLowerCase()} cada {interval}{" "}
                  {repeatType === "daily"
                    ? interval === 1 ? "día" : "días"
                    : repeatType === "weekly"
                      ? interval === 1 ? "semana" : "semanas"
                      : interval === 1 ? "mes" : "meses"}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Cancelar
                  </button>
                  <Button
                    onClick={create}
                    disabled={saving || !title.trim()}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white font-medium hover:opacity-90"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Crear automatización
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
