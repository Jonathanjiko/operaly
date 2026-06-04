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

type CountryOption = {
  code: string
  name: string
  dialCode: string
  placeholder: string
}

const WEB_LOCALE_TO_LANGUAGE: Record<string, string> = {
  es: "es",
  en: "en",
  pt: "pt",
  de: "de",
  fr: "fr",
  it: "it",
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "PE", name: "Peru", dialCode: "51", placeholder: "944 793 144" },
  { code: "MX", name: "Mexico", dialCode: "52", placeholder: "55 1234 5678" },
  { code: "CO", name: "Colombia", dialCode: "57", placeholder: "310 123 4567" },
  { code: "CL", name: "Chile", dialCode: "56", placeholder: "9 1234 5678" },
  { code: "AR", name: "Argentina", dialCode: "54", placeholder: "11 1234 5678" },
  { code: "US", name: "Estados Unidos", dialCode: "1", placeholder: "555 123 4567" },
  { code: "ES", name: "Espana", dialCode: "34", placeholder: "612 345 678" },
  { code: "EC", name: "Ecuador", dialCode: "593", placeholder: "99 123 4567" },
  { code: "BO", name: "Bolivia", dialCode: "591", placeholder: "71234567" },
  { code: "PY", name: "Paraguay", dialCode: "595", placeholder: "971 123 456" },
  { code: "UY", name: "Uruguay", dialCode: "598", placeholder: "94 123 456" },
  { code: "VE", name: "Venezuela", dialCode: "58", placeholder: "412 123 4567" },
  { code: "CA", name: "Canada", dialCode: "1", placeholder: "416 555 1234" },
  { code: "GB", name: "Reino Unido", dialCode: "44", placeholder: "7911 123456" },
  { code: "BR", name: "Brasil", dialCode: "55", placeholder: "11 91234 5678" },
  { code: "FR", name: "Francia", dialCode: "33", placeholder: "6 12 34 56 78" },
  { code: "DE", name: "Alemania", dialCode: "49", placeholder: "1512 3456789" },
  { code: "IT", name: "Italia", dialCode: "39", placeholder: "312 345 6789" },
  { code: "PT", name: "Portugal", dialCode: "351", placeholder: "912 345 678" },
  { code: "NL", name: "Paises Bajos", dialCode: "31", placeholder: "6 12345678" },
  { code: "AU", name: "Australia", dialCode: "61", placeholder: "412 345 678" },
  { code: "JP", name: "Japon", dialCode: "81", placeholder: "90 1234 5678" },
  { code: "KR", name: "Corea del Sur", dialCode: "82", placeholder: "10 1234 5678" },
  { code: "IN", name: "India", dialCode: "91", placeholder: "98765 43210" },
  { code: "CN", name: "China", dialCode: "86", placeholder: "138 0013 8000" },
  { code: "AE", name: "Emiratos Arabes Unidos", dialCode: "971", placeholder: "50 123 4567" },
  { code: "SA", name: "Arabia Saudita", dialCode: "966", placeholder: "50 123 4567" },
  { code: "ZA", name: "Sudafrica", dialCode: "27", placeholder: "82 123 4567" },
  { code: "TR", name: "Turquia", dialCode: "90", placeholder: "532 123 4567" },
  { code: "RU", name: "Rusia", dialCode: "7", placeholder: "912 345 6789" },
]

const DIAL_BY_COUNTRY = Object.fromEntries(COUNTRY_OPTIONS.map((item) => [item.code, item.dialCode]))
const PLACEHOLDER_BY_COUNTRY = Object.fromEntries(COUNTRY_OPTIONS.map((item) => [item.code, item.placeholder]))

const LOCAL_LEN: Record<string, [number, number]> = {
  PE: [9, 9],
  MX: [10, 10],
  CO: [10, 10],
  CL: [9, 9],
  AR: [10, 10],
  US: [10, 10],
  ES: [9, 9],
  EC: [9, 9],
  BO: [8, 8],
  PY: [9, 9],
  UY: [8, 9],
  VE: [10, 10],
  CA: [10, 10],
  GB: [10, 10],
  BR: [10, 11],
  FR: [9, 9],
  DE: [10, 12],
  IT: [9, 10],
  PT: [9, 9],
  NL: [9, 9],
  AU: [9, 9],
  JP: [10, 11],
  KR: [9, 10],
  IN: [10, 10],
  CN: [11, 11],
  AE: [9, 9],
  SA: [9, 9],
  ZA: [9, 10],
  TR: [10, 10],
  RU: [10, 10],
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return ""

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1]

  return value ? decodeURIComponent(value) : ""
}

function normalizeLocalPhoneInput(input: string, countryCode: string) {
  const dialCode = DIAL_BY_COUNTRY[countryCode] || ""
  let digits = String(input || "").replace(/\D/g, "")

  if (!digits) return ""

  if (digits.startsWith("00")) {
    digits = digits.slice(2)
  }

  if (dialCode && digits.startsWith(dialCode)) {
    digits = digits.slice(dialCode.length)
  }

  return digits
}

function validateLocalPhone(input: string, countryCode: string): { ok: boolean; value: string; error: string } {
  const dialCode = DIAL_BY_COUNTRY[countryCode]
  if (!dialCode) {
    return { ok: false, value: "", error: "Selecciona un pais valido antes de continuar." }
  }

  const digits = normalizeLocalPhoneInput(input, countryCode)
  if (!digits) {
    return { ok: false, value: "", error: "Ingresa tu numero de WhatsApp." }
  }

  const lenRange = LOCAL_LEN[countryCode]
  if (lenRange) {
    const [min, max] = lenRange
    if (digits.length < min || digits.length > max) {
      return {
        ok: false,
        value: "",
        error: `El numero para ${countryCode} debe tener ${min === max ? min : `${min}-${max}`} digitos locales.`,
      }
    }
  }

  return { ok: true, value: `+${dialCode}${digits}`, error: "" }
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
  const [phoneLocal, setPhoneLocal] = useState("")
  const [language, setLanguage] = useState("es")
  const [phoneError, setPhoneError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [authData, setAuthData] = useState<RegisterAuthData | null>(null)

  const selectedPlan = useMemo(() => getPlanByCode(planCode), [planCode])
  const progress = Math.round((step / totalSteps) * 100)
  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((item) => item.code === countryCode) || COUNTRY_OPTIONS[0],
    [countryCode],
  )
  const dialCode = `+${selectedCountry.dialCode}`
  const normalizedPhonePreview = useMemo(
    () => validateLocalPhone(phoneLocal, countryCode),
    [phoneLocal, countryCode],
  )

  useEffect(() => {
    const hydrate = async () => {
      const detectedCountry = getCookieValue("operaly_country")
      const detectedWebLocale = getCookieValue("operaly_web_locale")
      const detectedLanguage = WEB_LOCALE_TO_LANGUAGE[detectedWebLocale] || ""

      if (detectedCountry && COUNTRY_OPTIONS.some((item) => item.code === detectedCountry.toUpperCase())) {
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

        const phoneNormalized = String(user.user_metadata?.phone_normalized || "").trim()
        const userCountry = String(user.user_metadata?.country_code || "").trim().toUpperCase()

        if (userCountry && COUNTRY_OPTIONS.some((item) => item.code === userCountry)) {
          setCountryCode(userCountry)
        }

        if (phoneNormalized.startsWith("+")) {
          const candidateCountry = COUNTRY_OPTIONS.find((item) => phoneNormalized.startsWith(`+${item.dialCode}`))
          if (candidateCountry) {
            setCountryCode(candidateCountry.code)
            setPhoneLocal(phoneNormalized.slice(candidateCountry.dialCode.length + 1))
          }
        }

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

    void hydrate()
  }, [language, planCode])

  const nextStep = () => {
    if (step === 4) {
      const result = validateLocalPhone(phoneLocal, countryCode)
      if (!result.ok) {
        setPhoneError(result.error)
        return
      }
      setPhoneError("")
    }
    setStep((current) => Math.min(totalSteps, current + 1))
  }

  const prevStep = () => setStep((current) => Math.max(1, current - 1))

  const canContinue =
    (step === 1 && fullName.trim().length >= 2) ||
    (step === 2 && profession.trim().length > 0) ||
    (step === 3 && countryCode.trim().length > 0 && city.trim().length >= 2) ||
    (step === 4 && normalizeLocalPhoneInput(phoneLocal, countryCode).length >= 7) ||
    (step === 5 && language.trim().length > 0)

  const handleFinish = async () => {
    const normalized = validateLocalPhone(phoneLocal, countryCode)
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
      if (!user) throw new Error("Tu sesion no esta activa. Vuelve a registrarte.")

      const { data: provisionData, error: provisionError } = await supabase.rpc(
        "operaly_provision_signup",
        {
          p_full_name: fullName,
          p_whatsapp_phone: normalized.value,
          p_country_code: countryCode,
          p_profession_code: profession,
          p_plan_code: planCode,
          p_activate_now: planCode === "trial",
        },
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
          { onConflict: "client_id,pref_key" },
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
        }),
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

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex justify-center">
          <Image src="/images/operaly-logo.png" alt="Operaly" width={48} height={48} />
        </div>

        <div className="mx-auto mb-6 max-w-2xl">
          <div className="mb-2 flex justify-between text-sm text-[#5F6B7A]">
            <span>Paso {step} de {totalSteps}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE5F2]">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mx-auto max-w-2xl rounded-3xl border border-[#E6EDF7] bg-white p-8 shadow-xl sm:p-10">
          {step === 1 && (
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#132B73]">Tu nombre profesional</h1>
              <p className="mb-8 text-[#5F6B7A]">Operaly te identificara con este nombre.</p>
              <Input
                placeholder="Ej: Dr. Juan Perez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-2xl border-[#D9E1EC] text-base"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#132B73]">Tu especialidad</h1>
              <p className="mb-8 text-[#5F6B7A]">Personaliza Operaly para tu contexto profesional.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              <h1 className="mb-2 text-3xl font-bold text-[#132B73]">Tu ubicacion</h1>
              <p className="mb-6 text-[#5F6B7A]">Tu zona horaria y moneda se configuran automaticamente.</p>
              <p className="mb-3 text-sm font-semibold text-[#132B73]">Pais</p>
              <div className="mb-6 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                {COUNTRY_OPTIONS.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setCountryCode(country.code)}
                    className={`h-11 rounded-xl border px-3 text-sm transition-all ${
                      countryCode === country.code
                        ? "border-[#3B82F6] bg-[#EFF6FF] font-medium text-[#132B73]"
                        : "border-[#D9E1EC] text-[#1D2A3B] hover:border-[#3B82F6]/50"
                    }`}
                  >
                    {country.name} · +{country.dialCode}
                  </button>
                ))}
              </div>
              <p className="mb-2 text-sm font-semibold text-[#132B73]">Ciudad</p>
              <Input
                placeholder="Ej: Lima, Bogota, Ciudad de Mexico"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-14 rounded-2xl border-[#D9E1EC]"
                onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#132B73]">Numero de WhatsApp</h1>
              <p className="mb-6 text-[#5F6B7A]">
                Elige tu pais y escribe solo tu celular local. Operaly aplica el codigo automaticamente.
              </p>

              <div className="rounded-2xl border border-[#D9E1EC] bg-[#F8FBFF] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 min-w-[92px] items-center justify-center rounded-2xl bg-white px-4 font-mono text-base font-semibold text-[#132B73] shadow-sm">
                    {dialCode}
                  </div>
                  <Input
                    placeholder={PLACEHOLDER_BY_COUNTRY[countryCode] || "Tu numero local"}
                    value={phoneLocal}
                    onChange={(e) => {
                      setPhoneLocal(normalizeLocalPhoneInput(e.target.value, countryCode))
                      if (phoneError) setPhoneError("")
                    }}
                    className={`h-14 rounded-2xl border-[#D9E1EC] text-lg font-mono ${
                      phoneError ? "border-red-400 focus:border-red-400" : ""
                    }`}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && canContinue && nextStep()}
                    inputMode="numeric"
                  />
                </div>
                <p className="mt-3 text-xs text-[#7A8493]">
                  Si pegas un numero completo como +51 o +52, Operaly toma solo la parte local y evita duplicar el codigo.
                </p>
              </div>

              {phoneError ? (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <span className="mt-0.5 text-lg text-red-500">!</span>
                  <p className="text-sm text-red-600">{phoneError}</p>
                </div>
              ) : null}

              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {normalizedPhonePreview.ok ? (
                  <>
                    Se guardara como <span className="font-mono font-semibold">{normalizedPhonePreview.value}</span>
                  </>
                ) : (
                  "Primero valida tu numero local para ver como quedara guardado."
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#132B73]">Idioma preferido</h1>
              <p className="mb-6 text-[#5F6B7A]">Operaly te hablara en este idioma por WhatsApp.</p>

              <div className="mb-8 grid grid-cols-3 gap-3">
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

              <div className="space-y-2 rounded-2xl border border-[#D9E1EC] bg-[#F7FAFF] p-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5F6B7A]">Nombre</span>
                  <span className="font-semibold text-[#132B73]">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F6B7A]">Especialidad</span>
                  <span className="font-semibold text-[#132B73]">{profession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F6B7A]">Pais</span>
                  <span className="font-semibold text-[#132B73]">
                    {countryCode} - {city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F6B7A]">WhatsApp</span>
                  <span className="font-mono font-semibold text-[#132B73]">
                    {normalizedPhonePreview.ok ? normalizedPhonePreview.value : `${dialCode}${normalizeLocalPhoneInput(phoneLocal, countryCode)}`}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t border-[#E2E8F0] pt-2">
                  <span className="text-[#5F6B7A]">Plan</span>
                  <span className={`text-base font-bold ${planCode === "trial" ? "text-[#3B82F6]" : "text-[#7C3AED]"}`}>
                    {selectedPlan?.name || planCode}
                    {planCode === "trial" ? " - Gratis 7 dias" : ""}
                  </span>
                </div>
              </div>

              {planCode !== "trial" ? (
                <div className="mt-4 rounded-2xl border border-orange-200 bg-[#FFF7ED] p-4">
                  <p className="text-sm font-medium text-orange-700">
                    Despues de confirmar, seras dirigido al pago para activar tu plan {selectedPlan?.name}.
                  </p>
                </div>
              ) : null}

              {planCode === "trial" ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-[#F0FDF4] p-4">
                  <p className="text-sm font-medium text-emerald-700">
                    Tu periodo de prueba de 7 dias comienza ahora. Operaly te escribira por WhatsApp de inmediato.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-[#E8EEF6] pt-6">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-0 text-[#5F6B7A]"
              onClick={step === 1 ? () => router.push(`/register?plan=${planCode}`) : prevStep}
              disabled={submitting}
            >
              ← Atras
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canContinue || submitting}
                className="h-12 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] px-8 font-semibold text-white hover:opacity-90"
              >
                Siguiente →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={!canContinue || submitting}
                className="h-12 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] px-8 font-semibold text-white hover:opacity-90"
              >
                {submitting
                  ? "Configurando..."
                  : planCode === "trial"
                    ? "Ir al dashboard"
                    : "Continuar al pago"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
