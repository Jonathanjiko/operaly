"use client"

import { useEffect, useState, type ElementType } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { calculateNextRun } from "@/lib/automation-engine"
import {
  labelForLanguage,
  localeFromLanguage,
  resolveLanguageCode,
  type SupportedLanguage,
} from "@/lib/runtime-locale"
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

type Template = {
  id: string
  icon: ElementType
  color: string
  label: string
  desc: string
  defaults: { repeat_type: string; repeat_interval: number }
  placeholder: string
}

const TEMPLATES: Template[] = [
  {
    id: "health_daily",
    icon: CheckSquare,
    color: "#EF4444",
    label: "Salud diaria",
    desc: "Medicinas, controles y cuidados que no quiere volver a olvidar.",
    defaults: { repeat_type: "daily", repeat_interval: 1 },
    placeholder: "Ej: Tomar la pastilla a las 9 p. m.",
  },
  {
    id: "school_schedule",
    icon: CalendarClock,
    color: "#3B82F6",
    label: "Horario escolar",
    desc: "Para entradas, salidas y actividades semanales del colegio.",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Salida del colegio los martes a las 2 p. m.",
  },
  {
    id: "study_schedule",
    icon: CalendarClock,
    color: "#06B6D4",
    label: "Estudio o universidad",
    desc: "Para clases, entregas o bloques de estudio recurrentes.",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Clase de marketing los jueves",
  },
  {
    id: "meetings",
    icon: Clock,
    color: "#10B981",
    label: "Reuniones y salidas",
    desc: "Para avisos antes de salir, entrar o preparar una reunion importante.",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Salir a la reunion del viernes",
  },
  {
    id: "family_followup",
    icon: Repeat,
    color: "#7C3AED",
    label: "Familia y seguimiento",
    desc: "Para volver a temas familiares o pendientes con alguien cercano.",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Llamar a mis padres los domingos",
  },
  {
    id: "payments_debts",
    icon: Zap,
    color: "#F59E0B",
    label: "Pagos y deudas",
    desc: "Para servicios, bancos, tarjetas o fechas que no deben pasarse.",
    defaults: { repeat_type: "monthly", repeat_interval: 1 },
    placeholder: "Ej: Pagar la tarjeta cada mes",
  },
  {
    id: "custom",
    icon: Zap,
    color: "#6366F1",
    label: "Personalizada",
    desc: "Para cualquier rutina o seguimiento con su propio ritmo.",
    defaults: { repeat_type: "weekly", repeat_interval: 1 },
    placeholder: "Ej: Enviar reporte de avances",
  },
]

const REPEAT_LABELS: Record<string, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
}

const REPEAT_ICONS: Record<string, ElementType> = {
  daily: Clock,
  weekly: Repeat,
  monthly: CalendarClock,
}

function formatNextRun(value: string | null, locale: string) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
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
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
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

  const selectTemplate = (tpl: Template) => {
    setSelectedTemplate(tpl)
    setRepeatType(tpl.defaults.repeat_type)
    setInterval(tpl.defaults.repeat_interval)
    setStep(2)
  }

  const create = async () => {
    if (!clientId) return
    if (!title.trim()) {
      alert("Escribe un nombre para la automatizacion.")
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
      alert(err.message || "No se pudo crear la automatizacion.")
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
    if (!window.confirm("¿Eliminar esta automatizacion?")) return
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
            Deje listas las rutinas, recordatorios y seguimientos que quiere repetir sin perseguirlos a mano.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.length} activas · {items.length} en total · {labelForLanguage(language)}
          </p>
        </div>
        <Button
          onClick={openWizard}
          className="h-10 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-5 font-medium text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva automatizacion
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "En marcha", value: active.length, color: "#10B981", bg: "bg-[#F0FDF4]" },
          { label: "Pausadas", value: paused.length, color: "#F59E0B", bg: "bg-[#FFFBEB]" },
          { label: "Rutinas listas", value: items.length, color: "#3B82F6", bg: "bg-[#EFF6FF]" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl border border-border p-4 text-center`}>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Salud, familia o pagos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Organice lo que más se repite en su vida diaria sin volver a armarlo cada semana.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Horarios y seguimiento</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sirve tanto para clases y reuniones como para avisos antes de salir o entregar algo.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Control simple</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Puede activar, pausar o borrar una rutina cuando cambie su ritmo o su necesidad.
          </p>
        </div>
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
            Cree la primera y deje resuelto lo que se repite en salud, familia, pagos, estudio o reuniones.
          </p>
          <Button onClick={openWizard} className="mt-5 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB]">
            <Plus className="mr-2 h-4 w-4" /> Crear primera automatizacion
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
                  <p className="truncate font-semibold text-[#0F1F63]">{item.title || "Automatizacion"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {REPEAT_LABELS[item.repeat_type || "weekly"]} · cada {item.repeat_interval}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Proxima: {formatNextRun(item.next_run, locale)}
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
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paso {step} de 2
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-[#0F1F63]">
                  {step === 1 ? "Que tipo de automatizacion necesita" : "Configure el detalle"}
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
              <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
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
                    Que hara esta automatizacion
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
                          <Icon
                            className={`mb-1.5 h-4 w-4 ${
                              repeatType === opt.value ? "text-[#3B82F6]" : "text-muted-foreground"
                            }`}
                          />
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
                    Cada cuantas {repeatType === "daily" ? "dias" : repeatType === "weekly" ? "semanas" : "meses"}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInterval(Math.max(1, interval - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold transition-colors hover:bg-secondary"
                    >
                      -
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
                  {title || "Esta tarea"} se ejecutara {REPEAT_LABELS[repeatType]?.toLowerCase()} cada {interval}{" "}
                  {repeatType === "daily"
                    ? interval === 1
                      ? "dia"
                      : "dias"
                    : repeatType === "weekly"
                      ? interval === 1
                        ? "semana"
                        : "semanas"
                      : interval === 1
                        ? "mes"
                        : "meses"}
                  .
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
                    className="h-11 flex-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] font-medium text-white hover:opacity-90"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Crear automatizacion
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
