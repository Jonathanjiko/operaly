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

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      const { data: client } = await supabase
        .from("clients")
        .select("profession_code, preferred_name, treatment, preferred_style, plan_code")
        .eq("id", cid)
        .maybeSingle()

      if (client) {
        setProfessionCode(client.profession_code || "consultor")
        setPreferredName(client.preferred_name || "")
        setTreatment(client.treatment || "")
        setStyle(client.preferred_style || "balanceado")
      }

      const { data: limits, error: limitsError } = await supabase.rpc("get_my_effective_limits")
      if (limitsError) throw limitsError

      const effectiveLimits = (limits || {}) as EffectiveLimitsRuntime
      setPlanCode(getEffectivePlanCode(effectiveLimits))
      setCustomAgentEnabled(Boolean(limits?.custom_agent_enabled ?? false))

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
    } catch (err) {
      console.error(err)
      setLoadError("No se pudo cargar la configuracion del asistente.")
    } finally {
      setLoading(false)
    }
  }

  const upsertPref = async (key: string, value: string) => {
    const { error } = await supabase.from("client_preferences").upsert(
      { client_id: clientId, pref_key: key, pref_value: value, source: "dashboard", updated_at: new Date().toISOString() },
      { onConflict: "client_id,pref_key" },
    )
    if (error) throw error
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    setSaveError("")
    try {
      const { error: clientUpdateError } = await supabase
        .from("clients")
        .update({
          profession_code: professionCode,
          preferred_name: preferredName.trim() || null,
          treatment: treatment || null,
          preferred_style: style,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)
      if (clientUpdateError) throw clientUpdateError

      await upsertPref("assistant_tone", tone)
      await upsertPref("assistant_context", customContext.trim())
      await upsertPref("assistant_profession", professionCode)
      await upsertPref("assistant_style", style)

      await loadConfig()
      setLastSavedAt(new Date().toISOString())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || "No se pudo guardar.")
      alert(err.message || "No se pudo guardar.")
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
        <p className="text-sm font-semibold text-[#0F1F63]">Contrato del asistente</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Profesión, tono, estilo y contexto se guardan en Supabase como tu configuración operativa. El backend debe usarlos para cómo Operaly piensa, responde y te representa en WhatsApp.
        </p>
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

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Si Operaly todavía responde con un tono por defecto, mezcla idiomas o ignora tu profesión al leer agenda, archivos o tareas, el problema sigue estando en el backend runtime, no en esta pantalla.
      </div>
    </div>
  )
}
