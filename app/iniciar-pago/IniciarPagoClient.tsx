"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  BadgeCheck,
  CreditCard,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPlanByCode, OPERLAY_PLANS, type OperalyPlanCode } from "@/lib/plans"

type PendingSignup = {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName?: string
  country: string
  businessType: string
  password: string
  planCode: "trial" | "core" | "pro" | "pro_plus"
}

const BILLING_CURRENCY_CODE = "USD"

const PAID_PLANS: OperalyPlanCode[] = ["core", "pro", "pro_plus"]

export default function IniciarPagoClient() {
  const searchParams = useSearchParams()

  const initialPlan = (searchParams.get("plan") || "pro") as OperalyPlanCode
  const clientId = searchParams.get("cid")
  const reference = searchParams.get("ref")

  const [selectedPlanCode, setSelectedPlanCode] = useState<OperalyPlanCode>(
    initialPlan === "trial" ? "pro" : initialPlan
  )
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const selectedPlan = useMemo(() => {
    return getPlanByCode(selectedPlanCode)
  }, [selectedPlanCode])

  useEffect(() => {
    const raw = localStorage.getItem("operaly_pending_signup")

    if (raw) {
      try {
        setPendingSignup(JSON.parse(raw))
      } catch {
        setPendingSignup(null)
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const current = new URL(window.location.href)
    current.searchParams.set("plan", selectedPlanCode)

    if (clientId) {
      current.searchParams.set("cid", clientId)
    }

    if (reference) {
      current.searchParams.set("ref", reference)
    }

    window.history.replaceState({}, "", current.toString())
  }, [selectedPlanCode, clientId, reference])

  const handlePay = async () => {
    if (!selectedPlan || selectedPlan.code === "trial") {
      setCheckoutError("Selecciona un plan de pago válido.")
      return
    }

    if (!clientId) {
      setCheckoutError("Falta el identificador del cliente para iniciar el cobro.")
      return
    }

    setCheckoutError("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          planCode: selectedPlan.code,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "checkout_failed")
      }

      if (!payload?.payment_url) {
        throw new Error("missing_payment_url")
      }

      window.location.href = payload.payment_url
    } catch (error: any) {
      setCheckoutError(
        error?.message || "No se pudo iniciar el checkout con Izipay."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <p className="text-sm text-slate-600">Preparando checkout seguro...</p>
      </div>
    )
  }

  if (!selectedPlan || selectedPlan.code === "trial") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#F7F9FC]">
        <div className="max-w-lg text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Selecciona un plan de pago
          </h1>
          <p className="text-slate-600">
            Esta página está pensada para cobrar planes de pago de Operaly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={170}
            height={54}
            priority
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 mb-5">
              <Lock className="h-3.5 w-3.5" />
              Pago seguro operado por Izipay
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-3">
              Finaliza tu suscripción a {selectedPlan.name}
            </h1>

            <p className="text-slate-600 text-[15px] leading-7 mb-8">
              Elige tu plan aquí mismo y continúa con un checkout seguro. Izipay
              procesará el pago de tu suscripción y Operaly activará tu cuenta
              automáticamente cuando se confirme la operación.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Seguridad</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">
                  Izipay opera el procesamiento del pago con validación segura.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">Cobro</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">
                  Todos los planes de Operaly se cobran en {BILLING_CURRENCY_CODE}.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Activación</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">
                  Al confirmarse el pago, tu plan y beneficios quedan activos.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-900">
                  Elige tu plan aquí
                </h2>
              </div>

              <div className="p-5 md:p-6 grid gap-4">
                {PAID_PLANS.map((planCode) => {
                  const plan = getPlanByCode(planCode)
                  if (!plan) {
                    return null
                  }

                  const isActive = selectedPlanCode === plan.code

                  return (
                    <button
                      key={plan.code}
                      type="button"
                      onClick={() => setSelectedPlanCode(plan.code)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        isActive
                          ? "border-[#0F1F63] bg-[#0F1F63]/5 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-slate-950">
                            {plan.name}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {plan.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-semibold text-slate-950">
                            {BILLING_CURRENCY_CODE} {plan.price}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">mensual</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {plan.features.slice(0, 4).map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                            <p className="text-sm text-slate-700">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-900">
                  Resumen del plan seleccionado
                </h2>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-2xl font-semibold text-slate-950">
                      {selectedPlan.name}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedPlan.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-4xl font-semibold text-slate-950 leading-none">
                      {BILLING_CURRENCY_CODE}
                    </p>
                    <p className="text-4xl font-semibold text-slate-950 leading-none mt-1">
                      {selectedPlan.price}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">mensual</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedPlan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                      <p className="text-sm text-slate-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {checkoutError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{checkoutError}</p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePay}
                disabled={submitting}
                className="h-12 rounded-xl bg-[#0F1F63] hover:bg-[#12297f] text-white px-6"
              >
                {submitting
                  ? "Conectando con Izipay..."
                  : `Pagar ${BILLING_CURRENCY_CODE} ${selectedPlan.price}`}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                <Lock className="h-3.5 w-3.5" />
                Conexión segura
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                Izipay
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                Visa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                Mastercard
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                Todas las tarjetas
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">
              Datos de activación
            </h2>

            <div className="space-y-4">
              {pendingSignup ? (
                <>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Nombre
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {pendingSignup.firstName} {pendingSignup.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {pendingSignup.email}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Teléfono
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {pendingSignup.phone || "No indicado"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Perfil
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {pendingSignup.businessType}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    No se encontraron datos adicionales del registro en el navegador.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Lo que pasará después del pago
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Izipay procesará tu pago de forma segura.</li>
                  <li>• Operaly activará tu plan automáticamente.</li>
                  <li>• Tu suscripción mensual quedará registrada.</li>
                  <li>• Los beneficios del plan se aplicarán a tu cuenta y a WhatsApp.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Datos del cobro
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Pasarela: Izipay.</li>
                  <li>• Moneda de cobro: {BILLING_CURRENCY_CODE}.</li>
                  <li>• Referencia: {reference || "Se generará al iniciar el pago."}</li>
                  <li>• Cliente: {clientId || "No disponible"}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Importante
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  El formulario de tarjeta y el procesamiento del pago están operados por
                  Izipay. Operaly usa ese resultado para actualizar la suscripción del cliente
                  y reflejar los beneficios del plan en el sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
