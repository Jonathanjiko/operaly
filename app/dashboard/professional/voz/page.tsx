"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Mic, Save, RefreshCw, Phone, Volume2,
  ChevronRight, Check, Sparkles, Radio,
  PhoneCall, MessageSquare, Settings2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel",    lang: "en", gender: "F", style: "Neutral",      desc: "Clara y profesional" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella",     lang: "en", gender: "F", style: "Cálida",       desc: "Suave y empática" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew",      lang: "en", gender: "M", style: "Directa",      desc: "Concisa y firme" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", lang: "en", gender: "F", style: "Formal",       desc: "Profesional y estructurada" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill",      lang: "es", gender: "M", style: "Cálida",       desc: "Cercana y natural" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel",    lang: "es", gender: "M", style: "Profunda",     desc: "Segura y ejecutiva" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy",   lang: "es", gender: "F", style: "Amigable",     desc: "Fluida y natural" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice",     lang: "es", gender: "F", style: "Profesional",  desc: "Clara y formal" },
]

const TONE_STYLES = [
  { value: "profesional",   label: "Profesional",  desc: "Formal y directo",        emoji: "🎯" },
  { value: "calido",        label: "Cálido",        desc: "Empático y cercano",      emoji: "🤝" },
  { value: "directo",       label: "Directo",       desc: "Conciso, sin rodeos",     emoji: "⚡" },
  { value: "amigable",      label: "Amigable",      desc: "Natural y casual",        emoji: "😊" },
]

const CALL_STYLES = [
  { value: "breve",          label: "Breve",          desc: "2-3 frases máximo",    emoji: "💬" },
  { value: "conversacional", label: "Conversacional", desc: "Fluido y natural",     emoji: "🗣️" },
  { value: "formal",         label: "Formal",          desc: "Estructurado",         emoji: "📋" },
]

export default function VozPage() {
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [clientId, setClientId]         = useState("")
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [minutesLimit, setMinutesLimit] = useState(0)
  const [minutesUsed, setMinutesUsed]   = useState(0)
  const [saved, setSaved]               = useState(false)
  const [voiceId, setVoiceId]           = useState("")
  const [customVoiceId, setCustomVoiceId] = useState("")
  const [useCustomVoice, setUseCustomVoice] = useState(false)
  const [toneStyle, setToneStyle]       = useState("profesional")
  const [callStyle, setCallStyle]       = useState("breve")
  const [preferAudio, setPreferAudio]   = useState(true)
  const [voiceLang, setVoiceLang]       = useState("es")

  const minutesPct = minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0
  const isUnlimited = minutesLimit >= 999999

  useEffect(() => { loadConfig() }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      const { data: limits } = await supabase
        .from("tenant_effective_limits")
        .select("voice_enabled, max_audio_minutes")
        .eq("client_id", cid).maybeSingle()

      setVoiceEnabled(Boolean(limits?.voice_enabled ?? false))
      setMinutesLimit(Number(limits?.max_audio_minutes ?? 0))

      const { data: vs } = await supabase
        .from("user_voice_settings")
        .select("*").eq("client_id", cid).single()

      if (vs) {
        setVoiceId(vs.voice_id || "")
        setToneStyle(vs.tone_style || "profesional")
        setCallStyle(vs.call_style || "breve")
        setPreferAudio(vs.prefer_audio_over_call ?? true)
        setVoiceLang(vs.voice_language || "es")
      }

      const period = new Date().toISOString().slice(0, 7).replace("-", "")
      const { data: usage } = await supabase
        .from("usage_monthly")
        .select("audio_minutes_used")
        .eq("client_id", cid).eq("period_yyyymm", period).limit(1)
      setMinutesUsed(Number(usage?.[0]?.audio_minutes_used) || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    try {
      const resolvedVoiceId = useCustomVoice ? customVoiceId.trim() : voiceId
      const voice = ELEVENLABS_VOICES.find(v => v.id === resolvedVoiceId)
      await supabase.from("user_voice_settings").upsert({
        client_id: clientId,
        voice_provider: "elevenlabs",
        voice_id: resolvedVoiceId || null,
        voice_name: voice?.name || "custom",
        voice_language: voiceLang || "es",
        tone_style: toneStyle,
        call_style: callStyle,
        prefer_audio_over_call: preferAudio,
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_id" })
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
          <RefreshCw className="w-5 h-5 animate-spin" />Cargando voz...
        </div>
      </div>
    )
  }

  // ── BLOQUEADO ─────────────────────────────────────────────────────────────
  if (!voiceEnabled) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1F63]">Voz del asistente</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Audios y llamadas desde WhatsApp</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-card rounded-3xl border border-dashed border-[#7C3AED]/30 p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10 flex items-center justify-center mx-auto">
            <Volume2 className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F1F63]">Voz disponible desde Pro</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Activa la voz de Operaly: recibe resúmenes en audio, envía notas de voz inteligentes y haz llamadas desde WhatsApp.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: "🎙️", title: "Pro — 20 min/mes",      desc: "Audios + llamadas simples" },
              { icon: "🤖", title: "Pro Plus — 60 min/mes", desc: "Llamadas conversacionales IA" },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-semibold text-sm text-[#0F1F63]">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/precios">
            <Button className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
              Ver planes <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const filteredVoices = ELEVENLABS_VOICES.filter(v => !voiceLang || v.lang === voiceLang)
  const selectedVoice = ELEVENLABS_VOICES.find(v => v.id === voiceId)

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Voz del asistente</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Configura cómo suena Operaly en audios y llamadas
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Minutos del mes */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <h2 className="font-semibold text-[#0F1F63]">Minutos este mes</h2>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {minutesUsed.toFixed(1)} / {isUnlimited ? "∞" : minutesLimit} min
          </span>
        </div>
        {isUnlimited ? (
          <div className="h-2.5 bg-[#10B981]/20 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full" />
          </div>
        ) : (
          <>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  minutesPct >= 90 ? "bg-[#EF4444]" : minutesPct >= 75 ? "bg-[#F59E0B]" : "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                }`}
                style={{ width: `${minutesPct}%` }}
              />
            </div>
            {minutesPct >= 75 && (
              <p className={`text-xs mt-2 font-medium ${minutesPct >= 90 ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>
                {minutesPct >= 90 ? "⚠️ Casi sin minutos — considera un paquete extra" : `📊 ${Math.round(minutesPct)}% usado este mes`}
              </p>
            )}
          </>
        )}
        {isUnlimited && (
          <p className="text-xs text-[#10B981] font-medium mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Plan ilimitado activo
          </p>
        )}
      </div>

      {/* Selección de voz */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F1F63]">Voz de ElevenLabs</h2>
              <p className="text-xs text-muted-foreground">La voz que usa Operaly para hablarte</p>
            </div>
          </div>
          {selectedVoice && !useCustomVoice && (
            <div className="text-xs text-[#7C3AED] font-medium bg-[#7C3AED]/5 px-3 py-1 rounded-full border border-[#7C3AED]/20">
              {selectedVoice.name} activa
            </div>
          )}
        </div>

        {/* Toggle voz personalizada */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
          <div>
            <p className="text-sm font-medium text-[#0F1F63]">Usar mi propia voz clonada</p>
            <p className="text-xs text-muted-foreground">Pega el Voice ID de ElevenLabs</p>
          </div>
          <button
            type="button"
            onClick={() => setUseCustomVoice(!useCustomVoice)}
            className={`relative w-11 h-6 rounded-full transition-colors ${useCustomVoice ? "bg-[#7C3AED]" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useCustomVoice ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {useCustomVoice ? (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Voice ID personalizado</label>
            <input
              type="text"
              value={customVoiceId}
              onChange={e => setCustomVoiceId(e.target.value)}
              placeholder="Ej: EXAVITQu4vr4xnSDxMaL"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Encuéntralo en <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">elevenlabs.io</a> → Voice Lab → tu voz → ID
            </p>
          </div>
        ) : (
          <>
            {/* Filtro idioma */}
            <div className="flex gap-2">
              {[{ k: "es", l: "Español" }, { k: "en", l: "Inglés" }, { k: "", l: "Todos" }].map(({ k, l }) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setVoiceLang(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    voiceLang === k ? "bg-[#7C3AED] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Voice grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredVoices.map(voice => {
                const isSelected = voiceId === voice.id
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setVoiceId(voice.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected ? "border-[#7C3AED]/50 bg-[#7C3AED]/5" : "border-border bg-background hover:border-[#7C3AED]/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#0F1F63]">{voice.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {voice.gender === "F" ? "♀" : "♂"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{voice.desc}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{voice.style} · {voice.lang === "es" ? "Español" : "Inglés"}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Tono de voz */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Tono de voz</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TONE_STYLES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setToneStyle(t.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                toneStyle === t.value ? "border-[#3B82F6]/50 bg-[#3B82F6]/5" : "border-border bg-background hover:border-[#3B82F6]/30"
              }`}
            >
              <div className="text-xl mb-1">{t.emoji}</div>
              <p className={`text-xs font-semibold ${toneStyle === t.value ? "text-[#3B82F6]" : "text-[#0F1F63]"}`}>{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Estilo de llamada */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Estilo de llamada</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CALL_STYLES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setCallStyle(s.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                callStyle === s.value ? "border-[#06B6D4]/50 bg-[#06B6D4]/5" : "border-border bg-background hover:border-[#06B6D4]/30"
              }`}
            >
              <div className="text-xl mb-1">{s.emoji}</div>
              <p className={`text-xs font-semibold ${callStyle === s.value ? "text-[#06B6D4]" : "text-[#0F1F63]"}`}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preferencia */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F1F63]">Preferir audio sobre llamada</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enviar audio por WhatsApp en lugar de llamar cuando sea posible
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreferAudio(!preferAudio)}
            className={`relative w-11 h-6 rounded-full transition-colors ${preferAudio ? "bg-[#7C3AED]" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${preferAudio ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-medium hover:opacity-90"
        >
          {saving
            ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
            : <><Save className="w-4 h-4 mr-2" />Guardar configuración de voz</>
          }
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-[#10B981] font-medium">
            <Check className="w-4 h-4" /> Guardado correctamente
          </div>
        )}
      </div>
    </div>
  )
}
