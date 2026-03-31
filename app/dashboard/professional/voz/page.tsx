"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Mic,
  Save,
  RefreshCw,
  Phone,
  Volume2,
  Lock,
  Check,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", lang: "en", desc: "Inglés · Neutral · Clara" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", lang: "en", desc: "Inglés · Cálida · Suave" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew", lang: "en", desc: "Inglés · Masculina · Directa" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", lang: "en", desc: "Inglés · Formal · Profesional" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", lang: "es", desc: "Español · Masculina · Cálida" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", lang: "es", desc: "Español · Masculina · Profunda" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", lang: "es", desc: "Español · Femenina · Amigable" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", lang: "es", desc: "Español · Femenina · Profesional" },
]

const TONE_STYLES = [
  { value: "profesional", label: "Profesional", desc: "Formal y directo" },
  { value: "calido", label: "Cálido", desc: "Empático y cercano" },
  { value: "directo", label: "Directo", desc: "Conciso, sin rodeos" },
  { value: "amigable", label: "Amigable", desc: "Natural y casual" },
]

const CALL_STYLES = [
  { value: "breve", label: "Breve", desc: "2-3 frases máximo" },
  { value: "conversacional", label: "Conversacional", desc: "Fluido y natural" },
  { value: "formal", label: "Formal", desc: "Estructurado" },
]

export default function VozPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientId, setClientId] = useState("")
  const [planCode, setPlanCode] = useState("trial")
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [minutesLimit, setMinutesLimit] = useState(0)
  const [minutesUsed, setMinutesUsed] = useState(0)
  const [saved, setSaved] = useState(false)

  const [voiceId, setVoiceId] = useState("")
  const [customVoiceId, setCustomVoiceId] = useState("")
  const [useCustomVoice, setUseCustomVoice] = useState(false)
  const [toneStyle, setToneStyle] = useState("profesional")
  const [callStyle, setCallStyle] = useState("breve")
  const [preferAudio, setPreferAudio] = useState(true)
  const [voiceLang, setVoiceLang] = useState("es")

  const minutesPct =
    minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0

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
        .select("plan_code")
        .eq("id", cid)
        .single()

      setPlanCode(client?.plan_code || "trial")

      const { data: limits, error: limitsError } = await supabase
        .from("tenant_effective_limits")
        .select("voice_enabled, max_audio_minutes")
        .eq("client_id", cid)
        .maybeSingle()

      if (limitsError) {
        console.error("Error cargando tenant_effective_limits:", limitsError)
      }

      setVoiceEnabled(Boolean(limits?.voice_enabled ?? false))
      setMinutesLimit(Number(limits?.max_audio_minutes ?? 0))

      const { data: vs } = await supabase
        .from("user_voice_settings")
        .select("*")
        .eq("client_id", cid)
        .single()

      if (vs) {
        setVoiceId(vs.voice_id || "")
        setToneStyle(vs.tone_style || "profesional")
        setCallStyle(vs.call_style || "breve")
        setPreferAudio(vs.prefer_audio_over_call ?? true)
        setVoiceLang(vs.voice_language || "es")
      }

      const period = new Date().toISOString().slice(0, 7).replace("-", "")
      const { data: usage, error: usageError } = await supabase
        .from("usage_monthly")
        .select("audio_minutes_used")
        .eq("client_id", cid)
        .eq("period_yyyymm", period)
        .limit(1)

      if (usageError) {
        console.error("Error cargando usage_monthly:", usageError)
      }

      setMinutesUsed(Number(usage?.[0]?.audio_minutes_used) || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!clientId || !voiceEnabled) return

    setSaving(true)
    try {
      const resolvedVoiceId = useCustomVoice ? customVoiceId.trim() : voiceId
      const voice = ELEVENLABS_VOICES.find((v) => v.id === resolvedVoiceId)

      await supabase.from("user_voice_settings").upsert(
        {
          client_id: clientId,
          voice_provider: "elevenlabs",
          voice_id: resolvedVoiceId || null,
          voice_name: voice?.name || "custom",
          voice_language: voiceLang || "es",
          tone_style: toneStyle,
          call_style: callStyle,
          prefer_audio_over_call: preferAudio,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      )

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
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando configuración de voz...
      </div>
    )
  }

  if (!voiceEnabled) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1F63]">Voz del asistente</h1>
            <p className="text-muted-foreground mt-1">
              Configura cómo suena Operaly cuando te manda audios o hace llamadas.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#7C3AED]" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#0F1F63]">
              Voz y audios bloqueados en tu plan actual
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              La configuración de voz depende de que tu plan tenga habilitada la
              capacidad de audio. Cuando la actives podrás elegir voz, tono, estilo y
              preferencia entre audio o llamada.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Audios por WhatsApp</p>
              <p className="text-sm text-muted-foreground mt-1">
                Resúmenes, recordatorios y respuestas por voz.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Estilo de voz</p>
              <p className="text-sm text-muted-foreground mt-1">
                Define tono, idioma y forma de comunicación.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Minutos del plan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Controla el consumo mensual de voz desde tu dashboard.
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

          <p className="text-xs text-muted-foreground">
            Plan actual: <span className="font-medium">{planCode}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Voz del asistente</h1>
          <p className="text-muted-foreground mt-1">
            Configura cómo suena Operaly cuando te manda audios o hace llamadas.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
          <Mic className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-semibold text-[#0F1F63]">Minutos de voz este mes</h2>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {minutesUsed.toFixed(1)} / {minutesLimit} min
          </span>
        </div>

        {minutesLimit > 0 ? (
          <>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  minutesPct >= 90
                    ? "bg-red-500"
                    : minutesPct >= 75
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                }`}
                style={{ width: `${minutesPct}%` }}
              />
            </div>

            {minutesPct >= 75 && (
              <p
                className={`text-sm mt-2 font-medium ${
                  minutesPct >= 90 ? "text-red-500" : "text-amber-600"
                }`}
              >
                {minutesPct >= 90
                  ? "⚠️ Casi sin minutos disponibles. Considera ampliar tu plan."
                  : `📊 Llevas el ${Math.round(minutesPct)}% de tus minutos disponibles.`}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-center mt-2">
            <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Tu límite de audio está en 0 minutos este mes.
            </p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F63]">Voz de ElevenLabs</h2>
        <p className="text-sm text-muted-foreground">
          Elige la voz con la que Operaly te hablará en audios y llamadas.
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
          <div>
            <p className="text-sm font-medium text-[#0F1F63]">Usar mi propia voz clonada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pega el Voice ID de tu voz en ElevenLabs
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseCustomVoice(!useCustomVoice)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              useCustomVoice ? "bg-[#7C3AED]" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                useCustomVoice ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {useCustomVoice ? (
          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              Voice ID personalizado
            </label>
            <input
              type="text"
              value={customVoiceId}
              onChange={(e) => setCustomVoiceId(e.target.value)}
              placeholder="Ej: EXAVITQu4vr4xnSDxMaL"
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Encuéntralo en ElevenLabs → Voice Lab → tu voz → ID.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2 mb-3">
              {[
                { code: "", label: "Todos" },
                { code: "es", label: "Español" },
                { code: "en", label: "Inglés" },
              ].map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => setVoiceLang(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    voiceLang === l.code
                      ? "bg-[#7C3AED] text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {ELEVENLABS_VOICES.filter((v) => !voiceLang || v.lang === voiceLang).map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => setVoiceId(voice.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  voiceId === voice.id
                    ? "border-[#7C3AED] bg-[#7C3AED]/5"
                    : "border-border bg-background hover:border-[#7C3AED]/40"
                }`}
              >
                <div>
                  <p className="font-medium text-sm text-[#0F1F63]">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.desc}</p>
                </div>
                {voiceId === voice.id && <Check className="w-4 h-4 text-[#7C3AED]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F63]">Tono de voz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {TONE_STYLES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setToneStyle(t.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                toneStyle === t.value
                  ? "border-[#3B82F6] bg-[#3B82F6]/5"
                  : "border-border bg-background hover:border-[#3B82F6]/40"
              }`}
            >
              <p
                className={`font-medium text-sm ${
                  toneStyle === t.value ? "text-[#3B82F6]" : "text-[#0F1F63]"
                }`}
              >
                {t.label}
              </p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F63]">Estilo de llamada</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {CALL_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setCallStyle(s.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                callStyle === s.value
                  ? "border-[#06B6D4] bg-[#06B6D4]/5"
                  : "border-border bg-background hover:border-[#06B6D4]/40"
              }`}
            >
              <p
                className={`font-medium text-sm ${
                  callStyle === s.value ? "text-[#06B6D4]" : "text-[#0F1F63]"
                }`}
              >
                {s.label}
              </p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#0F1F63]">Preferir audio sobre llamada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cuando sea posible, enviar audio por WhatsApp en lugar de llamar
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreferAudio(!preferAudio)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              preferAudio ? "bg-[#7C3AED]" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferAudio ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
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
              Guardar configuración de voz
            </>
          )}
        </Button>

        {saved && <p className="text-sm text-[#34D399] font-medium">✓ Guardado</p>}
      </div>
    </div>
  )
}
