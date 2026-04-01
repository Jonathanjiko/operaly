"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Bot, Save, RefreshCw, Sparkles, User, MessageSquare,
  Briefcase, Brain, Palette, ChevronRight, Check,
  Scale, Heart, Stethoscope, Calculator, PenTool,
  TrendingUp, GraduationCap, Code2, Megaphone, HelpCircle,
  Building2, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

const PROFESSIONS = [
  { code: "abogado",     label: "Legal",       sublabel: "Abogado / Notario",   icon: Scale,        color: "#3B82F6" },
  { code: "medico",      label: "Salud",        sublabel: "Médico / Terapeuta",   icon: Stethoscope,  color: "#10B981" },
  { code: "contador",    label: "Finanzas",     sublabel: "Contador / Auditor",   icon: Calculator,   color: "#F59E0B" },
  { code: "arquitecto",  label: "Diseño",       sublabel: "Arquitecto / Diseñador", icon: PenTool,    color: "#8B5CF6" },
  { code: "consultor",   label: "Estrategia",   sublabel: "Consultor / Asesor",   icon: TrendingUp,   color: "#06B6D4" },
  { code: "coach",       label: "Bienestar",    sublabel: "Coach / Mentor",       icon: Heart,        color: "#EF4444" },
  { code: "emprendedor", label: "Startup",      sublabel: "Fundador / Emprendedor", icon: Building2,  color: "#7C3AED" },
  { code: "vendedor",    label: "Ventas",       sublabel: "Comercial / Agente",   icon: Megaphone,    color: "#F97316" },
  { code: "educador",    label: "Educación",    sublabel: "Docente / Formador",   icon: GraduationCap,color: "#14B8A6" },
  { code: "ingeniero",   label: "Tecnología",   sublabel: "Ingeniero / Dev",      icon: Code2,        color: "#6366F1" },
  { code: "creativo",    label: "Publicidad",   sublabel: "Creativo / Marketing", icon: Palette,      color: "#EC4899" },
  { code: "otro",        label: "Otro",         sublabel: "Personalizado",        icon: HelpCircle,   color: "#94A3B8" },
]

const TONES = [
  { code: "profesional", label: "Profesional", desc: "Formal, estructurado, preciso",     icon: "🎯" },
  { code: "calido",      label: "Cálido",      desc: "Cercano, empático, humano",          icon: "🤝" },
  { code: "directo",     label: "Directo",      desc: "Conciso, sin rodeos",               icon: "⚡" },
  { code: "formal",      label: "Formal",       desc: "Muy estructurado, protocolar",      icon: "📋" },
  { code: "amigable",    label: "Amigable",     desc: "Natural, casual, conversacional",   icon: "😊" },
]

const STYLES = [
  { code: "breve",      label: "Breve",      desc: "Corto y al punto",          icon: "💬" },
  { code: "detallado",  label: "Detallado",  desc: "Completo y bien explicado", icon: "📖" },
  { code: "balanceado", label: "Balanceado", desc: "Adapta según la pregunta",  icon: "⚖️" },
]

const TREATMENTS = [
  { code: "",     label: "Sin tratamiento" },
  { code: "Dr.",  label: "Dr. / Dra." },
  { code: "Lic.", label: "Lic." },
  { code: "Ing.", label: "Ing." },
  { code: "Prof.",label: "Prof." },
  { code: "Arq.", label: "Arq." },
]

export default function AsistentePage() {
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [clientId, setClientId]             = useState("")
  const [customAgentEnabled, setCustomAgentEnabled] = useState(false)
  const [professionCode, setProfessionCode] = useState("consultor")
  const [preferredName, setPreferredName]   = useState("")
  const [treatment, setTreatment]           = useState("")
  const [tone, setTone]                     = useState("profesional")
  const [style, setStyle]                   = useState("balanceado")
  const [customContext, setCustomContext]    = useState("")
  const [saved, setSaved]                   = useState(false)

  useEffect(() => { loadConfig() }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      const { data: client } = await supabase
        .from("clients")
        .select("profession_code, preferred_name, treatment, preferred_style")
        .eq("id", cid).single()

      if (client) {
        setProfessionCode(client.profession_code || "consultor")
        setPreferredName(client.preferred_name || "")
        setTreatment(client.treatment || "")
        setStyle(client.preferred_style || "balanceado")
      }

      const { data: limits } = await supabase
        .from("tenant_effective_limits")
        .select("custom_agent_enabled")
        .eq("client_id", cid).maybeSingle()

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
    await supabase.from("client_preferences").upsert(
      { client_id: clientId, pref_key: key, pref_value: value, source: "dashboard" },
      { onConflict: "client_id,pref_key" }
    )
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    try {
      await supabase.from("clients").update({
        profession_code: professionCode,
        preferred_name: preferredName.trim() || null,
        treatment: treatment || null,
        preferred_style: style,
        updated_at: new Date().toISOString(),
      }).eq("id", clientId)

      await upsertPref("assistant_tone", tone)
      await upsertPref("assistant_context", customContext.trim())
      await upsertPref("assistant_profession", professionCode)
      await upsertPref("assistant_style", style)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert(err.message || "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Cargando configuración...
        </div>
      </div>
    )
  }

  // ── BLOQUEADO ─────────────────────────────────────────────────────────────
  if (!customAgentEnabled) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1F63]">Asistente IA</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Personaliza cómo Operaly te habla y te representa</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-dashed border-[#7C3AED]/30 p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 to-[#3B82F6]/10 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F1F63]">Personalización avanzada</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
              Configura cómo Operaly te entiende: profesión, tono, estilo de respuesta y contexto permanente. Disponible desde Pro.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-left">
            {[
              { icon: "🎯", title: "Contexto profesional", desc: "Adapta análisis según tu rubro" },
              { icon: "🎨", title: "Tono y estilo", desc: "Cómo te habla y redacta" },
              { icon: "🧠", title: "Agente profundo", desc: "Análisis especializado por profesión" },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-xl mb-2">{f.icon}</div>
                <p className="font-semibold text-xs text-[#0F1F63]">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/precios">
              <Button className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
                Ver planes <ChevronRight className="w-4 h-4 ml-1" />
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

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Asistente IA</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Operaly se adapta a ti — configura su personalidad, tono y contexto
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Identidad */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
            <User className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Tu identidad</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              ¿Cómo quieres que te llame?
            </label>
            <input
              type="text"
              value={preferredName}
              onChange={e => setPreferredName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Tratamiento profesional
            </label>
            <select
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              {TREATMENTS.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Profesión — grid visual con iconos */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Profesión</h2>
            <p className="text-xs text-muted-foreground">Operaly ajusta su lenguaje y contexto según tu área</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {PROFESSIONS.map(p => {
            const Icon = p.icon
            const isSelected = professionCode === p.code
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => setProfessionCode(p.code)}
                className={`group relative p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#7C3AED]/40 bg-[#7C3AED]/5 shadow-sm"
                    : "border-border bg-background hover:border-[#7C3AED]/30 hover:bg-secondary/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: p.color + "15" }}
                >
                  <Icon className="w-4 h-4" style={{ color: p.color }} />
                </div>
                <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-[#7C3AED]" : "text-[#0F1F63]"}`}>
                  {p.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{p.sublabel}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tono */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Tono de comunicación</h2>
            <p className="text-xs text-muted-foreground">Personalidad con la que Operaly te habla por WhatsApp</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TONES.map(t => (
            <button
              key={t.code}
              type="button"
              onClick={() => setTone(t.code)}
              className={`p-3 rounded-xl border text-left transition-all ${
                tone === t.code
                  ? "border-[#06B6D4]/50 bg-[#06B6D4]/5"
                  : "border-border bg-background hover:border-[#06B6D4]/30"
              }`}
            >
              <div className="text-lg mb-1">{t.icon}</div>
              <p className={`text-sm font-semibold ${tone === t.code ? "text-[#06B6D4]" : "text-[#0F1F63]"}`}>{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Estilo */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Estilo de respuesta</h2>
            <p className="text-xs text-muted-foreground">Extensión y profundidad de las respuestas</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map(s => (
            <button
              key={s.code}
              type="button"
              onClick={() => setStyle(s.code)}
              className={`p-4 rounded-xl border text-center transition-all ${
                style === s.code
                  ? "border-[#3B82F6]/50 bg-[#3B82F6]/5"
                  : "border-border bg-background hover:border-[#3B82F6]/30"
              }`}
            >
              <div className="text-2xl mb-1.5">{s.icon}</div>
              <p className={`text-sm font-semibold ${style === s.code ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Contexto adicional */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F1F63]">Contexto permanente</h2>
            <p className="text-xs text-muted-foreground">
              Información que Operaly siempre recordará sobre ti y tu trabajo
            </p>
          </div>
        </div>
        <textarea
          value={customContext}
          onChange={e => setCustomContext(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Ej: Soy abogado corporativo especializado en fusiones. Trabajo con empresas del sector minero en Lima. Mis clientes principales son medianas empresas. Prefiero respuestas directas y bien estructuradas..."
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mientras más detallado, mejor personalizará Operaly sus respuestas
          </p>
          <p className="text-xs text-muted-foreground">{customContext.length}/1000</p>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-medium hover:opacity-90"
        >
          {saving
            ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
            : <><Save className="w-4 h-4 mr-2" />Guardar configuración</>
          }
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-[#10B981] font-medium">
            <Check className="w-4 h-4" /> Guardado — Operaly ya usa esta configuración
          </div>
        )}
      </div>
    </div>
  )
}
