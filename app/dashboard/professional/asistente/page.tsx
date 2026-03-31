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
  Lock,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

const PROFESSIONS = [
  { code: "abogado", label: "Abogado / Legal" },
  { code: "medico", label: "Médico / Salud" },
  { code: "contador", label: "Contador / Finanzas" },
  { code: "arquitecto", label: "Arquitecto / Diseño" },
  { code: "consultor", label: "Consultor / Estrategia" },
  { code: "coach", label: "Coach / Bienestar" },
  { code: "emprendedor", label: "Emprendedor / Startup" },
  { code: "vendedor", label: "Ventas / Comercial" },
  { code: "educador", label: "Educador / Docente" },
  { code: "ingeniero", label: "Ingeniero / Tecnología" },
  { code: "creativo", label: "Creativo / Publicidad" },
  { code: "otro", label: "Otro" },
]

const TONES = [
  { code: "profesional", label: "Profesional", desc: "Formal, estructurado, preciso" },
  { code: "calido", label: "Cálido", desc: "Cercano, empático, humano" },
  { code: "directo", label: "Directo", desc: "Conciso, sin rodeos" },
  { code: "formal", label: "Formal", desc: "Muy estructurado, protocolar" },
  { code: "amigable", label: "Amigable", desc: "Natural, casual, conversacional" },
]

const STYLES = [
  { code: "breve", label: "Breve", desc: "Respuestas cortas, al punto" },
  { code: "detallado", label: "Detallado", desc: "Respuestas completas y explicadas" },
  { code: "balanceado", label: "Balanceado", desc: "Adapta según la pregunta" },
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
  const [customAgentEnabled, setCustomAgentEnabled] = useState(false)

  const [professionCode, setProfessionCode] = useState("consultor")
  const [preferredName, setPreferredName] = useState("")
  const [treatment, setTreatment] = useState("")
  const [tone, setTone] = useState("profesional")
  const [style, setStyle] = useState("balanceado")
  const [customContext, setCustomContext] = useState("")

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      const { data: client } = await supabase
        .from("clients")
        .select("profession_code, preferred_name, treatment, preferred_style")
        .eq("id", cid)
        .single()

      if (client) {
        setProfessionCode(client.profession_code || "consultor")
        setPreferredName(client.preferred_name || "")
        setTreatment(client.treatment || "")
        setStyle(client.preferred_style || "balanceado")
      }

      const { data: limits, error: limitsError } = await supabase
        .from("tenant_effective_limits")
        .select("custom_agent_enabled")
        .eq("client_id", cid)
        .maybeSingle()

      if (limitsError) {
        console.error("Error cargando tenant_effective_limits:", limitsError)
      }

      setCustomAgentEnabled(Boolean(limits?.custom_agent_enabled ?? false))

      const { data: prefs } = await supabase
        .from("client_preferences")
        .select("pref_key, pref_value")
        .eq("client_id", cid)
        .in("pref_key", ["assistant_tone", "assistant_context"])

      prefs?.forEach((p: any) => {
        if (p.pref_key === "assistant_tone") setTone(p.pref_value || "profesional")
        if (p.pref_key === "assistant_context") setCustomContext(p.pref_value || "")
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const upsertPref = async (key: string, value: string) => {
    await supabase
      .from("client_preferences")
      .upsert(
        { client_id: clientId, pref_key: key, pref_value: value, source: "dashboard" },
        { onConflict: "client_id,pref_key" }
      )
  }

  const handleSave = async () => {
    if (!clientId || !customAgentEnabled) return

    setSaving(true)
    try {
      await supabase
        .from("clients")
        .update({
          profession_code: professionCode,
          preferred_name: preferredName.trim() || null,
          treatment: treatment || null,
          preferred_style: style,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)

      await upsertPref("assistant_tone", tone)
      await upsertPref("assistant_context", customContext.trim())
      await upsertPref("assistant_profession", professionCode)
      await upsertPref("assistant_style", style)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert(err.message || "No se pudo guardar la configuración.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando configuración del asistente...
      </div>
    )
  }

  if (!customAgentEnabled) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1F63]">Asistente IA</h1>
            <p className="text-muted-foreground mt-1">
              Personaliza cómo Operaly piensa, redacta y analiza para ti.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#7C3AED]" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#0F1F63]">
              Personalización avanzada bloqueada
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              La configuración profunda del asistente está disponible solo cuando tu plan
              incluye agente personalizado. Esto activa ajustes profesionales, tono,
              contexto fijo y comportamiento más especializado.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Contexto profesional</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tu asistente adapta análisis y respuestas según tu profesión.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Tono y estilo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Controla cómo te habla y cómo redacta para ti.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Agente más profundo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ideal para planes que requieren análisis y personalización avanzada.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/precios">
              <Button className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
                Ver planes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/professional">
              <Button variant="outline" className="rounded-xl">
                Volver al dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Asistente IA</h1>
          <p className="text-muted-foreground mt-1">
            Configura cómo Operaly te habla, te entiende y te representa.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-[#3B82F6]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">Tu identidad</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Con esto Operaly sabrá cómo referirse a ti y adaptar su tono.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              ¿Cómo quieres que te llame?
            </label>
            <input
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              Tratamiento profesional
            </label>
            <select
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              {TREATMENTS.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5 text-[#7C3AED]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">Profesión</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Operaly ajusta su lenguaje, sugerencias y contexto según tu área profesional.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PROFESSIONS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => setProfessionCode(p.code)}
              className={`p-3 rounded-xl border text-left text-sm transition-all ${
                professionCode === p.code
                  ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] font-medium"
                  : "border-border bg-background text-muted-foreground hover:border-[#7C3AED]/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-[#06B6D4]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">Tono de comunicación</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Define la personalidad con la que Operaly se comunica contigo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TONES.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => setTone(t.code)}
              className={`p-4 rounded-xl border text-left transition-all ${
                tone === t.code
                  ? "border-[#06B6D4] bg-[#06B6D4]/5"
                  : "border-border bg-background hover:border-[#06B6D4]/40"
              }`}
            >
              <p
                className={`font-medium text-sm ${
                  tone === t.code ? "text-[#06B6D4]" : "text-[#0F1F63]"
                }`}
              >
                {t.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#3B82F6]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">Estilo de respuesta</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STYLES.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setStyle(s.code)}
              className={`p-4 rounded-xl border text-left transition-all ${
                style === s.code
                  ? "border-[#3B82F6] bg-[#3B82F6]/5"
                  : "border-border bg-background hover:border-[#3B82F6]/40"
              }`}
            >
              <p
                className={`font-medium text-sm ${
                  style === s.code ? "text-[#3B82F6]" : "text-[#0F1F63]"
                }`}
              >
                {s.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-[#7C3AED]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">Contexto adicional</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Información que Operaly siempre debe saber sobre ti o tu trabajo. Por ejemplo:
          tu empresa, tus clientes principales, tus objetivos del mes o las herramientas
          que usas.
        </p>
        <textarea
          value={customContext}
          onChange={(e) => setCustomContext(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Ej: Soy abogado corporativo especializado en fusiones y adquisiciones. Trabajo con empresas medianas de Lima. Mis clientes principales son del sector retail y minería..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
        />
        <p className="text-xs text-muted-foreground text-right">{customContext.length}/1000</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar configuración
            </>
          )}
        </Button>

        {saved && <p className="text-sm text-[#34D399] font-medium">✓ Guardado correctamente</p>}
      </div>
    </div>
  )
}
