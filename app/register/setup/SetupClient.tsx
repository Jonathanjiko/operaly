"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getPlanByCode, type OperalyPlanCode } from "@/lib/plans"
import {
  ASSISTANT_LANGUAGES,
  ASSISTANT_PROFESSIONS,
} from "@/lib/assistant-options"

type RegisterAuthData = {
  email?: string
  planCode?: OperalyPlanCode
  authUserId?: string | null
  method?: string
}

const WEB_LOCALE_TO_LANGUAGE: Record<string, string> = {
  es: "es",
  en: "en",
  pt: "pt",
  de: "de",
  fr: "fr",
  it: "it",
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return ""

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1]

  return value ? decodeURIComponent(value) : ""
}

const DIAL: Record<string, string> = {
  PE: "51", MX: "52", CO: "57", AR: "54", CL: "56", EC: "593",
  ES: "34", US: "1", CA: "1", GB: "44", BR: "55", FR: "33",
  DE: "49", IT: "39", PT: "351", NL: "31", AU: "61", JP: "81",
  KR: "82", IN: "91", AE: "971", SA: "966", ZA: "27", TR: "90",
  RU: "7", BO: "591", PY: "595", UY: "598", VE: "58", CN: "86",
}

const LOCAL_LEN: Record<string, [number, number]> = {
  PE: [9, 9], MX: [10, 10], CO: [10, 10], AR: [10, 10], CL: [9, 9],
  EC: [9, 9], ES: [9, 9], US: [10, 10], CA: [10, 10], GB: [10, 10],
  BR: [10, 11], FR: [9, 9], DE: [10, 12], IT: [9, 10], PT: [9, 9],
  NL: [9, 9], AU: [9, 9], JP: [10, 11], KR: [9, 10], IN: [10, 10],
  AE: [9, 9], SA: [9, 9], ZA: [9, 10], TR: [10, 10], RU: [10, 10],
  BO: [8, 8], PY: [9, 9], UY: [8, 9], VE: [10, 10], CN: [11, 11],
}

const PHONE_PLACEHOLDER: Record<string, string> = {
  PE: "999 123 456", MX: "55 1234 5678", CO: "310 123 4567",
  AR: "11 1234 5678", CL: "9 1234 5678", US: "555 123 4567",
  GB: "7911 123456", ES: "612 345 678", BR: "11 91234 5678",
  OT: "Escribe tu número con código país",
}

function validateAnyPhone(input: string, countryCode: string): { ok: boolean; value: string; error: string } {
  const raw = (input || "").trim()
  if (!raw) return { ok: false, value: "", error: "Ingresa tu número de teléfono." }

  const cleaned = raw.replace(/[^\d+]/g, "")

  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1).replace(/\D/g, "")
    if (digits.length < 7 || digits.length > 15) {
      return { ok: false, value: "", error: "El número debe tener entre 7 y 15 dígitos (con código país)." }
    }
    return { ok: true, value: `+${digits}`, error: "" }
  }

  const DIAL: Record<string, string> = {
    PE: "51", MX: "52", CO: "57", AR: "54", CL: "56", EC: "593",
    ES: "34", US: "1", CA: "1", GB: "44", BR: "55", FR: "33",
    DE: "49", IT: "39", NL: "31", AU: "61", JP: "81", KR: "82",
    IN: "91", AE: "971", SA: "966", ZA: "27", TR: "90", RU: "7",
  }
  const LOCAL_LEN: Record<string, [number, number]> = {
    PE: [9, 9], MX: [10, 10], CO: [10, 10], AR: [10, 10], CL: [9, 9],
    EC: [9, 9], ES: [9, 9], US: [10, 10], CA: [10, 10], GB: [10, 10],
    BR: [10, 11], FR: [9, 9], DE: [10, 12], IT: [9, 10], NL: [9, 9],
    AU: [9, 9], JP: [10, 11], KR: [9, 10], IN: [10, 10], AE: [9, 9],
    SA: [9, 9], ZA: [9, 10], TR: [10, 10], RU: [10, 10],
  }

  const localDigits = cleaned.replace(/\D/g, "")
  const dial = DIAL[countryCode]
  const lenRange = LOCAL_LEN[countryCode]

  if (!dial) {
    if (localDigits.length >= 7 && localDigits.length <= 15) {
      return { ok: true, value: `+${localDigits}`, error: "" }
    }
    return { ok: false, value: "", error: "Escribe el número con código de país (ej: +1 555 123 4567)." }
  }

  if (lenRange) {
    const [min, max] = lenRange
    if (localDigits.length < min || localDigits.length > max) {
      return {
        ok: false,
        value: "",
        error: `El número para ${countryCode} debe tener ${min === max ? min : `${min}-${max}`} dígitos locales.`,
      }
    }
  }

  return { ok: true, value: `+${dial}${localDigits}`, error: "" }
}

export default function SetupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPlan = (searchParams.get("plan") as OperalyPlanCode | null) || "trial"
  const [planCode, setPlanCode] = useState<OperalyPlanCode>(initialPlan)

  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [fullName, setFullName] = useState("")
  const [profession, setProfession] = useState("")
  const [countryCode, setCountryCode] = useState("PE")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("es")
  const [phoneError, setPhoneError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [authData, setAuthData] = useState<RegisterAuthData | null>(null)

  const selectedPlan = useMemo(() => getPlanByCode(planCode), [planCode])
  const progress = Math.round((step / totalSteps) * 100)
  const normalizedPhonePreview = useMemo(() => validateAnyPhone(phone, countryCode), [phone, countryCode])
  const dialCode = DIAL[countryCode] ? `+${DIAL[countryCode]}` : ""

  useEffect(() => {
    const hydrate = async () => {
      const detectedCountry = getCookieValue("operaly_country")
      const detectedWebLocale = getCookieValue("operaly_web_locale")
      const detectedLanguage = WEB_LOCALE_TO_LANGUAGE[detectedWebLocale] || ""

      if (detectedCountry && countryCode === "PE") {
        setCountryCode(detectedCountry.toUpperCase())
      }

      if (detectedLanguage && language === "es") {
        setLanguage(detectedLanguage)
      }

      let parsedRaw: RegisterAuthData | null = null
      const raw = localStorage.getItem("operaly_register_auth")

      if (raw) {
        try {
          parsedRaw = JSON.parse(raw) as RegisterAuthData
          setAuthData(parsedRaw)
          if (parsedRaw.planCode) setPlanCode(parsedRaw.planCode)
        } catch {
          parsedRaw = null
        }
      }

      try {
        const { data: userData, error } = await supabase.auth.getUser()
        if (error) throw error
        const user = userData.user
        if (!user) return

        const nextStored: RegisterAuthData = {
          ...(parsedRaw || {}),
          email: user.email ?? parsedRaw?.email ?? undefined,
          planCode: parsedRaw?.planCode || planCode,
          authUserId: user.id,
          method: parsedRaw?.method || "google",
        }

        setAuthData((current) => current ?? nextStored)
        localStorage.setItem("operaly_register_auth", JSON.stringify(nextStored))
      } catch {
        // session may still be unavailable briefly after redirect
      }
    }

    hydrate()
  }, [planCode])

  const nextStep = () => {
    if (step === 4) {
      const result = validateAnyPhone(phone, countryCode)
      if (!result.ok) {
        setPhoneError(result.error)
        return
      }
      setPhoneError("")
    }
    setStep((s) => Math.min(totalSteps, s + 1))
  }

  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const canContinue =
    (step === 1 && fullName.trim().length >= 2) ||
    (step === 2 && profession.trim().length > 0) ||
    (step === 3 && countryCode.trim().length > 0 && city.trim().length >= 2) ||
    (step === 4 && phone.trim().length >= 7) ||
    (step === 5 && language.trim().length > 0)

  const handleFinish = async () => {
    const normalized = validateAnyPhone(phone, countryCode)
    if (!normalized.ok) {
      alert(normalized.error)
      return
    }

    setSubmitting(true)
    try {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima"
      const { data: sessionData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const user = sessionData.user
      if (!user) throw new Error("Tu sesión no está activa. Vuelve a registrarte.")

      const { data: provisionData, error: provisionError } = await supabase.rpc(
        "operaly_provision_signup",
        {
          p_full_name: fullName,
          p_whatsapp_phone: normalized.value,
          p_country_code: countryCode,
          p_profession_code: profession,
          p_plan_code: planCode,
          p_activate_now: planCode === "trial",
        }
      )
      if (provisionError) throw provisionError

      const row = Array.isArray(provisionData) ? provisionData[0] : provisionData
      if (!row?.client_id) throw new Error("No se pudo provisionar el cliente.")
      const clientId = row.client_id as string

      const { error: profileError } = await supabase.rpc("operaly_complete_assistant_profile", {
        p_client_id: clientId,
        p_city: city,
        p_preferred_language: language,
        p_phone_normalized: normalized.value,
        p_timezone: browserTimeZone,
      })
      if (profileError) console.warn("[setup] profile error:", profileError.message)

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          profession_code: profession,
          country_code: countryCode,
          city,
          phone_normalized: normalized.value,
          preferred_language: language,
          account_type: "assistant",
          selected_plan: planCode,
          client_id: clientId,
          timezone: browserTimeZone,
        },
      })
      if (updateUserError) throw updateUserError

      try {
        const now = new Date().toISOString()
        const webLocale = getCookieValue("operaly_web_locale") || language
        const { error: preferenceError } = await supabase.from("client_preferences").upsert(
          [
            {
              client_id: clientId,
              pref_key: "preferred_language",
              pref_value: language,
              source: "registration",
              updated_at: now,
            },
            {
              client_id: clientId,
              pref_key: "language_source",
              pref_value: "registration",
              source: "registration",
              updated_at: now,
            },
            {
              client_id: clientId,
              pref_key: "web_locale",
              pref_value: webLocale,
              source: "geoip_fallback",
              updated_at: now,
            },
            {
              client_id: clientId,
              pref_key: "timezone",
              pref_value: browserTimeZone,
              source: "registration",
              updated_at: now,
            },
          ],
          { onConflict: "client_id,pref_key" }
        )

        if (preferenceError) {
          console.warn("[setup] language preference upsert:", preferenceError.message)
        }
      } catch (preferenceErr) {
        console.warn("[setup] language preference upsert failed (non-blocking):", preferenceErr)
      }

      try {
        const syncResponse = await fetch("/api/auth/sync-app-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            authUserId: user.id,
            preferredLanguage: language,
            webLocale: getCookieValue("operaly_web_locale") || language,
            timezone: browserTimeZone,
          }),
        })

        if (!syncResponse.ok) {
          const payload = await syncResponse.json().catch(() => null)
          console.warn("[setup] sync-app-metadata returned non-OK:", payload || syncResponse.status)
        }
      } catch (syncErr) {
        console.warn("[setup] sync-app-metadata failed (non-blocking):", syncErr)
      }

      await supabase.rpc("queue_welcome_message", { p_client_id: clientId })

      const { data: refreshData } = await supabase.auth.refreshSession()
      const refreshedUser = refreshData?.session?.user
      const finalClientId =
        refreshedUser?.app_metadata?.client_id ||
        refreshedUser?.user_metadata?.client_id ||
        clientId

      localStorage.setItem("operaly_client_id", finalClientId)
      localStorage.setItem("operaly_account_type", "assistant")
      localStorage.removeItem("operaly_register_auth")
      localStorage.setItem(
        "operaly_assistant_profile",
        JSON.stringify({
          fullName,
          profession,
          countryCode,
          city,
          phone_normalized: normalized.value,
          preferred_language: language,
          language_source: "registration",
          web_locale: getCookieValue("operaly_web_locale") || language,
          timezone: browserTimeZone,
          planCode,
        })
      )

      if (planCode === "trial") {
        router.push("/connect-whatsapp")
      } else {
        router.push(`/iniciar-pago?plan=${planCode}&cid=${clientId}`)
      }
    } catch (err: any) {
      alert(err.message || "No pudimos completar tu registro. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const ALL_COUNTRIES = [
    { code: "PE", label: "🇵🇪 Perú" }, { code: "MX", label: "🇲🇽 México" },
    { code: "CO", label: "🇨🇴 Colombia" }, { code: "AR", label: "🇦🇷 Argentina" },
    { code: "CL", label: "🇨🇱 Chile" }, { code: "EC", label: "🇪🇨 Ecuador" },
    { code: "BO", label: "🇧🇴 Bolivia" }, { code: "PY", label: "🇵🇾 Paraguay" },
    { code: "UY", label: "🇺🇾 Uruguay" }, { code: "VE", label: "🇻🇪 Venezuela" },
    { code: "ES", label: "🇪🇸 España" }, { code: "US", label: "🇺🇸 EE.UU." },
    { code: "CA", label: "🇨🇦 Canadá" }, { code: "GB", label: "🇬🇧 Reino Unido" },
    { code: "BR", label: "🇧🇷 Brasil" }, { code: "FR", label: "🇫🇷 Francia" },
    { code: "DE", label: "🇩🇪 Alemania" }, { code: "IT", label: "🇮🇹 Italia" },
    { code: "PT", label: "🇵🇹 Portugal" }, { code: "AU", label: "🇦🇺 Australia" },
    { code: "JP", label: "🇯🇵 Japón" }, { code: "KR", label: "🇰🇷 Corea" },
    { code: "IN", label: "🇮🇳 India" }, { code: "CN", label: "🇨🇳 China" },
    { code: "AE", label: "🇦🇪 EAU" }, { code: "ZA", label: "🇿🇦 Sudáfrica" },
    { code: "OT", label: "🌍 Otro" },
  ]

  const PHONE_PLACEHOLDER: Record<string, string> = {
    PE: "+51 999 123 456", MX: "+52 55 1234 5678", CO: "+57 310 123 4567",
    AR: "+54 11 1234 5678", CL: "+56 9 1234 5678", US: "+1 555 123 4567",
    GB: "+44 7911 123456", ES: "+34 612 345 678", BR: "+55 11 91234 5678",
    OT: "+[código] número",
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image src="/images/operaly-logo.png" alt="Operaly" width={48} height={48} />
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-between text-sm text-[#5F6B7A] mb-2">
            <span>Paso {step} de {totalSteps}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#DCE5F2] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-[#E6EDF7] p-8 sm:p-10">
          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-[#132B73] mb-2">Tu nombre profesional</h1>
              <p className="text-[#5F6B7A] mb-8">Operaly te identificará con este nombre.</p>
              {false ? (
                <div className="rounded-2xl border border-[#D9E1EC] bg-[#F8FBFF] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 min-w-[84px] items-center justify-center rounded-2xl bg-white px-4 font-mono text-base font-semibold text-[#132B73] shadow-sm">
                      {dialCode}
                    </div>
                    <Input
                      placeholder={PHONE_PLACEHOLDER[countryCode] || "Tu número local"}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        if (phoneError) setPhoneError("")
                      }}
                      className={`h-14 rounded-2xl text-lg font-mono ${phoneError ? "border-red-400 focus:border-red-400" : "border-[#D9E1EC]"}`}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[#7A8493]">
                    Seleccionaste <strong>{countryCode}</strong>. Escribe solo tu número local y Operaly lo guardará normalizado.
                  </p>
                </div>
              ) : null}
              <Input
                placeholder="Ej: Dr. Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-2xl text-base border-[#D9E1EC]"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-[#132B73] mb-2">Tu especialidad</h1>
              <p className="text-[#5F6B7A] mb-8">Personaliza Operaly para tu contexto profesional.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ASSISTANT_PROFESSIONS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setProfession(item.code)}
                    className={`h-14 rounded-2xl border text-sm font-medium transition-all ${
                      profession === item.code
                        ? "border-[#3B82F6] bg-[#EFF6FF] text-[#132B73]"
                        : "border-[#D9E1EC] bg-white text-[#1D2A3B] hover:border-[#3B82F6]/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-[#132B73] mb-2">Tu ubicación</h1>
              <p className="text-[#5F6B7A] mb-6">Tu zona horaria y moneda se configuran automáticamente.</p>
              <p className="text-sm font-semibold text-[#132B73] mb-3">País</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-48 overflow-y-auto pr-1">
                {ALL_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountryCode(c.code)}
                    className={`h-11 rounded-xl border text-sm transition-all ${
                      countryCode === c.code
                        ? "border-[#3B82F6] bg-[#EFF6FF] text-[#132B73] font-medium"
                        : "border-[#D9E1EC] text-[#1D2A3B] hover:border-[#3B82F6]/50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="text-sm font-semibold text-[#132B73] mb-2">Ciudad</p>
              <Input
                placeholder="Ej: Lima, Bogotá, Ciudad de México"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-14 rounded-2xl border-[#D9E1EC]"
                onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-3xl font-bold text-[#132B73] mb-2">Número de WhatsApp</h1>
              <p className="text-[#5F6B7A] mb-6">
                Este número recibirá los mensajes de Operaly. Puede ser de cualquier país del mundo.
              </p>
              <Input
                placeholder={PHONE_PLACEHOLDER[countryCode] || "+[código] número"}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (phoneError) setPhoneError("")
                }}
                className={`h-14 rounded-2xl text-lg font-mono ${phoneError ? "border-red-400 focus:border-red-400" : "border-[#D9E1EC]"}`}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
              />
              {phoneError && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                  <p className="text-sm text-red-600">{phoneError}</p>
                </div>
              )}
              <p className="text-xs text-[#7A8493] mt-3">
                Formato: incluye el + y código de país. Ej: <strong>+51</strong> para Perú, <strong>+52</strong> para México, <strong>+1</strong> para EE.UU.
              </p>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="text-3xl font-bold text-[#132B73] mb-2">Idioma preferido</h1>
              <p className="text-[#5F6B7A] mb-6">Operaly te hablará en este idioma por WhatsApp.</p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {ASSISTANT_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    className={`h-14 rounded-2xl border text-sm font-medium transition-all ${
                      language === item.code
                        ? "border-[#3B82F6] bg-[#EFF6FF] text-[#132B73]"
                        : "border-[#D9E1EC] bg-white text-[#1D2A3B] hover:border-[#3B82F6]/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-[#F7FAFF] border border-[#D9E1EC] p-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#5F6B7A]">Nombre</span><span className="font-semibold text-[#132B73]">{fullName}</span></div>
                <div className="flex justify-between"><span className="text-[#5F6B7A]">Especialidad</span><span className="font-semibold text-[#132B73]">{profession}</span></div>
                <div className="flex justify-between"><span className="text-[#5F6B7A]">País</span><span className="font-semibold text-[#132B73]">{countryCode} — {city}</span></div>
                <div className="flex justify-between"><span className="text-[#5F6B7A]">WhatsApp</span><span className="font-semibold text-[#132B73] font-mono">{normalizedPhonePreview.ok ? normalizedPhonePreview.value : phone}</span></div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2 mt-1">
                  <span className="text-[#5F6B7A]">Plan</span>
                  <span className={`font-bold text-base ${planCode === "trial" ? "text-[#3B82F6]" : "text-[#7C3AED]"}`}>
                    {selectedPlan?.name || planCode}
                    {planCode === "trial" ? " — Gratis 7 días" : ""}
                  </span>
                </div>
              </div>

              {planCode !== "trial" && (
                <div className="mt-4 p-4 bg-[#FFF7ED] border border-orange-200 rounded-2xl">
                  <p className="text-sm text-orange-700 font-medium">
                    💳 Después de confirmar, serás dirigido al pago para activar tu plan {selectedPlan?.name}.
                  </p>
                </div>
              )}

              {planCode === "trial" && (
                <div className="mt-4 p-4 bg-[#F0FDF4] border border-emerald-200 rounded-2xl">
                  <p className="text-sm text-emerald-700 font-medium">
                    🎉 Tu período de prueba de 7 días comienza ahora. Operaly te escribirá por WhatsApp de inmediato.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-[#E8EEF6] mt-8 pt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-0 text-[#5F6B7A]"
              onClick={step === 1 ? () => router.push(`/register?plan=${planCode}`) : prevStep}
              disabled={submitting}
            >
              ← Atrás
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canContinue || submitting}
                className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] text-white hover:opacity-90 font-semibold"
              >
                Siguiente →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={!canContinue || submitting}
                className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] text-white hover:opacity-90 font-semibold"
              >
                {submitting
                  ? "Configurando..."
                  : planCode === "trial"
                  ? "🚀 Ir al dashboard"
                  : "💳 Continuar al pago"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
