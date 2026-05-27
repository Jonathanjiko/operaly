"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Mic,
  Save,
  RefreshCw,
  Volume2,
  ChevronRight,
  Check,
  Sparkles,
  Radio,
  PhoneCall,
  MessageSquare,
  Settings2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  fetchProfessionalRuntime,
  normalizeRuntimeStatus,
  type ProfessionalRuntimeSnapshot,
} from "@/lib/professional-runtime"
import { fetchDashboardJson, fetchDashboardRuntime, toNumber } from "@/lib/dashboard-runtime"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { getCurrentPeriodMonth } from "@/lib/effective-limits"
import { formatLimit } from "@/lib/plans"

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", lang: "en", gender: "F", style: "Neutral", desc: "Clara y profesional" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", lang: "en", gender: "F", style: "Calida", desc: "Suave y empatica" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew", lang: "en", gender: "M", style: "Directa", desc: "Concisa y firme" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", lang: "en", gender: "F", style: "Formal", desc: "Profesional y estructurada" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", lang: "es", gender: "M", style: "Calida", desc: "Cercana y natural" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", lang: "es", gender: "M", style: "Profunda", desc: "Segura y ejecutiva" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", lang: "es", gender: "F", style: "Amigable", desc: "Fluida y natural" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", lang: "es", gender: "F", style: "Profesional", desc: "Clara y formal" },
]

const TONE_STYLES = [
  { value: "profesional", label: "Profesional", desc: "Formal y directo" },
  { value: "calido", label: "Calido", desc: "Empatico y cercano" },
  { value: "directo", label: "Directo", desc: "Conciso y sin rodeos" },
  { value: "amigable", label: "Amigable", desc: "Natural y casual" },
]

const CALL_STYLES = [
  { value: "breve", label: "Breve", desc: "2-3 frases maximo" },
  { value: "conversacional", label: "Conversacional", desc: "Fluido y natural" },
  { value: "formal", label: "Formal", desc: "Estructurado" },
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

export default function VozPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientId, setClientId] = useState("")
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
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [lastSavedAt, setLastSavedAt] = useState("")
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<ProfessionalRuntimeSnapshot | null>(null)
  const [runtimeSource, setRuntimeSource] = useState<"auth_bound" | "legacy" | "unknown">("unknown")
  const [operationalWarning, setOperationalWarning] = useState("")

  const minutesPct = minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error("No hay sesión activa.")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const loadUsageForCurrentPeriod = async (cid: string) => {
    const periodMonth = getCurrentPeriodMonth()
    const legacyPeriod = periodMonth.slice(0, 7).replace("-", "")

    const runtimeUsage = await supabase
      .from("usage_monthly")
      .select("audio_minutes_used")
      .eq("client_id", cid)
      .eq("period_month", periodMonth)
      .limit(1)

    if (!runtimeUsage.error) {
      return Number(runtimeUsage.data?.[0]?.audio_minutes_used ?? 0)
    }

    const legacyUsage = await supabase
      .from("usage_monthly")
      .select("audio_minutes_used")
      .eq("client_id", cid)
      .eq("period_yyyymm", legacyPeriod)
      .limit(1)

    return Number(legacyUsage.data?.[0]?.audio_minutes_used ?? 0)
  }

  const loadConfig = async () => {
    setLoading(true)
    setLoadError("")
    setOperationalWarning("")
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      let dashboardRuntimeLoaded = false
      try {
        const runtime = await fetchDashboardRuntime()
        const featureAccess = runtime?.feature_access || runtime?.limits || {}
        const limits = runtime?.limits || {}
        const usage = runtime?.usage || {}

        setVoiceEnabled(Boolean(featureAccess?.voice_enabled ?? false))
        setMinutesLimit(toNumber(limits?.max_audio_minutes))
        setMinutesUsed(
          toNumber(
            usage?.audio_minutes_used ??
              usage?.audio?.used ??
              usage?.voice_minutes?.used ??
              usage?.audio
          )
        )
        setRuntimeSource("auth_bound")
        dashboardRuntimeLoaded = true
      } catch (dashboardError) {
        console.error("No se pudo cargar dashboard runtime para voz:", dashboardError)
        setOperationalWarning("La información de voz tardó más de lo normal. Le mostramos los últimos datos disponibles.")
      }

      if (!dashboardRuntimeLoaded) {
        const { data: limits, error: limitsError } = await supabase.rpc("get_my_effective_limits")
        if (limitsError) throw limitsError

        setVoiceEnabled(Boolean(limits?.voice_enabled ?? false))
        setMinutesLimit(Number(limits?.max_audio_minutes ?? 0))
        setRuntimeSource("legacy")
      }

      let voiceSnapshotLoaded = false
      try {
        const voicePayload = await fetchDashboardJson<{ voice?: Record<string, any> | null }>("/api/dashboard/voice")
        const vs = voicePayload?.voice
        if (vs) {
          const savedVoiceId = String(vs.voice_id || "")
          const builtInVoice = ELEVENLABS_VOICES.find((voice) => voice.id === savedVoiceId)
          setVoiceId(builtInVoice ? savedVoiceId : "")
          setCustomVoiceId(!builtInVoice && savedVoiceId ? savedVoiceId : "")
          setUseCustomVoice(Boolean(savedVoiceId && !builtInVoice))
          setToneStyle(vs.tone_style || "profesional")
          setCallStyle(vs.call_style || "breve")
          setPreferAudio(vs.prefer_audio_over_call ?? true)
          setVoiceLang(vs.voice_language || "es")
        }
        voiceSnapshotLoaded = true
      } catch (voiceError) {
        console.error("No se pudo cargar snapshot auth-bound de voz:", voiceError)
        setOperationalWarning((current) => current || "Algunos detalles de voz todavía se están actualizando.")
      }

        if (!voiceSnapshotLoaded) {
          const { data: vs } = await supabase
            .from("user_voice_settings")
            .select("client_id,voice_provider,voice_id,voice_name,voice_language,tone_style,call_style,prefer_audio_over_call,updated_at")
            .eq("client_id", cid)
            .maybeSingle()

        if (vs) {
          const savedVoiceId = String(vs.voice_id || "")
          const builtInVoice = ELEVENLABS_VOICES.find((voice) => voice.id === savedVoiceId)
          setVoiceId(builtInVoice ? savedVoiceId : "")
          setCustomVoiceId(!builtInVoice && savedVoiceId ? savedVoiceId : "")
          setUseCustomVoice(Boolean(savedVoiceId && !builtInVoice))
          setToneStyle(vs.tone_style || "profesional")
          setCallStyle(vs.call_style || "breve")
          setPreferAudio(vs.prefer_audio_over_call ?? true)
          setVoiceLang(vs.voice_language || "es")
        }
      }

      try {
        setRuntimeSnapshot(await fetchProfessionalRuntime())
      } catch (runtimeError) {
        console.error("No se pudo cargar runtime de voz:", runtimeError)
        setOperationalWarning((current) => current || "La actividad reciente de voz puede tardar un poco más en reflejarse.")
      }

      if (!dashboardRuntimeLoaded) {
        setMinutesUsed(await loadUsageForCurrentPeriod(cid))
      }
    } catch (err) {
      console.error(err)
      setLoadError("No se pudo cargar la configuracion de voz.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!clientId) return
    if (useCustomVoice && !customVoiceId.trim()) {
      setSaveError("Pegue el Voice ID de ElevenLabs para usar una voz clonada.")
      return
    }
    setSaving(true)
    setSaveError("")
    try {
      const resolvedVoiceId = useCustomVoice ? customVoiceId.trim() : voiceId
      const voice = ELEVENLABS_VOICES.find((item) => item.id === resolvedVoiceId)
      const headers = await getAuthHeaders()
      const response = await fetch("/api/professional/voice", {
        method: "POST",
        headers,
        body: JSON.stringify({
          voice_id: resolvedVoiceId || null,
          voice_name: voice?.name || "custom",
          voice_language: voiceLang || "es",
          tone_style: toneStyle,
          call_style: callStyle,
          prefer_audio_over_call: preferAudio,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.ok) {
        throw new Error(String(payload?.error || payload?.detail || "No se pudo guardar la voz."))
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
          Cargando voz...
        </div>
      </div>
    )
  }

  if (!voiceEnabled) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1F63]">Voz del asistente</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Audios y llamadas desde tu configuracion operativa</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]">
            <Mic className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="space-y-5 rounded-3xl border border-dashed border-[#7C3AED]/30 bg-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
            <Volume2 className="h-8 w-8 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F1F63]">Voz disponible cuando tu plan la habilita</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Activa la voz de Operaly para recibir audios, configurar llamadas salientes y acompanarte con respuestas habladas cuando tu plan o add-on lo permita.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { title: "Audio operativo", desc: "Resumenes, notas y respuestas habladas" },
              { title: "Llamadas salientes", desc: "Confirmaciones y seguimiento asistido" },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-sm font-semibold text-[#0F1F63]">{feature.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/precios">
            <Button className="rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
              Ver planes <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const filteredVoices = ELEVENLABS_VOICES.filter((voice) => !voiceLang || voice.lang === voiceLang)
  const selectedVoice = ELEVENLABS_VOICES.find((voice) => voice.id === voiceId)
  const resolvedVoiceLabel = useCustomVoice
    ? customVoiceId.trim() || "Pendiente"
    : selectedVoice?.name || "Sin voz seleccionada"
  const recentVoiceSignal =
    runtimeSnapshot?.recentEvents?.find((event) => {
      const haystack = JSON.stringify(event).toLowerCase()
      return haystack.includes("voice") || haystack.includes("audio") || haystack.includes("call")
    }) || runtimeSnapshot?.recentEvents?.[0] || null
  const recentUnderstanding = runtimeSnapshot?.recentUnderstandingRuns?.[0] || null
  const runtimeVoiceId = String(runtimeSnapshot?.voice?.voice_id || "")
  const runtimeVoiceName = String(runtimeSnapshot?.voice?.voice_name || "")
  const runtimeMatchesSelection = Boolean(runtimeVoiceId) && runtimeVoiceId === (useCustomVoice ? customVoiceId.trim() : voiceId)
  const selectedToneCopy = TONE_STYLES.find((item) => item.value === toneStyle)?.label || toneStyle
  const selectedCallStyleCopy = CALL_STYLES.find((item) => item.value === callStyle)?.label || callStyle

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Voz del asistente</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Configura como suena Operaly en audios y llamadas</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]">
          <Mic className="h-5 w-5 text-white" />
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {false ? (
      <>
      <div className="rounded-2xl border border-[#7C3AED]/15 bg-gradient-to-r from-[#7C3AED]/5 via-white to-[#06B6D4]/5 p-4">
        <p className="text-sm font-semibold text-[#0F1F63]">Lo que puede ajustar aquí</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Aquí decide cómo debe sonar Operaly. Puede elegir una voz sugerida, pegar una voz propia de ElevenLabs y definir cómo quiere que le hable en audios y llamadas.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-card p-4">
        <p className="text-sm font-semibold text-[#0F1F63]">Lo que ajusta aquí</p>
        <p className="mt-1 text-sm text-muted-foreground">
          La voz que usa Operaly, cómo le habla en audio y cómo prioriza audios o llamadas.
        </p>
      </div>

      {operationalWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {operationalWarning}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#06B6D4]/20 bg-gradient-to-r from-[#06B6D4]/5 via-white to-[#7C3AED]/5 p-4">
        <p className="text-sm font-semibold text-[#0F1F63]">Cómo debería oírse</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Revise si la voz elegida y el estilo de llamada ya se sienten como usted espera.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">voz visible</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {runtimeSnapshot?.voice?.voice_id ? "Sí" : "Pendiente"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {runtimeSnapshot?.voice?.voice_name || "Todavía no se refleja una voz visible"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">último movimiento</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {normalizeRuntimeStatus(
              String(
                runtimeSnapshot?.recentEvents?.[0]?.event_type ||
                  runtimeSnapshot?.recentEvents?.[0]?.action ||
                  ""
              )
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            La portada profesional te muestra el detalle completo del runtime.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">aplicacion real</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">Debe oírse como aquí</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si en llamada o audio suena distinto, la integración de fondo todavía no está cerrada del todo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">estado de la voz</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {runtimeMatchesSelection ? "Aplicada" : runtimeVoiceId ? "Por actualizar" : "Pendiente"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {runtimeVoiceName
              ? `${runtimeVoiceName}`
              : "Todavía no aparece una voz visible en esta cuenta."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">canal prioritario</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {preferAudio ? "Audio antes de llamada" : "Llamada cuando haga falta"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {preferAudio
              ? "El sistema intentara resolver primero con audio cuando alcance."
              : "El sistema puede escalar mas rapido a llamada o contacto directo."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">comprension reciente</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {confidenceLabel(recentUnderstanding?.confidence)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {recentUnderstanding
              ? `Ultima decision visible: ${normalizeRuntimeStatus(String(recentUnderstanding?.decision || recentUnderstanding?.status || ""))}`
              : "Todavia no hay una corrida reciente visible para este canal."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0F1F63]">Última actividad visible</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Revise lo último que ya se alcanzó a reflejar en voz, audio o llamada.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {formatRuntimeDate(recentVoiceSignal?.created_at || recentVoiceSignal?.inserted_at || recentVoiceSignal?.occurred_at)}
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">evento</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
              {normalizeRuntimeStatus(String(recentVoiceSignal?.event_type || recentVoiceSignal?.action || recentVoiceSignal?.type || ""))}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">tono esperado</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F63]">{selectedToneCopy}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Llamada: {selectedCallStyleCopy}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">voz seleccionada</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F63] break-all">{resolvedVoiceLabel}</p>
          </div>
        </div>
      </div>
      </>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3B82F6]/10">
              <Radio className="h-4 w-4 text-[#3B82F6]" />
            </div>
            <h2 className="font-semibold text-[#0F1F63]">Minutos este mes</h2>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {minutesUsed.toFixed(1)} / {formatLimit(minutesLimit, voiceEnabled)} min
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all ${
              minutesPct >= 90 ? "bg-[#EF4444]" : minutesPct >= 75 ? "bg-[#F59E0B]" : "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
            }`}
            style={{ width: `${minutesPct}%` }}
          />
        </div>
        {minutesPct >= 75 && (
          <p className={`mt-2 text-xs font-medium ${minutesPct >= 90 ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>
            {minutesPct >= 90 ? "Casi sin minutos: considera un paquete extra" : `${Math.round(minutesPct)}% usado este mes`}
          </p>
        )}
        {!minutesLimit && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Tu plan actual no incluye minutos de voz.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">modo activo</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {useCustomVoice ? "Voz clonada" : "Biblioteca ElevenLabs"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">voz actual</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63] break-all">{resolvedVoiceLabel}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">estilo de llamada</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{callStyle}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">idioma de voz</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {voiceLang === "es" ? "Español" : voiceLang === "en" ? "Inglés" : "Todos"}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED]/10">
              <Volume2 className="h-4 w-4 text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F1F63]">Voz de ElevenLabs</h2>
              <p className="text-xs text-muted-foreground">La voz que usa Operaly para hablarte</p>
            </div>
          </div>
          {selectedVoice && !useCustomVoice && (
            <div className="rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/5 px-3 py-1 text-xs font-medium text-[#7C3AED]">
              {selectedVoice.name} activa
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
          <div>
              <p className="text-sm font-medium text-[#0F1F63]">Usar mi propia voz</p>
              <p className="text-xs text-muted-foreground">Pegue aquí el Voice ID de ElevenLabs</p>
          </div>
          <button
            type="button"
            onClick={() => setUseCustomVoice(!useCustomVoice)}
            className={`relative h-6 w-11 rounded-full transition-colors ${useCustomVoice ? "bg-[#7C3AED]" : "bg-border"}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${useCustomVoice ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {useCustomVoice ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Voice ID personalizado</label>
            <input
              type="text"
              value={customVoiceId}
              onChange={(e) => setCustomVoiceId(e.target.value)}
              placeholder="Ej: EXAVITQu4vr4xnSDxMaL"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-mono focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Si ya creó o clonó una voz en <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">ElevenLabs</a>, copie el Voice ID y péguelo aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              {[{ k: "es", l: "Espanol" }, { k: "en", l: "Ingles" }, { k: "", l: "Todos" }].map(({ k, l }) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setVoiceLang(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    voiceLang === k ? "bg-[#7C3AED] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filteredVoices.map((voice) => {
                const isSelected = voiceId === voice.id
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setVoiceId(voice.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected ? "border-[#7C3AED]/50 bg-[#7C3AED]/5" : "border-border bg-background hover:border-[#7C3AED]/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#0F1F63]">{voice.name}</span>
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {voice.gender === "F" ? "F" : "M"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{voice.desc}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {voice.style} · {voice.lang === "es" ? "Español" : "Inglés"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#7C3AED]">
                          <Check className="h-3 w-3 text-white" />
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

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3B82F6]/10">
            <MessageSquare className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Tono de voz</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {TONE_STYLES.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => setToneStyle(tone.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                toneStyle === tone.value ? "border-[#3B82F6]/50 bg-[#3B82F6]/5" : "border-border bg-background hover:border-[#3B82F6]/30"
              }`}
            >
              <div className="text-sm font-semibold text-[#0F1F63]">{tone.label}</div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{tone.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Voz recomendada</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Lo más rápido para empezar. Elige una voz ya lista y la deja guardada en su cuenta.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Voz propia</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Si quiere algo más personal, puede crear o clonar su voz en ElevenLabs y luego pegar el Voice ID aquí.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Cómo debe notarse</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Esto debería reflejarse tanto en audios como en llamadas, sin que tenga que volver a configurarlo.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06B6D4]/10">
            <PhoneCall className="h-4 w-4 text-[#06B6D4]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Estilo de llamada</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CALL_STYLES.map((styleOption) => (
            <button
              key={styleOption.value}
              type="button"
              onClick={() => setCallStyle(styleOption.value)}
              className={`rounded-xl border p-3 text-center transition-all ${
                callStyle === styleOption.value ? "border-[#06B6D4]/50 bg-[#06B6D4]/5" : "border-border bg-background hover:border-[#06B6D4]/30"
              }`}
            >
              <p className={`text-xs font-semibold ${callStyle === styleOption.value ? "text-[#06B6D4]" : "text-[#0F1F63]"}`}>{styleOption.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{styleOption.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981]/10">
              <Settings2 className="h-4 w-4 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F1F63]">Preferir audio sobre llamada</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Enviar audio por WhatsApp cuando sea suficiente antes de escalar a llamada</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreferAudio(!preferAudio)}
            className={`relative h-6 w-11 rounded-full transition-colors ${preferAudio ? "bg-[#7C3AED]" : "bg-border"}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${preferAudio ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-8 font-medium text-white hover:opacity-90"
        >
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar configuracion de voz
            </>
          )}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-sm font-medium text-[#10B981]">
            <Check className="h-4 w-4" /> Cambios guardados
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
        Si todavía escucha otra voz o un estilo distinto, vuelva a guardar y haga una prueba nueva desde WhatsApp.
      </div>
    </div>
  )
}
