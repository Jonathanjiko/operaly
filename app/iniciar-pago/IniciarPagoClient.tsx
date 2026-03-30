"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  BadgeCheck,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPlanByCode, type OperalyPlanCode } from "@/lib/plans"

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

function formatMoney(amount: number, currency = BILLING_CURRENCY_CODE) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

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
  
      const paymentUrl = String(payload?.payment_url || "").trim()
      const formToken = String(payload?.formToken || "").trim()
      const isDeferred = Boolean(payload?.deferred)
  
      // Caso 1: el backend sí devolvió token, pero el frontend aún no lo renderiza.
      if (formToken) {
        setCheckoutError(
          "Operaly recibió el token de pago, pero este frontend todavía no está renderizando el checkout real de Izipay. No voy a redirigirte a una URL incorrecta."
        )
        return
      }
  
      // Caso 2: URL vacía
      if (!paymentUrl) {
        throw new Error("missing_payment_url")
      }
  
      // Caso 3: evitar loop / falsa redirección al mismo checkout
      const currentUrl =
        typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""
  
      const normalizedPaymentUrl = paymentUrl.split("?")[0]
  
      if (
        normalizedPaymentUrl.endsWith("/iniciar-pago") ||
        normalizedPaymentUrl === currentUrl
      ) {
        setCheckoutError(
          isDeferred
            ? "Izipay no devolvió un checkout renderizable en este intento. El backend quedó en modo diferido y no voy a enviarte otra vez a la misma pantalla."
            : "El backend devolvió una URL interna de Operaly en lugar de abrir el checkout real. Debemos conectar el formToken con el SDK de Izipay."
        )
        return
      }
  
      window.location.href = paymentUrl
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FC]">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm text-slate-600">Preparando checkout seguro...</p>
        </div>
      </div>
    )
  }

  if (!selectedPlan || selectedPlan.code === "trial") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#F6F8FC]">
        <div className="max-w-lg text-center bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Selecciona un plan de pago
          </h1>
          <p className="text-slate-600 leading-7">
            Esta página está diseñada para procesar la suscripción de planes de pago de Operaly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={170}
            height={54}
            priority
          />

          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              Checkout seguro
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
              Operado por Izipay
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-slate-500" />
              Cobro en USD
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0F1F63_0%,#162C8A_65%,#2440BF_100%)] px-6 py-8 md:px-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Suscripción mensual Operaly
                </div>

                <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                      Activa tu plan en una sola vista
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-[15px]">
                      Selecciona tu plan, revisa el resumen y continúa con un checkout
                      seguro. Cuando Izipay confirme el pago, Operaly activará tu cuenta
                      y aplicará los beneficios del plan automáticamente.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/65">
                      Plan seleccionado
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold text-white">
                          {selectedPlan.name}
                        </p>
                        <p className="mt-1 text-sm text-white/75">
                          Facturación mensual
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-semibold text-white">
                          {formatMoney(selectedPlan.price)}
                        </p>
                        <p className="mt-1 text-xs text-white/70">por mes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-5 md:grid-cols-3 md:px-8">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Seguridad</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    Izipay procesa el pago con validación segura y flujo protegido.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">Moneda única</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    Todos los planes de Operaly se cobran exclusivamente en USD.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Activación</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    Tu suscripción se activa al confirmarse el pago exitosamente.
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 md:px-8 md:py-8">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Elige el plan ideal para tu operación
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Puedes cambiar tu selección antes de pasar al pago.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {PAID_PLANS.map((planCode) => {
                    const plan = getPlanByCode(planCode)
                    if (!plan) return null

                    const isActive = selectedPlanCode === plan.code
                    const isPopular = Boolean(plan.popular)

                    return (
                      <button
                        key={plan.code}
                        type="button"
                        onClick={() => setSelectedPlanCode(plan.code)}
                        className={`relative w-full rounded-[24px] border p-5 text-left transition-all md:p-6 ${
                          isActive
                            ? "border-[#0F1F63] bg-[#0F1F63]/[0.04] shadow-sm ring-1 ring-[#0F1F63]/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {isPopular ? (
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0F1F63] px-3 py-1 text-[11px] font-medium text-white">
                            <Sparkles className="h-3.5 w-3.5" />
                            Recomendado
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-2xl">
                            <div className="flex items-center gap-3">
                              <p className="text-xl font-semibold text-slate-950">
                                {plan.name}
                              </p>
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#0F1F63]/20 bg-[#0F1F63]/10 px-2.5 py-1 text-[11px] font-medium text-[#0F1F63]">
                                  <Check className="h-3.5 w-3.5" />
                                  Seleccionado
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {plan.description}
                            </p>

                            <div className="mt-4 grid gap-2 md:grid-cols-2">
                              {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3">
                                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  </div>
                                  <p className="text-sm text-slate-700">{feature}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="min-w-[160px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-right">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Precio
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-slate-950">
                              {formatMoney(plan.price)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">mensual</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="sticky top-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-6">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Resumen del checkout
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Todo listo para continuar con el cobro seguro de tu suscripción.
                </p>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Plan</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {selectedPlan.name}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right">
                      <p className="text-xs text-slate-500">Mensual</p>
                      <p className="text-lg font-semibold text-slate-950">
                        {formatMoney(selectedPlan.price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {selectedPlan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <p className="text-sm text-slate-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-900">
                      Datos del cobro
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Moneda</span>
                      <span className="font-medium text-slate-900">
                        {BILLING_CURRENCY_CODE}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Pasarela</span>
                      <span className="font-medium text-slate-900">Izipay</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Referencia</span>
                      <span className="max-w-[180px] truncate text-right font-medium text-slate-900">
                        {reference || "Se genera al iniciar el pago"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Cliente</span>
                      <span className="max-w-[180px] truncate text-right font-medium text-slate-900">
                        {clientId || "No disponible"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Lo que ocurrirá después
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      "Izipay procesará tu pago de forma segura.",
                      "Operaly registrará tu suscripción mensual.",
                      "Tu plan se activará automáticamente.",
                      "Los beneficios del plan se aplicarán a dashboard y WhatsApp.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50">
                          <ChevronRight className="h-3.5 w-3.5 text-sky-700" />
                        </div>
                        <p className="text-sm text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {pendingSignup ? (
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Datos de activación
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Nombre
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {pendingSignup.firstName} {pendingSignup.lastName}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Email
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900 break-all">
                          {pendingSignup.email}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Teléfono
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {pendingSignup.phone || "No indicado"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Perfil
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {pendingSignup.businessType}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600 leading-7">
                      No se encontraron datos adicionales del registro en este navegador.
                      Puedes continuar con el pago si el cliente ya fue creado correctamente.
                    </p>
                  </div>
                )}

                {checkoutError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{checkoutError}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <Button
                    onClick={handlePay}
                    disabled={submitting}
                    className="h-14 w-full rounded-2xl bg-[#0F1F63] px-6 text-base font-medium text-white hover:bg-[#12297f]"
                  >
                    {submitting
                      ? "Conectando con Izipay..."
                      : `Continuar al pago • ${formatMoney(selectedPlan.price)}`}
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
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
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
