"use client"

/**
 * voice-settings-section.tsx — Operaly
 * ========================================
 * Sección de configuración de voz para el dashboard Professional.
 * Se agrega dentro de /app/dashboard/professional/configuracion/page.tsx
 *
 * INSTRUCCIONES DE INTEGRACIÓN:
 * ==============================
 * 1. Copiar este archivo completo al proyecto
 * 2. En configuracion/page.tsx agregar el import al inicio:
 *    import { VoiceSettingsSection } from "@/components/dashboard/VoiceSettingsSection"
 *
 * 3. Agregar el estado de voz en ProfessionalSettingsPage():
 *    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings | null>(null)
 *    const [voiceUsage, setVoiceUsage] = useState({ used: 0, limit: 0 })
 *
 * 4. En loadData(), después de cargar el cliente, agregar:
 *    // Cargar configuración de voz
 *    const vsResult = await supabase.rpc("get_voice_settings", { p_client_id: resolvedClientId })
 *    if (vsResult.data) setVoiceSettings(vsResult.data)
 *    // Cargar uso/límite desde runtime efectivo
 *    // El frontend ya debe leer `period_month` y `get_my_effective_limits`
 *
 * 5. En el JSX, ANTES del cierre </div> final, agregar:
 *    <VoiceSettingsSection
 *      clientId={clientId}
 *      planCode={effectivePlanCode}
 *      voiceEnabled={Boolean(effectiveLimits?.voice_enabled)}
 *      voiceSettings={voiceSettings}
 *      minutesUsed={voiceUsage.used}
 *      minutesLimit={voiceUsage.limit}
 *      onSaved={loadData}
 *    />
 */

import { useEffect, useState } from "react"
import { Mic, Phone, Sparkles, Volume2, Check, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Voces disponibles (ElevenLabs) ──────────────────────────────────────────

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel",   lang: "en", description: "Inglés · Neutral · Clara" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella",    lang: "en", description: "Inglés · Cálida · Suave" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew",     lang: "en", description: "Inglés · Masculina · Directa" },
  { id: "D38z5RcWu1voky8WS1ja", name: "Fin",      lang: "en", description: "Inglés · Masculina · Amigable" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", lang: "en", description: "Inglés · Formal · Profesional" },
  // Voces en español (las mejores para LATAM con eleven_multilingual_v2)
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill",     lang: "es", description: "Español · Masculina · Cálida" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel",   lang: "es", description: "Español · Masculina · Profunda" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy",  lang: "es", description: "Español · Femenina · Amigable" },
]

const TONE_STYLES = [
  { value: "profesional", label: "Profesional",   desc: "Formal y directo" },
  { value: "cálido",      label: "Cálido",        desc: "Empático y cercano" },
  { value: "directo",     label: "Directo",        desc: "Conciso, sin rodeos" },
  { value: "formal",      label: "Formal",         desc: "Muy estructurado" },
  { value: "amigable",    label: "Amigable",       desc: "Natural y casual" },
]

const CALL_STYLES = [
  { value: "breve",         label: "Breve",          desc: "Máximo 2-3 frases" },
  { value: "conversacional", label: "Conversacional", desc: "Fluido y natural" },
  { value: "formal",        label: "Formal",          desc: "Estructurado" },
]

// Plan gate
// ─── Componente principal ─────────────────────────────────────────────────────

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
  const minutesPercent = minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0

  const [saving, setSaving]         = useState(false)
  const [voiceId, setVoiceId]       = useState(voiceSettings?.voice_id || "")
  const [toneStyle, setToneStyle]   = useState(voiceSettings?.tone_style || "profesional")
  const [callStyle, setCallStyle]   = useState(voiceSettings?.call_style || "breve")
  const [preferAudio, setPreferAudio] = useState(voiceSettings?.prefer_audio_over_call ?? true)

  useEffect(() => {
    if (voiceSettings) {
      setVoiceId(voiceSettings.voice_id || "")
      setToneStyle(voiceSettings.tone_style || "profesional")
      setCallStyle(voiceSettings.call_style || "breve")
      setPreferAudio(voiceSettings.prefer_audio_over_call ?? true)
    }
  }, [voiceSettings])

  const selectedVoice = ELEVENLABS_VOICES.find(v => v.id === voiceId)

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    try {
      const row = {
        client_id:              clientId,
        voice_provider:         "elevenlabs",
        voice_id:               voiceId || null,
        voice_name:             selectedVoice?.name || null,
        voice_language:         selectedVoice?.lang || "es",
        tone_style:             toneStyle,
        call_style:             callStyle,
        prefer_audio_over_call: preferAudio,
        updated_at:             new Date().toISOString(),
      }

      const { error } = await supabase
        .from("user_voice_settings")
        .upsert(row, { onConflict: "client_id" })

      if (error) throw error
      onSaved?.()
      alert("Configuración de voz guardada correctamente.")
    } catch (e: any) {
      alert(e.message || "No se pudo guardar la configuración de voz.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-[#7C3AED]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Voz del asistente</h2>
        </div>
        {!hasVoice && (
          <span className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
            <Lock className="w-3 h-3" />
            Disponible desde Pro
          </span>
        )}
      </div>

      {/* Descripción */}
      <p className="text-sm text-muted-foreground">
        Configura la voz con la que Operaly te enviará audios y realizará llamadas.
        Elige el estilo que mejor represente tu forma de comunicarte.
      </p>

      {/* Uso de minutos */}
      {hasVoice && minutesLimit > 0 && (
        <div className="bg-secondary/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#0F1F63]">Minutos de voz este mes</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {minutesUsed.toFixed(1)} / {minutesLimit} min
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                minutesPercent >= 90 ? "bg-red-500" :
                minutesPercent >= 70 ? "bg-amber-500" :
                "bg-[#7C3AED]"
              }`}
              style={{ width: `${minutesPercent}%` }}
            />
          </div>
          {minutesPercent >= 80 && (
            <p className="text-xs text-amber-600 mt-2">
              Vas por el {Math.round(minutesPercent)}% de tus minutos. Considera un pack extra si necesitas más.
            </p>
          )}
        </div>
      )}

      {/* Sin acceso */}
      {!hasVoice && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto">
            <Volume2 className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <p className="font-medium text-[#0F1F63]">Voz disponible desde Pro</p>
          <p className="text-sm text-muted-foreground">
            Con el plan Pro puedes recibir audios y llamadas desde tu asistente Operaly.
            Pro Plus incluye llamadas conversacionales inteligentes con IA.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mt-2">
            <div className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border text-[#0F1F63]">
              🎙️ Pro — 20 min/mes · Audio + Llamadas simples
            </div>
            <div className="text-xs px-3 py-1.5 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/20 text-[#7C3AED]">
              🤖 Pro Plus — 60 min/mes · Llamadas conversacionales IA
            </div>
          </div>
        </div>
      )}

      {/* Configuración (solo si tiene acceso) */}
      {hasVoice && (
        <div className="space-y-6">

          {/* Selección de voz */}
          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-3">
              Voz del asistente
            </label>
            <div className="grid gap-2">
              {ELEVENLABS_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setVoiceId(voice.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    voiceId === voice.id
                      ? "border-[#7C3AED] bg-[#7C3AED]/5"
                      : "border-border bg-background hover:border-[#7C3AED]/40"
                  }`}
                >
                  <div>
                    <p className="font-medium text-[#0F1F63] text-sm">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.description}</p>
                  </div>
                  {voiceId === voice.id && (
                    <Check className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by ElevenLabs · Puedes clonar tu propia voz desde{" "}
              <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer"
                className="text-[#7C3AED] underline">
                elevenlabs.io
              </a>{" "}
              y pegar el Voice ID aquí.
            </p>
          </div>

          {/* Estilo de tono */}
          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-3">
              Estilo de comunicación
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TONE_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setToneStyle(style.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    toneStyle === style.value
                      ? "border-[#3B82F6] bg-[#3B82F6]/5"
                      : "border-border bg-background hover:border-[#3B82F6]/40"
                  }`}
                >
                  <p className="font-medium text-[#0F1F63] text-sm">{style.label}</p>
                  <p className="text-xs text-muted-foreground">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Estilo de llamada */}
          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-3">
              Estilo de llamada
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CALL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setCallStyle(style.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    callStyle === style.value
                      ? "border-[#06B6D4] bg-[#06B6D4]/5"
                      : "border-border bg-background hover:border-[#06B6D4]/40"
                  }`}
                >
                  <p className="font-medium text-[#0F1F63] text-sm">{style.label}</p>
                  <p className="text-xs text-muted-foreground">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferencia audio vs llamada */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
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
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferAudio ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Pro Plus badge */}
          {plan.ai_calls && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/5">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-[#7C3AED] font-medium">
                Tu plan incluye llamadas conversacionales con IA — di "llama a [nombre] y habla con él sobre X" por WhatsApp
              </p>
            </div>
          )}

          {/* Guardar */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium"
          >
            {saving ? "Guardando..." : "Guardar configuración de voz"}
          </Button>

        </div>
      )}

    </div>
  )
}
