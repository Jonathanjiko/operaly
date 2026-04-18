"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Bot,
  Save,
  RefreshCw,
  Sparkles,
  User,
  MessageSquare,
  Briefcase,
  Brain,
  ChevronRight,
  Check,
  Scale,
  Heart,
  Stethoscope,
  Calculator,
  PenTool,
  TrendingUp,
  GraduationCap,
  Code2,
  Megaphone,
  HelpCircle,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  fetchProfessionalRuntime,
  normalizeRuntimeStatus,
  type ProfessionalRuntimeSnapshot,
} from "@/lib/professional-runtime"
import { fetchDashboardJson, fetchDashboardRuntime } from "@/lib/dashboard-runtime"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { getEffectivePlanCode, type EffectiveLimitsRuntime } from "@/lib/effective-limits"
import { getDisplayPlanName } from "@/lib/plans"

const PROFESSIONS = [
  { code: "abogado", label: "Legal", sublabel: "Abogado / Notario", icon: Scale, color: "#3B82F6" },
  { code: "medico", label: "Salud", sublabel: "Medico / Terapeuta", icon: Stethoscope, color: "#10B981" },
  { code: "contador", label: "Finanzas", sublabel: "Contador / Auditor", icon: Calculator, color: "#F59E0B" },
  { code: "arquitecto", label: "Diseno", sublabel: "Arquitecto / Disenador", icon: PenTool, color: "#8B5CF6" },
  { code: "consultor", label: "Estrategia", sublabel: "Consultor / Asesor", icon: TrendingUp, color: "#06B6D4" },
  { code: "coach", label: "Bienestar", sublabel: "Coach / Mentor", icon: Heart, color: "#EF4444" },
  { code: "emprendedor", label: "Startup", sublabel: "Fundador / Emprendedor", icon: Building2, color: "#7C3AED" },
  { code: "vendedor", label: "Ventas", sublabel: "Comercial / Agente", icon: Megaphone, color: "#F97316" },
  { code: "educador", label: "Educacion", sublabel: "Docente / Formador", icon: GraduationCap, color: "#14B8A6" },
  { code: "ingeniero", label: "Tecnologia", sublabel: "Ingeniero / Dev", icon: Code2, color: "#6366F1" },
  { code: "creativo", label: "Publicidad", sublabel: "Creativo / Marketing", icon: Sparkles, color: "#EC4899" },
  { code: "otro", label: "Otro", sublabel: "Personalizado", icon: HelpCircle, color: "#94A3B8" },
]

const TONES = [
  { code: "profesional", label: "Profesional", desc: "Formal, estructurado y preciso" },
  { code: "calido", label: "Calido", desc: "Cercano, empatico y humano" },
  { code: "directo", label: "Directo", desc: "Conciso y sin rodeos" },
  { code: "formal", label: "Formal", desc: "Muy estructurado y protocolar" },
  { code: "amigable", label: "Amigable", desc: "Natural y conversacional" },
]

const STYLES = [
  { code: "breve", label: "Breve", desc: "Corto y al punto" },
  { code: "detallado", label: "Detallado", desc: "Completo y bien explicado" },
  { code: "balanceado", label: "Balanceado", desc: "Se adapta a la pregunta" },
]

const TREATMENTS = [
  { code: "", label: "Sin tratamiento" },
  { code: "Dr.", label: "Dr. / Dra." },
  { code: "Lic.", label: "Lic." },
  { code: "Ing.", label: "Ing." },
  { code: "Prof.", label: "Prof." },
  { code: "Arq.", label: "Arq." },
]

function formatRuntimeDate(value: unknown) {
  if (!value) return "Sin marca visible"
  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return "Sin marca visible"
  return parsed.toLocaleString("es-PE")
}

function confidenceLabel(value: unknown) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return "Sin confianza visible"
  return `${Math.round(numeric * 100)}%`
}

export default function AsistentePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientId, setClientId] = useState("")
  const [planCode, setPlanCode] = useState("trial")
  const [customAgentEnabled, setCustomAgentEnabled] = useState(false)
  const [professionCode, setProfessionCode] = useState("consultor")
  const [preferredName, setPreferredName] = useState("")
  const [treatment, setTreatment] = useState("")
  const [tone, setTone] = useState("profesional")
  const [style, setStyle] = useState("balanceado")
  const [customContext, setCustomContext] = useState("")
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [lastSavedAt, setLastSavedAt] = useState("")
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<ProfessionalRuntimeSnapshot | null>(null)
  const [runtimeSource, setRuntimeSource] = useState<"auth_bound" | "legacy" | "unknown">("unknown")
  const [operationalWarning, setOperationalWarning] = useState("")

  useEffect(() => {
    loadConfig()
  }, [])

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error("No hay sesión activa.")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const loadConfig = async () => {
    setLoading(true)
    setLoadError("")
    setOperationalWarning("")
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      let client:
        | {
            profession_code?: string | null
            preferred_name?: string | null
            treatment?: string | null
            preferred_style?: string | null
            plan_code?: string | null
          }
        | null = null

      try {
        const assistantPayload = await fetchDashboardJson<{
          client?: {
            profession_code?: string | null
            preferred_name?: string | null
            treatment?: string | null
            preferred_style?: string | null
            plan_code?: string | null
          } | null
          preferences?: Record<string, string>
        }>("/api/dashboard/assistant")

        client = assistantPayload?.client || null
        if (client) {
          setProfessionCode(client.profession_code || "consultor")
          setPreferredName(client.preferred_name || "")
          setTreatment(client.treatment || "")
          setStyle(client.preferred_style || "balanceado")
        }

        const prefs = assistantPayload?.preferences || {}
        setTone(prefs.assistant_tone || "profesional")
        setCustomContext(prefs.assistant_context || "")
        if (!client?.profession_code) setProfessionCode(prefs.assistant_profession || "consultor")
        if (!client?.preferred_style) setStyle(prefs.assistant_style || "balanceado")
      } catch (assistantError) {
        console.error("No se pudo cargar snapshot auth-bound del asistente:", assistantError)
        setOperationalWarning("La lectura auth-bound del asistente no respondió a tiempo. Se muestra la mejor señal local disponible.")
      }

      if (!client) {
        const clientResponse = await supabase
          .from("clients")
          .select("profession_code, preferred_name, treatment, preferred_style, plan_code")
          .eq("id", cid)
          .maybeSingle()
        client = clientResponse.data || null

        if (client) {
          setProfessionCode(client.profession_code || "consultor")
          setPreferredName(client.preferred_name || "")
          setTreatment(client.treatment || "")
          setStyle(client.preferred_style || "balanceado")
        }
      }

      let dashboardRuntimeLoaded = false
      try {
        const runtime = await fetchDashboardRuntime()
        const featureAccess = runtime?.feature_access || runtime?.limits || {}
        const resolvedPlanCode = String(
          runtime?.plan?.effective_plan_code ||
            runtime?.effective_plan_code ||
            runtime?.limits?.effective_plan_code ||
            client?.plan_code ||
            "trial"
        )

        setPlanCode(resolvedPlanCode)
        setCustomAgentEnabled(Boolean(featureAccess?.custom_agent_enabled ?? false))
        setRuntimeSource("auth_bound")
        dashboardRuntimeLoaded = true
      } catch (dashboardError) {
        console.error("No se pudo cargar dashboard runtime del asistente:", dashboardError)
        setOperationalWarning((current) => current || "El runtime auth-bound del asistente sigue degradado.")
      }

      if (!dashboardRuntimeLoaded) {
        const { data: limits, error: limitsError } = await supabase.rpc("get_my_effective_limits")
        if (limitsError) throw limitsError

        const effectiveLimits = (limits || {}) as EffectiveLimitsRuntime
        setPlanCode(getEffectivePlanCode(effectiveLimits))
        setCustomAgentEnabled(Boolean(limits?.custom_agent_enabled ?? false))
        setRuntimeSource("legacy")
      }

      if (!customContext) {
        const { data: prefs } = await supabase
          .from("client_preferences")
          .select("pref_key, pref_value")
          .eq("client_id", cid)
          .in("pref_key", ["assistant_tone", "assistant_context", "assistant_profession", "assistant_style"])

        prefs?.forEach((pref: any) => {
          if (pref.pref_key === "assistant_tone") setTone(pref.pref_value || "profesional")
          if (pref.pref_key === "assistant_context") setCustomContext(pref.pref_value || "")
          if (pref.pref_key === "assistant_profession" && !client?.profession_code) setProfessionCode(pref.pref_value || "consultor")
          if (pref.pref_key === "assistant_style" && !client?.preferred_style) setStyle(pref.pref_value || "balanceado")
        })
      }

      try {
        setRuntimeSnapshot(await fetchProfessionalRuntime())
      } catch (runtimeError) {
        console.error("No se pudo cargar runtime del asistente:", runtimeError)
        setOperationalWarning((current) => current || "No se pudo confirmar el runtime profesional del asistente en tiempo útil.")
      }
    } catch (err) {
      console.error(err)
      setLoadError("No se pudo cargar la configuracion del asistente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    setSaveError("")
    try {
      const headers = await getAuthHeaders()
      const response = await fetch("/api/professional/assistant", {
        method: "POST",
        headers,
        body: JSON.stringify({
          profession_code: professionCode,
          preferred_name: preferredName.trim() || null,
          treatment: treatment || null,
          tone,
          style,
          assistant_context: customContext.trim(),
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.ok) {
        throw new Error(String(payload?.error || payload?.detail || "No se pudo guardar el asistente."))
      }

      await loadConfig()
      setLastSavedAt(new Date().toISOString())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Cargando configuracion...
        </div>
      </div>
    )
  }

  if (!customAgentEnabled) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1F63]">Asistente IA</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Personaliza como Operaly te habla y te representa</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6]">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-dashed border-[#7C3AED]/30 bg-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 to-[#3B82F6]/10">
            <Brain className="h-8 w-8 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F1F63]">Personalizacion avanzada</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Configura como Operaly te entiende: profesion, tono, estilo de respuesta y contexto permanente. Tu plan actual es {getDisplayPlanName(planCode)} y esta capa se habilita cuando el contrato de capacidades lo permite.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-left">
            {[
              { title: "Contexto profesional", desc: "Adapta el analisis a tu rubro" },
              { title: "Tono y estilo", desc: "Como te habla y redacta" },
              { title: "Agente profundo", desc: "Mas memoria y criterio asistivo" },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs font-semibold text-[#0F1F63]">{feature.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/precios">
              <Button className="rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
                Ver planes y capacidades <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/professional">
              <Button variant="outline" className="rounded-xl">Volver</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const runtimePreferences = runtimeSnapshot?.preferences || {}
  const recentUnderstanding = runtimeSnapshot?.recentUnderstandingRuns?.[0] || null
  const recentEvent = runtimeSnapshot?.recentEvents?.[0] || null
  const visibleTone = String(runtimePreferences.assistant_tone || tone)
  const visibleStyle = String(runtimePreferences.assistant_style || style)
  const visibleProfession = String(runtimePreferences.assistant_profession || professionCode)
  const visibleName = String(runtimePreferences.preferred_name || preferredName || "")
  const runtimeAligned =
    visibleTone === tone &&
    visibleStyle === style &&
    visibleProfession === professionCode
  const selectedProfession = PROFESSIONS.find((item) => item.code === professionCode)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Asistente IA</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Operaly se adapta a ti con profesion, tono y contexto operativo</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6]">
          <Bot className="h-5 w-5 text-white" />
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#7C3AED]/15 bg-gradient-to-r from-[#7C3AED]/5 via-white to-[#3B82F6]/5 p-4">
        <p className="text-sm font-semibold text-[#0F1F63]">Qué define aquí</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Aquí decide cómo debe representarlo Operaly: desde qué profesión lo acompaña, qué tono usa, qué tan breve o detallado responde y qué contexto debe tener siempre presente.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-card p-4">
        <p className="text-sm font-semibold text-[#0F1F63]">Lectura operativa</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {runtimeSource === "auth_bound"
            ? "Esta vista ya toma primero el runtime auth-bound para plan y personalización avanzada."
            : runtimeSource === "legacy"
              ? "Esta vista cayó al contrato anterior porque el runtime auth-bound no respondió."
              : "Esta vista todavía está preparando la lectura operativa del asistente."}
        </p>
      </div>

      {operationalWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {operationalWarning}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-r from-[#7C3AED]/5 via-white to-[#3B82F6]/5 p-4">
        <p className="text-sm font-semibold text-[#0F1F63]">Acompanamiento en vivo</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Esta vista ya no solo guarda tono y contexto. Tambien deja ver si el runtime esta aplicando esa personalidad y si la comprension reciente mantiene una senal util.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">asistente visible</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {runtimeSnapshot?.preferences?.assistant_tone || tone}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {runtimeSnapshot?.preferences?.assistant_style || style} · {runtimeSnapshot?.preferences?.assistant_profession || professionCode}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">último entendimiento</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {normalizeRuntimeStatus(
              String(
                runtimeSnapshot?.recentUnderstandingRuns?.[0]?.decision ||
                  runtimeSnapshot?.recentUnderstandingRuns?.[0]?.status ||
                  ""
              )
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {runtimeSnapshot?.recentUnderstandingRuns?.[0]?.confidence != null
              ? `Confianza ${(Number(runtimeSnapshot.recentUnderstandingRuns[0].confidence) * 100).toFixed(0)}%`
              : "Todavía no hay corrida visible"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">en conversación</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">Debe sentirse como suyo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si WhatsApp sigue respondiendo genérico o fuera de tono, backend todavía no está aplicando bien esta configuración.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">sincronia del agente</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {runtimeAligned ? "Alineada" : "Pendiente de reflejar"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {runtimeSnapshot?.preferences
              ? "El runtime ya devuelve una personalidad visible para contrastarla con esta configuracion."
              : "Todavia no hay una personalidad visible confirmada por backend."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">comprension reciente</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{confidenceLabel(recentUnderstanding?.confidence)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {recentUnderstanding
              ? `Decision visible: ${normalizeRuntimeStatus(String(recentUnderstanding?.decision || recentUnderstanding?.status || ""))}`
              : "Todavia no hay una corrida reciente visible del entendimiento."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">trato esperado</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {treatment || "Sin tratamiento"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {visibleName
              ? `Debe dirigirse a ${visibleName} con tono ${visibleTone}.`
              : "Debe sostener el tono elegido aunque no haya un nombre visible."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">plan actual</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{getDisplayPlanName(planCode)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">tono activo</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{tone}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">estilo activo</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{style}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0F1F63]">Senal viva del asistente</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Lo ultimo visible del runtime sobre tono, contexto y comprension.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {formatRuntimeDate(
              recentUnderstanding?.created_at ||
                recentUnderstanding?.inserted_at ||
                recentEvent?.created_at ||
                recentEvent?.inserted_at
            )}
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">profesion visible</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
              {PROFESSIONS.find((item) => item.code === visibleProfession)?.label || visibleProfession || "Pendiente"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {selectedProfession?.sublabel || "Configuracion profesional actual"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">tono visible</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F63]">{visibleTone}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Estilo: {visibleStyle}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">ultimo evento</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
              {normalizeRuntimeStatus(String(recentEvent?.event_type || recentEvent?.action || recentEvent?.type || ""))}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Sirve para contrastar si la conversacion viva ya se siente como su configuracion.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3B82F6]/10">
            <User className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Tu identidad</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Como quieres que te llame</label>
            <input
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Tratamiento profesional</label>
            <select
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              {TREATMENTS.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED]/10">
            <Briefcase className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Profesion</h2>
            <p className="text-xs text-muted-foreground">Operaly ajusta su lenguaje y criterio segun tu area</p>
            <p className="text-xs text-muted-foreground">Esto debería cambiar cómo analiza, propone y responde.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
          {PROFESSIONS.map((profession) => {
            const Icon = profession.icon
            const isSelected = professionCode === profession.code
            return (
              <button
                key={profession.code}
                type="button"
                onClick={() => setProfessionCode(profession.code)}
                className={`group relative rounded-xl border p-3 text-left transition-all ${
                  isSelected ? "border-[#7C3AED]/40 bg-[#7C3AED]/5 shadow-sm" : "border-border bg-background hover:border-[#7C3AED]/30 hover:bg-secondary/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#7C3AED]">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${profession.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: profession.color }} />
                </div>
                <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-[#7C3AED]" : "text-[#0F1F63]"}`}>{profession.label}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{profession.sublabel}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06B6D4]/10">
            <MessageSquare className="h-4 w-4 text-[#06B6D4]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Tono de comunicacion</h2>
            <p className="text-xs text-muted-foreground">La personalidad con la que Operaly te responde por WhatsApp</p>
            <p className="text-xs text-muted-foreground">Debe reflejarse también en llamadas, notas de voz y mensajes proactivos.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {TONES.map((toneOption) => (
            <button
              key={toneOption.code}
              type="button"
              onClick={() => setTone(toneOption.code)}
              className={`rounded-xl border p-3 text-left transition-all ${
                tone === toneOption.code ? "border-[#06B6D4]/50 bg-[#06B6D4]/5" : "border-border bg-background hover:border-[#06B6D4]/30"
              }`}
            >
              <p className={`text-sm font-semibold ${tone === toneOption.code ? "text-[#06B6D4]" : "text-[#0F1F63]"}`}>{toneOption.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{toneOption.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3B82F6]/10">
            <Sparkles className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Estilo de respuesta</h2>
            <p className="text-xs text-muted-foreground">Que tan breve o profundo quieres a Operaly</p>
            <p className="text-xs text-muted-foreground">Sirve para que no se sienta demasiado seco ni demasiado largo.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((styleOption) => (
            <button
              key={styleOption.code}
              type="button"
              onClick={() => setStyle(styleOption.code)}
              className={`rounded-xl border p-4 text-center transition-all ${
                style === styleOption.code ? "border-[#3B82F6]/50 bg-[#3B82F6]/5" : "border-border bg-background hover:border-[#3B82F6]/30"
              }`}
            >
              <p className={`text-sm font-semibold ${style === styleOption.code ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>{styleOption.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{styleOption.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED]/10">
            <Brain className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Contexto permanente</h2>
            <p className="text-xs text-muted-foreground">Informacion que Operaly debe recordar siempre sobre tu trabajo</p>
            <p className="text-xs text-muted-foreground">Aquí puede dejar criterios, contexto o forma de trabajo que no quiere repetir todo el tiempo.</p>
          </div>
        </div>
        <textarea
          value={customContext}
          onChange={(e) => setCustomContext(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Ej: Soy abogado corporativo en Lima, trabajo con empresas medianas y prefiero respuestas directas, claras y bien estructuradas."
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Mientras mas claro sea este contexto, mejor se comportara Operaly contigo.</p>
          <p className="text-xs text-muted-foreground">{customContext.length}/1000</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] px-8 font-medium text-white hover:opacity-90"
        >
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar configuracion
            </>
          )}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-sm font-medium text-[#10B981]">
            <Check className="h-4 w-4" /> Guardado en Supabase
          </div>
        )}
        {lastSavedAt ? (
          <div className="text-xs text-muted-foreground">
            Última actualización: {new Date(lastSavedAt).toLocaleString("es-PE")}
          </div>
        ) : null}
      </div>

      {saveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Cómo debe tratarlo</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Su nombre, tratamiento y profesión deberían cambiar la forma en que Operaly le habla a usted.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Cómo debe pensar</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            El tono y el estilo ayudan a que responda con el nivel de detalle y formalidad que usted espera.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Qué no debería perder</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            El contexto permanente debería servir para que no tenga que volver a explicarle siempre lo mismo.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Si Operaly todavía le responde con un tono genérico, mezcla idiomas o ignora su profesión, el problema ya no está en esta pantalla sino en la aplicación real del runtime.
      </div>
    </div>
  )
}
