"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getPlanByCode, type OperalyPlanCode } from "@/lib/plans"
import {
  ASSISTANT_COUNTRIES,
  ASSISTANT_LANGUAGES,
  ASSISTANT_PROFESSIONS,
  normalizePhone,
} from "@/lib/assistant-options"

type RegisterAuthData = {
  email?: string
  planCode?: OperalyPlanCode
  authUserId?: string | null
  method?: string
}

export default function SetupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPlan =
    (searchParams.get("plan") as OperalyPlanCode | null) || "trial"

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

  useEffect(() => {
    const raw = localStorage.getItem("operaly_register_auth")

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as RegisterAuthData
        setAuthData(parsed)

        if (parsed.planCode) {
          setPlanCode(parsed.planCode)
        }
      } catch {}
    }
  }, [])

  const nextStep = () => {
    if (step === 4) {
      const normalized = normalizePhone(phone, countryCode)

      if (!normalized.ok) {
        setPhoneError(normalized.error)
        return
      }

      setPhoneError("")
    }

    setStep((s) => Math.min(totalSteps, s + 1))
  }

  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const canContinue =
    (step === 1 && fullName.trim().length >= 3) ||
    (step === 2 && profession.trim().length > 0) ||
    (step === 3 &&
      countryCode.trim().length > 0 &&
      city.trim().length >= 2) ||
    (step === 4 && phone.trim().length >= 7) ||
    (step === 5 && language.trim().length > 0)

  const handleFinish = async () => {
    const normalized = normalizePhone(phone, countryCode)

    if (!normalized.ok) {
      alert(normalized.error)
      return
    }

    setSubmitting(true)

    try {
      const browserTimeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima"

      const { data: sessionData } = await supabase.auth.getUser()
      const user = sessionData.user

      if (!user) {
        throw new Error("Tu sesión no está activa. Vuelve a registrarte.")
      }

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

      if (provisionError) {
        throw provisionError
      }

      const provisionRow = Array.isArray(provisionData)
        ? provisionData[0]
        : provisionData

      if (!provisionRow?.client_id) {
        throw new Error("No se pudo provisionar el cliente.")
      }

      const clientId = provisionRow.client_id as string

      const { error: completeError } = await supabase.rpc(
        "operaly_complete_assistant_profile",
        {
          p_client_id: clientId,
          p_city: city,
          p_preferred_language: language,
          p_phone_normalized: normalized.value,
          p_timezone: browserTimeZone,
        }
      )

      if (completeError) {
        throw completeError
      }

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          profession_code: profession,
          country_code: countryCode,
          city,
          phone,
          phone_normalized: normalized.value,
          preferred_language: language,
          account_type: "assistant",
          selected_plan: planCode,
          client_id: clientId,
          timezone: browserTimeZone,
        },
      })

      if (updateUserError) {
        throw updateUserError
      }

      const {
        data: refreshData,
        error: refreshError,
      } = await supabase.auth.refreshSession()

      if (refreshError) {
        throw refreshError
      }

      const refreshedClientId =
        refreshData.session?.user?.user_metadata?.client_id || clientId

      localStorage.setItem("operaly_client_id", refreshedClientId)
      localStorage.setItem("operaly_account_type", "assistant")
      localStorage.setItem(
        "operaly_assistant_profile",
        JSON.stringify({
          fullName,
          profession,
          countryCode,
          city,
          phone,
          phone_normalized: normalized.value,
          preferred_language: language,
          timezone: browserTimeZone,
          planCode,
        })
      )

      if (planCode === "trial") {
        router.push("/dashboard")
      } else {
        router.push(`/iniciar-pago?plan=${planCode}&cid=${clientId}`)
      }
    } catch (err: any) {
      alert(err.message || "No pudimos completar tu registro.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={56}
            height={56}
          />
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between text-sm text-[#5F6B7A] mb-3">
            <span>
              Paso {step} de {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#DCE5F2] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-[28px] shadow-[0_20px_60px_rgba(12,34,84,0.10)] border border-[#E6EDF7] p-10">
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#132B73] mb-3">
                  Tu nombre profesional
                </h1>
                <p className="text-[#5F6B7A] text-lg">
                  Este nombre usará Operaly para identificarte.
                </p>
              </div>

              <Input
                placeholder="Ej: Dr. Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-16 rounded-2xl text-lg border-[#D9E1EC]"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#132B73] mb-3">
                  Tu especialidad
                </h1>
                <p className="text-[#5F6B7A] text-lg">
                  Esto nos ayuda a personalizar Operaly para tu contexto.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {ASSISTANT_PROFESSIONS.map((item) => {
                  const active = profession === item.code

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setProfession(item.code)}
                      className={`h-16 rounded-2xl border text-left px-5 text-lg transition-all ${
                        active
                          ? "border-[#3B82F6] bg-[#3B82F6]/5 text-[#132B73]"
                          : "border-[#D9E1EC] bg-white text-[#1D2A3B]"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#132B73] mb-3">
                  Tu ubicación
                </h1>
                <p className="text-[#5F6B7A] text-lg">
                  Esto nos ayuda a personalizar la experiencia para tu región.
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-[#132B73] mb-3">
                  País
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {ASSISTANT_COUNTRIES.map((item) => {
                    const active = countryCode === item.code

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setCountryCode(item.code)}
                        className={`h-16 rounded-2xl border text-left px-5 text-lg transition-all ${
                          active
                            ? "border-[#3B82F6] bg-[#3B82F6]/5 text-[#132B73]"
                            : "border-[#D9E1EC] bg-white text-[#1D2A3B]"
                        }`}
                      >
                        {item.code} {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[#132B73] mb-3">
                  Ciudad
                </p>

                <Input
                  placeholder="Ej: Lima, Ciudad de México, Bogotá"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-16 rounded-2xl text-lg border-[#D9E1EC]"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#132B73] mb-3">
                  Número de teléfono
                </h1>

                <p className="text-[#5F6B7A] text-lg">
                  Este será tu número principal. Puedes escribirlo con código
                  país, por ejemplo: +51999999999.
                </p>
              </div>

              <Input
                placeholder="+51 999 999 999"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)

                  if (phoneError) {
                    setPhoneError("")
                  }
                }}
                className={`h-16 rounded-2xl text-lg ${
                  phoneError ? "border-red-400" : "border-[#D9E1EC]"
                }`}
              />

              {phoneError && (
                <p className="text-sm text-red-500 mt-3">{phoneError}</p>
              )}

              <p className="text-sm text-[#7A8493] mt-4">
                Si no incluyes el +, intentaremos completarlo según el país
                elegido.
              </p>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#132B73] mb-3">
                  Idioma de conversación
                </h1>
                <p className="text-[#5F6B7A] text-lg">
                  Elige el idioma por defecto en el que deseas conversar con
                  Operaly.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {ASSISTANT_LANGUAGES.map((item) => {
                  const active = language === item.code

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLanguage(item.code)}
                      className={`h-16 rounded-2xl border text-left px-5 text-lg transition-all ${
                        active
                          ? "border-[#3B82F6] bg-[#3B82F6]/5 text-[#132B73]"
                          : "border-[#D9E1EC] bg-white text-[#1D2A3B]"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-[#D9E1EC] bg-[#F7FAFF] p-5">
                <p className="text-sm text-[#5F6B7A]">
                  Plan seleccionado:{" "}
                  <strong>{selectedPlan?.name || planCode}</strong>
                </p>
                <p className="text-sm text-[#5F6B7A] mt-1">
                  Método de acceso:{" "}
                  <strong>
                    {authData?.method === "email" ? "Email" : "OAuth"}
                  </strong>
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-[#E8EEF6] mt-10 pt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="h-12 px-0 text-[#5F6B7A]"
              onClick={
                step === 1
                  ? () => router.push(`/register?plan=${planCode}`)
                  : prevStep
              }
              disabled={submitting}
            >
              Atrás
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canContinue || submitting}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#8DB9FF] to-[#8CE2F0] text-white hover:opacity-90"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={!canContinue || submitting}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] text-white hover:opacity-90"
              >
                {submitting
                  ? "Guardando..."
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
