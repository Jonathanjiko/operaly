"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Check,
  Lock,
  Mic,
  Phone,
  Sparkles,
  Volume2,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

type VoiceSettings = {
  id?: string
  client_id?: string
  voice_provider: string
  voice_id: string | null
  voice_name: string | null
  voice_language: string
  tone_style: string
  call_style: string
  prefer_audio_over_call: boolean
}

type VoiceSettingsSectionProps = {
  clientId: string
  planCode: string
  voiceEnabled: boolean
  voiceSettings: VoiceSettings | null
  minutesUsed: number
  minutesLimit: number
  onSaved?: () => void
}

type VoicePreset = {
  id: string
  name: string
  lang: string
  description: string
}

const ELEVENLABS_VOICES: VoicePreset[] = [
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", lang: "es", description: "Masculina · Clara · Cercana" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", lang: "es", description: "Masculina · Profunda · Sobria" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", lang: "es", description: "Femenina · Natural · Amable" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", lang: "en", description: "Neutral · Clara · Profesional" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", lang: "en", description: "Suave · Cálida · Cercana" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", lang: "en", description: "Formal · Seria · Ejecutiva" },
]

const TONE_STYLES = [
  { value: "profesional", label: "Profesional", desc: "Formal, clara y ordenada" },
  { value: "cálido", label: "Cálido", desc: "Más humano y cercano" },
  { value: "directo", label: "Directo", desc: "Va al punto" },
  { value: "formal", label: "Formal", desc: "Más sobrio y protocolar" },
  { value: "amigable", label: "Amigable", desc: "Más natural y liviano" },
]

const CALL_STYLES = [
  { value: "breve", label: "Breve", desc: "Respuestas cortas y prácticas" },
  { value: "conversacional", label: "Conversacional", desc: "Más fluido y acompañante" },
  { value: "formal", label: "Formal", desc: "Más estructurado y serio" },
]

export function VoiceSettingsSection({
  clientId,
  planCode,
  voiceEnabled,
  voiceSettings,
  minutesUsed,
  minutesLimit,
  onSaved,
}: VoiceSettingsSectionProps) {
  const hasVoice = voiceEnabled
  const hasAiCalls = ["pro_plus", "owner", "owner_unlimited", "internal"].includes(
    String(planCode || "").toLowerCase()
  )
  const minutesPercent = minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0

  const initialVoiceId = voiceSettings?.voice_id || ""
  const initialPreset = ELEVENLABS_VOICES.find((voice) => voice.id === initialVoiceId)
  const [saving, setSaving] = useState(false)
  const [voiceMode, setVoiceMode] = useState<"preset" | "custom">(
    initialVoiceId && !initialPreset ? "custom" : "preset"
  )
  const [voiceId, setVoiceId] = useState(initialVoiceId)
  const [customVoiceName, setCustomVoiceName] = useState(
    initialPreset ? "" : voiceSettings?.voice_name || ""
  )
  const [toneStyle, setToneStyle] = useState(voiceSettings?.tone_style || "profesional")
  const [callStyle, setCallStyle] = useState(voiceSettings?.call_style || "breve")
  const [preferAudio, setPreferAudio] = useState(voiceSettings?.prefer_audio_over_call ?? true)

  useEffect(() => {
    const currentVoiceId = voiceSettings?.voice_id || ""
    const matchedPreset = ELEVENLABS_VOICES.find((voice) => voice.id === currentVoiceId)
    setVoiceMode(currentVoiceId && !matchedPreset ? "custom" : "preset")
    setVoiceId(currentVoiceId)
    setCustomVoiceName(matchedPreset ? "" : voiceSettings?.voice_name || "")
    setToneStyle(voiceSettings?.tone_style || "profesional")
    setCallStyle(voiceSettings?.call_style || "breve")
    setPreferAudio(voiceSettings?.prefer_audio_over_call ?? true)
  }, [voiceSettings])

  const selectedPreset = useMemo(
    () => ELEVENLABS_VOICES.find((voice) => voice.id === voiceId) || null,
    [voiceId]
  )

  const effectiveVoiceLabel =
    voiceMode === "custom"
      ? customVoiceName.trim() || "Voz propia"
      : selectedPreset?.name || "Voz por defecto"

  const effectiveLanguage =
    voiceMode === "custom"
      ? voiceSettings?.voice_language || "es"
      : selectedPreset?.lang || voiceSettings?.voice_language || "es"

  const handleSave = async () => {
    if (!clientId) return
    if (voiceMode === "custom" && !voiceId.trim()) {
      alert("Pegue primero el Voice ID de ElevenLabs para guardar una voz propia.")
      return
    }

    setSaving(true)
    try {
      const row = {
        client_id: clientId,
        voice_provider: "elevenlabs",
        voice_id: voiceId.trim() || null,
        voice_name: effectiveVoiceLabel,
        voice_language: effectiveLanguage,
        tone_style: toneStyle,
        call_style: callStyle,
        prefer_audio_over_call: preferAudio,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("user_voice_settings")
        .upsert(row, { onConflict: "client_id" })

      if (error) throw error
      onSaved?.()
      alert("La configuración de voz quedó guardada.")
    } catch (error: any) {
      alert(error.message || "No se pudo guardar la configuración de voz.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-[#7C3AED]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Voz y llamadas</h2>
        </div>
        {!hasVoice && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <Lock className="h-3 w-3" />
            Disponible desde Pro
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Aquí define cómo quiere que Operaly le hable por audio y en llamadas. La ruta real usa
        ElevenLabs para la voz, Vapi para la conversación y Telnyx para el número.
      </p>

      {hasVoice && minutesLimit > 0 && (
        <div className="rounded-xl bg-secondary/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#0F1F63]">Minutos de voz este mes</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {minutesUsed.toFixed(1)} / {minutesLimit} min
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all ${
                minutesPercent >= 90 ? "bg-red-500" : minutesPercent >= 70 ? "bg-amber-500" : "bg-[#7C3AED]"
              }`}
              style={{ width: `${minutesPercent}%` }}
            />
          </div>
        </div>
      )}

      {!hasVoice && (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#7C3AED]/10">
            <Volume2 className="h-6 w-6 text-[#7C3AED]" />
          </div>
          <p className="font-medium text-[#0F1F63]">Voz disponible desde Pro</p>
          <p className="text-sm text-muted-foreground">
            Con Pro puede recibir audios y llamadas simples. Con Pro Plus u Owner puede avanzar a
            llamadas conversacionales más ricas.
          </p>
        </div>
      )}

      {hasVoice && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setVoiceMode("preset")}
              className={`rounded-2xl border p-4 text-left transition-all ${
                voiceMode === "preset"
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-border bg-background hover:border-[#7C3AED]/30"
              }`}
            >
              <p className="text-sm font-semibold text-[#0F1F63]">Usar una voz recomendada</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                La forma más rápida. Elija una voz lista y úsela de inmediato.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setVoiceMode("custom")}
              className={`rounded-2xl border p-4 text-left transition-all ${
                voiceMode === "custom"
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-border bg-background hover:border-[#7C3AED]/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-[#7C3AED]" />
                <p className="text-sm font-semibold text-[#0F1F63]">Usar mi propia voz</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Si ya creó o clonó una voz en ElevenLabs, pegue aquí su Voice ID.
              </p>
            </button>
          </div>

          {voiceMode === "preset" ? (
            <div>
              <label className="mb-3 block text-sm font-medium text-[#0F1F63]">Voces sugeridas</label>
              <div className="grid gap-2">
                {ELEVENLABS_VOICES.map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setVoiceId(voice.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      voiceId === voice.id
                        ? "border-[#7C3AED] bg-[#7C3AED]/5"
                        : "border-border bg-background hover:border-[#7C3AED]/30"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0F1F63]">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">{voice.description}</p>
                    </div>
                    {voiceId === voice.id && <Check className="h-4 w-4 text-[#7C3AED]" />}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-[#7C3AED]/15 bg-[#7C3AED]/5 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0F1F63]">Voice ID de ElevenLabs</label>
                <Input
                  value={voiceId}
                  onChange={(event) => setVoiceId(event.target.value)}
                  placeholder="Pegue aquí su Voice ID"
                  className="rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0F1F63]">Nombre visible</label>
                <Input
                  value={customVoiceName}
                  onChange={(event) => setCustomVoiceName(event.target.value)}
                  placeholder="Ejemplo: Voz propia de Jonathan"
                  className="rounded-xl bg-white"
                />
              </div>
              <div className="rounded-xl border border-white/70 bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#0F1F63]">Si quiere clonar su voz</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  1. Entre a ElevenLabs. 2. Cree o clone la voz con audios limpios. 3. Copie el
                  Voice ID. 4. Péguelo aquí y guarde. Después backend debe usarlo en llamadas y
                  audios para su cuenta.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="mb-3 block text-sm font-medium text-[#0F1F63]">Forma de hablar</label>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {TONE_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setToneStyle(style.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    toneStyle === style.value
                      ? "border-[#3B82F6] bg-[#3B82F6]/5"
                      : "border-border bg-background hover:border-[#3B82F6]/30"
                  }`}
                >
                  <p className="text-sm font-medium text-[#0F1F63]">{style.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-[#0F1F63]">Estilo de llamada</label>
            <div className="grid gap-2 md:grid-cols-3">
              {CALL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setCallStyle(style.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    callStyle === style.value
                      ? "border-[#06B6D4] bg-[#06B6D4]/5"
                      : "border-border bg-background hover:border-[#06B6D4]/30"
                  }`}
                >
                  <p className="text-sm font-medium text-[#0F1F63]">{style.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
            <div>
              <p className="text-sm font-medium text-[#0F1F63]">Preferir audio antes que llamada</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cuando sea razonable, Operaly intentará responder por audio antes de llamar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreferAudio(!preferAudio)}
              className={`relative h-6 w-11 rounded-full transition-colors ${preferAudio ? "bg-[#7C3AED]" : "bg-border"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  preferAudio ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-sm font-semibold text-[#0F1F63]">Cómo está quedando hoy</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Voz: {effectiveVoiceLabel}. Tono: {toneStyle}. Llamadas: {callStyle}.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-sm font-semibold text-[#0F1F63]">Qué debe hacer backend</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Debe leer esta configuración por usuario y aplicarla de verdad en ElevenLabs, Vapi
                y Telnyx, sin quedarse solo en el dashboard.
              </p>
            </div>
          </div>

          {hasAiCalls && (
            <div className="flex items-center gap-2 rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/5 p-3">
              <Sparkles className="h-4 w-4 text-[#7C3AED]" />
              <p className="text-sm font-medium text-[#7C3AED]">
                Su plan ya permite llamadas conversacionales. Lo que falta es que backend termine
                de aplicar bien la voz, el assistant y el resumen de llamada por usuario.
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 w-full rounded-xl bg-[#7C3AED] font-medium text-white hover:bg-[#6D28D9]"
          >
            {saving ? "Guardando..." : "Guardar voz y llamadas"}
          </Button>
        </div>
      )}
    </div>
  )
}
