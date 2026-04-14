"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  Globe,
  Lock,
  MapPin,
  Mic,
  Phone,
  RefreshCcw,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getClientContext } from "@/lib/client-context"
import { VoiceSettingsSection } from "@/components/dashboard/VoiceSettingsSection"
import {
  getDisplayPlanName,
  getDisplayPlanPeriodicity,
  getDisplayPlanPrice,
} from "@/lib/plans"

type ClientRow = {
  id: string
  phone: string
  phone_normalized: string | null
  name: string | null
  timezone: string | null
  timezone_auto: string | null
  timezone_source: string | null
  created_at: string | null
  profession_code: string | null
  country_code: string | null
  currency_code: string | null
  email: string | null
  language: string | null
  city: string | null
  preferred_language: string | null
  phone_verified_at: string | null
  phone_verification_status: string | null
  phone_verification_requested_at: string | null
  plan_code: string | null
  plan_status: string | null
}

type PreferenceRow = {
  pref_key: string
  pref_value: string | null
}

type SubscriptionRow = {
  id: string
  client_id: string
  plan_id: string | null
  plan_code: string
  plan_name: string | null
  status: string
  provider: string | null
  provider_ref: string | null
  started_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  created_at: string
}

type PaymentRow = {
  id: string
  client_id: string
  plan_id: string | null
  subscription_id: string | null
  item_code: string | null
  provider: string
  provider_ref: string | null
  transaction_id: string | null
  status: string
  amount_usd: number
  currency: string
  paid_at: string | null
  created_at: string
}

type AuthMetadata = {
  client_id?: string
  full_name?: string
  preferred_language?: string
  timezone?: string
  country_code?: string
  city?: string
  phone?: string
  phone_normalized?: string
  profession_code?: string
  selected_plan?: string
}

const BILLING_CURRENCY_CODE = "PEN"

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial",
  core: "Core",
  pro: "Pro",
  pro_plus: "Pro Plus",
}

const LANGUAGE_OPTIONS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
]

const PAID_PLANS = [
  { code: "core", label: "Core" },
  { code: "pro", label: "Pro" },
  { code: "pro_plus", label: "Pro Plus" },
]

export default function ProfessionalSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [clientId, setClientId] = useState("")
  const [email, setEmail] = useState("")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneNormalized, setPhoneNormalized] = useState("")
  const [profession, setProfession] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [city, setCity] = useState("")
  const [profileCurrencyCode, setProfileCurrencyCode] = useState("PEN")
  const [language, setLanguage] = useState("es")
  const [preferredLanguage, setPreferredLanguage] = useState("es")
  const [timezone, setTimezone] = useState("America/Lima")
  const [timezoneAuto, setTimezoneAuto] = useState("")
  const [timezoneSource, setTimezoneSource] = useState("")
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState("pending")
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null)
  const [phoneVerificationRequestedAt, setPhoneVerificationRequestedAt] = useState<string | null>(null)
  const [clientPlanCode, setClientPlanCode] = useState("trial")
  const [clientPlanStatus, setClientPlanStatus] = useState("trialing")

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])

  // Voice settings state
  const [voiceSettings, setVoiceSettings] = useState<any>(null)
  const [voiceMinutesUsed, setVoiceMinutesUsed] = useState(0)
  const [voiceMinutesLimit, setVoiceMinutesLimit] = useState(0)

  const initials = useMemo(() => {
    if (!fullName.trim()) {
      return "OP"
    }

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [fullName])

  const effectivePlanCode = subscription?.plan_code || clientPlanCode || "trial"
  const effectivePlanStatus = subscription?.status || clientPlanStatus || "trialing"
  const currentPlanLabel = getDisplayPlanName(effectivePlanCode) || PLAN_LABELS[effectivePlanCode] || effectivePlanCode

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "—"
    }

    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  const formatMoney = (
    code: string | null | undefined,
    amount: number | string | null | undefined
  ) => {
    const safeCode = String(code || BILLING_CURRENCY_CODE).toUpperCase()
    const numericAmount = Number(amount || 0)

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: safeCode,
      }).format(numericAmount)
    } catch {
      return `${safeCode} ${numericAmount}`
    }
  }

  const getPlanStatusBadgeClass = (status: string | null | undefined) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "active") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (normalized === "trialing" || normalized === "trial") {
      return "border-sky-200 bg-sky-50 text-sky-700"
    }

    if (normalized === "pending") {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (normalized === "cancelled") {
      return "border-slate-200 bg-slate-100 text-slate-700"
    }

    if (normalized === "past_due" || normalized === "failed") {
      return "border-red-200 bg-red-50 text-red-700"
    }

    return "border-slate-200 bg-slate-100 text-slate-700"
  }

  const getPhoneStatusBadgeClass = (status: string | null | undefined) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "verified") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (normalized === "requested" || normalized === "sent") {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (normalized === "rejected" || normalized === "failed") {
      return "border-red-200 bg-red-50 text-red-700"
    }

    return "border-slate-200 bg-slate-100 text-slate-700"
  }

  const getPaymentBadgeClass = (status: string | null | undefined) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "approved" || normalized === "paid" || normalized === "succeeded") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (normalized === "pending") {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (normalized === "failed" || normalized === "declined") {
      return "border-red-200 bg-red-50 text-red-700"
    }

    return "border-slate-200 bg-slate-100 text-slate-700"
  }

  const normalizePhoneForStorage = (value: string) => {
    return value.replace(/[^\d+]/g, "").trim()
  }

  const validateNormalizedPhone = (value: string) => {
    return /^\+\d{7,15}$/.test(value)
  }

  const loadData = async () => {
    setLoading(true)

    try {
      const { data: authResponse, error: authError } = await supabase.auth.getUser()

      if (authError) {
        throw authError
      }

      const user = authResponse.user

      if (!user) {
        throw new Error("No hay sesión activa.")
      }

      const metadata = (user.user_metadata || {}) as AuthMetadata

      let resolvedClientId = ""
      try {
        const ctx = await getClientContext()
        resolvedClientId = ctx.clientId
      } catch {
        resolvedClientId = ""
      }

      if (!resolvedClientId) {
        throw new Error("No encontramos el client_id seguro de esta cuenta.")
      }

      setClientId(resolvedClientId)
      setEmail(user.email || "")

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select(
          `
            id,
            phone,
            phone_normalized,
            name,
            timezone,
            timezone_auto,
            timezone_source,
            created_at,
            profession_code,
            country_code,
            currency_code,
            email,
            language,
            city,
            preferred_language,
            phone_verified_at,
            phone_verification_status,
            phone_verification_requested_at,
            plan_code,
            plan_status
          `
        )
        .eq("id", resolvedClientId)
        .single()

      if (clientError) {
        throw clientError
      }

      const client = clientData as ClientRow

      setFullName(String(client.name || metadata.full_name || ""))
      setPhone(String(client.phone || metadata.phone || ""))
      setPhoneNormalized(
        String(client.phone_normalized || metadata.phone_normalized || client.phone || "")
      )
      setProfession(String(client.profession_code || metadata.profession_code || ""))
      setCountryCode(String(client.country_code || metadata.country_code || ""))
      setCity(String(client.city || metadata.city || ""))
      setProfileCurrencyCode(String(client.currency_code || "PEN"))
      setLanguage(String(client.language || metadata.preferred_language || "es"))
      setPreferredLanguage(String(client.preferred_language || metadata.preferred_language || "es"))
      setTimezone(String(client.timezone || metadata.timezone || "America/Lima"))
      setTimezoneAuto(String(client.timezone_auto || ""))
      setTimezoneSource(String(client.timezone_source || ""))
      setPhoneVerificationStatus(String(client.phone_verification_status || "pending"))
      setPhoneVerifiedAt(client.phone_verified_at || null)
      setPhoneVerificationRequestedAt(client.phone_verification_requested_at || null)
      setClientPlanCode(String(client.plan_code || metadata.selected_plan || "trial"))
      setClientPlanStatus(String(client.plan_status || "trialing"))

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select(
          `
            id,
            client_id,
            plan_id,
            plan_code,
            plan_name,
            status,
            provider,
            provider_ref,
            started_at,
            current_period_start,
            current_period_end,
            cancelled_at,
            created_at
          `
        )
        .eq("client_id", resolvedClientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subscriptionError) {
        // RLS puede denegar acceso — no romper la página, dejar sección vacía
        console.warn("subscriptions query error:", subscriptionError.message)
      }

      setSubscription((subscriptionData as SubscriptionRow | null) || null)

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(
          `
            id,
            client_id,
            plan_id,
            subscription_id,
            item_code,
            provider,
            provider_ref,
            transaction_id,
            status,
            amount_usd,
            currency,
            paid_at,
            created_at
          `
        )
        .eq("client_id", resolvedClientId)
        .order("created_at", { ascending: false })
        .limit(12)

      if (paymentsError) {
        // RLS puede denegar acceso — mostrar historial vacío sin romper la página
        console.warn("payments query error:", paymentsError.message)
      }

      setPayments((paymentsData || []) as PaymentRow[])

      // Load voice settings
      try {
        const { data: vsData } = await supabase
          .rpc("get_voice_settings", { p_client_id: resolvedClientId })
        if (vsData) setVoiceSettings(vsData)
      } catch (_) {}

      // Load voice minutes usage
      try {
        const period = new Date().toISOString().slice(0, 7).replace("-", "")
        const { data: usageData } = await supabase
          .from("usage_monthly")
          .select("audio_minutes_used")
          .eq("client_id", resolvedClientId)
          .eq("period_yyyymm", period)
          .limit(1)
        if (usageData?.[0]) {
          setVoiceMinutesUsed(Number(usageData[0].audio_minutes_used) || 0)
        }
        const { data: myLimits } = await supabase.rpc("get_my_effective_limits")
        setVoiceMinutesLimit(Number(myLimits?.max_audio_minutes ?? 0))
      } catch (_) {}

    } catch (error: any) {
      alert(error.message || "No se pudo cargar la configuración.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const upsertPreference = async (key: string, value: string) => {
    const { error } = await supabase.from("client_preferences").upsert(
      {
        client_id: clientId,
        pref_key: key,
        pref_value: value,
        source: "dashboard",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "client_id,pref_key",
      }
    )

    if (error) {
      throw error
    }
  }

  const handleSave = async () => {
    if (!clientId) {
      alert("No encontramos el cliente de esta cuenta.")
      return
    }

    const normalizedPhone = normalizePhoneForStorage(phone)

    if (!validateNormalizedPhone(normalizedPhone)) {
      alert("El teléfono debe estar en formato internacional. Ejemplo: +51987654321")
      return
    }

    setSaving(true)

    try {
      const normalizedName = fullName.trim()
      const normalizedProfession = profession.trim()
      const normalizedCountryCode = countryCode.trim().toUpperCase()
      const normalizedCity = city.trim()
      const normalizedProfileCurrencyCode = profileCurrencyCode.trim().toUpperCase() || "PEN"
      const normalizedLanguage = language.trim().toLowerCase() || "es"
      const normalizedPreferredLanguage = preferredLanguage.trim().toLowerCase() || normalizedLanguage
      const normalizedTimezone = timezone.trim() || "America/Lima"

      const { error: clientError } = await supabase
        .from("clients")
        .update({
          name: normalizedName || null,
          phone: normalizedPhone,
          phone_normalized: normalizedPhone,
          profession_code: normalizedProfession || null,
          country_code: normalizedCountryCode || null,
          city: normalizedCity || null,
          currency_code: normalizedProfileCurrencyCode,
          language: normalizedLanguage,
          preferred_language: normalizedPreferredLanguage,
          timezone: normalizedTimezone,
          timezone_source: "manual",
          email: email || null,
        })
        .eq("id", clientId)

      if (clientError) {
        throw clientError
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: normalizedName,
          phone: normalizedPhone,
          phone_normalized: normalizedPhone,
          profession_code: normalizedProfession,
          preferred_language: normalizedPreferredLanguage,
          timezone: normalizedTimezone,
          country_code: normalizedCountryCode,
          city: normalizedCity,
        },
      })

      if (authUpdateError) {
        throw authUpdateError
      }


      alert("Configuración guardada correctamente.")
      await loadData()
    } catch (error: any) {
      alert(error.message || "No se pudo guardar la configuración.")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePlan = (planCode: string) => {
    if (!clientId) {
      alert("No encontramos el cliente de esta cuenta.")
      return
    }

    window.location.href = `/iniciar-pago?plan=${planCode}&cid=${clientId}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando configuración...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0F1F63]">Configuración y facturación</h1>
        <p className="text-muted-foreground mt-1">
          Administra tu perfil, idioma base, timezone, seguridad y suscripción.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[#3B82F6]" />
              <h2 className="text-xl font-semibold text-[#0F1F63]">Perfil</h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-bold text-3xl">
                {initials}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Cuenta conectada</p>
                <p className="font-medium text-[#0F1F63]">{email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliente: {clientId}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Nombre completo
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Email
                </label>
                <Input
                  value={email}
                  disabled
                  className="h-12 rounded-xl bg-secondary/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Teléfono
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="+51987654321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Teléfono normalizado
                </label>
                <Input
                  value={phoneNormalized}
                  disabled
                  className="h-12 rounded-xl bg-secondary/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Profesión
                </label>
                <Input
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  País
                </label>
                <Input
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl"
                  placeholder="PE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Ciudad
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Moneda base del usuario
                </label>
                <Input
                  value={profileCurrencyCode}
                  onChange={(e) => setProfileCurrencyCode(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl"
                  placeholder="PEN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Idioma UI
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-12 rounded-xl border border-border bg-background px-3 outline-none"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Idioma base de Operaly
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full h-12 rounded-xl border border-border bg-background px-3 outline-none"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Timezone
                </label>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="America/Lima"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F63] mb-2">
                  Timezone automática detectada
                </label>
                <Input
                  value={timezoneAuto}
                  disabled
                  className="h-12 rounded-xl bg-secondary/40"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl border border-border p-4 bg-secondary/20">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Fuente de timezone
                </p>
                <p className="text-sm font-medium text-[#0F1F63]">
                  {timezoneSource || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4 bg-secondary/20">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Estado del teléfono
                </p>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getPhoneStatusBadgeClass(
                    phoneVerificationStatus
                  )}`}
                >
                  {phoneVerificationStatus || "pending"}
                </span>
                <p className="text-xs text-muted-foreground mt-2">
                  Verificado: {formatDateTime(phoneVerifiedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Solicitud: {formatDateTime(phoneVerificationRequestedAt)}
                </p>
              </div>
            </div>

            <Button
              className="mt-6 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-xl font-semibold text-[#0F1F63]">
                Resumen operativo
              </h2>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                  <p className="text-sm font-medium text-[#0F1F63]">Teléfono activo</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {phone || "No configurado"}
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#3B82F6]" />
                  <p className="text-sm font-medium text-[#0F1F63]">Ubicación base</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {city || "—"} {countryCode ? `(${countryCode})` : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#3B82F6]" />
                  <p className="text-sm font-medium text-[#0F1F63]">Idioma y zona horaria</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {preferredLanguage || language || "es"} · {timezone || "America/Lima"}
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#3B82F6]" />
                  <p className="text-sm font-medium text-[#0F1F63]">Moneda de cobro</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {BILLING_CURRENCY_CODE}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="w-5 h-5 text-[#0EA5E9]" />
              <h2 className="text-xl font-semibold text-[#0F1F63]">
                Plan y facturación
              </h2>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/20 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plan actual</p>
                  <p className="text-2xl font-semibold text-[#0F1F63]">
                    {currentPlanLabel}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Código: {effectivePlanCode}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getPlanStatusBadgeClass(
                    effectivePlanStatus
                  )}`}
                >
                  {effectivePlanStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Importe
                  </p>
                  <p className="text-sm font-medium text-[#0F1F63] mt-1">
                    {formatMoney(BILLING_CURRENCY_CODE, getDisplayPlanPrice(effectivePlanCode))}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Periodicidad
                  </p>
                  <p className="text-sm font-medium text-[#0F1F63] mt-1">
                    {getDisplayPlanPeriodicity(effectivePlanCode)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Inicio
                  </p>
                  <p className="text-sm font-medium text-[#0F1F63] mt-1">
                    {formatDateTime(subscription?.started_at || subscription?.created_at || null)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Próxima renovación
                  </p>
                  <p className="text-sm font-medium text-[#0F1F63] mt-1">
                    {formatDateTime(subscription?.current_period_end || null)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => handleChangePlan("pro")}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Cambiar plan
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-[#3B82F6]" />
              <h2 className="text-xl font-semibold text-[#0F1F63]">
                Historial de pagos
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Aún no hay pagos registrados para esta cuenta.
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {formatMoney(BILLING_CURRENCY_CODE, payment.amount_usd)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {payment.provider || "MercadoPago"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Ref: {payment.provider_ref || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha: {formatDateTime(payment.paid_at || payment.created_at)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getPaymentBadgeClass(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <RefreshCcw className="w-5 h-5 text-[#06B6D4]" />
              <h2 className="text-xl font-semibold text-[#0F1F63]">
                Cambiar plan
              </h2>
            </div>

            <div className="grid gap-4">
              {PAID_PLANS.map((plan) => {
                const isCurrent = effectivePlanCode === plan.code

                return (
                  <div
                    key={plan.code}
                    className={`rounded-2xl border p-4 ${
                      isCurrent
                        ? "border-[#3B82F6] bg-[#3B82F6]/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#0F1F63]">{plan.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Código del plan: {plan.code}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cobro {getDisplayPlanPeriodicity(plan.code)} en {BILLING_CURRENCY_CODE}
                        </p>
                      </div>

                      <Button
                        variant={isCurrent ? "secondary" : "outline"}
                        className="rounded-xl"
                        onClick={() => handleChangePlan(plan.code)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? "Plan actual" : "Elegir"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Voice Settings Section */}
        <VoiceSettingsSection
          clientId={clientId}
          planCode={effectivePlanCode}
          voiceSettings={voiceSettings}
          minutesUsed={voiceMinutesUsed}
          minutesLimit={voiceMinutesLimit}
          onSaved={loadData}
        />

      </div>
    </div>
  )
}
