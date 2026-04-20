"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { calculateNextRun } from "@/lib/automation-engine"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import {
  CalendarClock,
  CheckSquare,
  ChevronRight,
  Clock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
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
    icon: Clock,
    color: "#3B82F6",
    label: "Recordatorio semanal",
    desc: "Para algo que quiere volver a ver cada semana",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Revisar pagos pendientes",
  },
  {
    id: "task_daily",
    icon: CheckSquare,
    color: "#10B981",
    label: "Tarea diaria",
    desc: "Para algo que se repite todos los días",
    defaults: { repeat_type: "daily", repeat_interval: 1 },
    placeholder: "Ej: Revisar agenda del día",
  },
  {
    id: "followup_monthly",
    icon: CalendarClock,
    color: "#7C3AED",
    label: "Seguimiento mensual",
    desc: "Para volver a un tema cada mes",
    defaults: { repeat_type: "monthly", repeat_interval: 1 },
    placeholder: "Ej: Llamar a clientes activos",
  },
  {
    id: "custom",
    icon: Zap,
    color: "#F59E0B",
    label: "Personalizada",
    desc: "Para elegir su propio ritmo",
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

export default function AutomatizacionesPage() {
  const [clientId, setClientId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<RecurringTaskRow[]>([])
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
      } finally {
        setLoading(false)
      }
    }
    void init()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Automatizaciones</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Deja listas las tareas y recordatorios que quieres repetir.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.length} activas · {items.length} en total · {labelForLanguage(language)}
          </p>
        </div>
        <Button
          onClick={openWizard}
          className="h-10 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-5 text-white font-medium hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva automatización
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
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" /> Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 to-[#7C3AED]/10">
            <Zap className="h-7 w-7 text-[#7C3AED]" />
          </div>
          <p className="text-lg font-semibold text-[#0F1F63]">Sin automatizaciones aún</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Crea la primera y deja listo lo que no quieres volver a perseguir a mano.
          </p>
          <Button onClick={openWizard} className="mt-5 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB]">
            <Plus className="mr-2 h-4 w-4" /> Crear primera automatización
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
                className={`flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all ${
                  isActive ? "border-border" : "border-border opacity-60"
                }`}
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                    isActive ? "bg-gradient-to-br from-[#3B82F6]/10 to-[#7C3AED]/10" : "bg-secondary"
                  }`}
                >
                  <RepeatIcon className={`h-5 w-5 ${isActive ? "text-[#3B82F6]" : "text-muted-foreground"}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0F1F63]">{item.title || "Automatización"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {REPEAT_LABELS[item.repeat_type || "weekly"]} · cada {item.repeat_interval}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Próxima: {formatNextRun(item.next_run, locale)}
                    </span>
                  </div>
                </div>

                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    isActive ? "bg-[#10B981]/10 text-[#059669]" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isActive ? "Activa" : "Pausada"}
                </span>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => void toggle(item.id, item.status)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
                    title={isActive ? "Pausar" : "Activar"}
                  >
                    {isActive ? (
                      <Pause className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Play className="h-4 w-4 text-[#10B981]" />
                    )}
                  </button>
                  <button
                    onClick={() => void remove(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#FEF2F2]"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
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
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paso {step} de 2
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-[#0F1F63]">
                  {step === 1 ? "¿Qué tipo de automatización?" : "Configura el detalle"}
                </h3>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 p-5">
                {TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => selectTemplate(tpl)}
                      className="group rounded-2xl border border-border bg-background p-4 text-left transition-all hover:border-[#3B82F6]/40 hover:bg-[#EFF6FF]/50"
                    >
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${tpl.color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: tpl.color }} />
                      </div>
                      <p className="text-sm font-semibold text-[#0F1F63] group-hover:text-[#1D4ED8]">{tpl.label}</p>
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">{tpl.desc}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#3B82F6] opacity-0 transition-opacity group-hover:opacity-100">
                        Seleccionar <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 2 && selectedTemplate && (
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${selectedTemplate.color}15` }}
                  >
                    <selectedTemplate.icon className="h-4 w-4" style={{ color: selectedTemplate.color }} />
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
                  <label className="mb-1.5 block text-sm font-medium text-[#0F1F63]">
                    ¿Qué hace esta automatización?
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={selectedTemplate.placeholder}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F1F63]">Frecuencia</label>
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
                          className={`rounded-xl border p-3 text-left transition-all ${
                            repeatType === opt.value
                              ? "border-[#3B82F6] bg-[#EFF6FF]"
                              : "border-border bg-background hover:border-[#3B82F6]/40"
                          }`}
                        >
                          <Icon className={`mb-1.5 h-4 w-4 ${repeatType === opt.value ? "text-[#3B82F6]" : "text-muted-foreground"}`} />
                          <p className={`text-xs font-semibold ${repeatType === opt.value ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>
                            {opt.label}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F1F63]">
                    Cada ¿cuántas {repeatType === "daily" ? "días" : repeatType === "weekly" ? "semanas" : "meses"}?
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInterval(Math.max(1, interval - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold transition-colors hover:bg-secondary"
                    >
                      −
                    </button>
                    <div className="flex h-10 flex-1 items-center justify-center rounded-xl border border-[#3B82F6]/30 bg-[#EFF6FF] text-lg font-bold text-[#1D4ED8]">
                      {interval}
                    </div>
                    <button
                      type="button"
                      onClick={() => setInterval(interval + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold transition-colors hover:bg-secondary"
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
                    className="h-11 flex-1 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    Cancelar
                  </button>
                  <Button
                    onClick={create}
                    disabled={saving || !title.trim()}
                    className="h-11 flex-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white font-medium hover:opacity-90"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
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
