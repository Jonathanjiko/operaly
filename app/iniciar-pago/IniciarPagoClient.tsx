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
  AlertCircle,
  ArrowRight,
  CircleHelp,
  Building2,
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

type PaymentProvider = "mercadopago" | "stripe"
type CheckoutMode = "redirect" | "hosted" | "embed"

type CheckoutResponse = {
  ok: boolean
  provider?: PaymentProvider
  mode?: CheckoutMode | null
  checkout_url?: string | null
  init_point?: string | null
  subscription_id?: string | null
  preapproval_plan_id?: string | null
  order_id?: string | null
  payment_url?: string | null
  error?: string
}

const BILLING_CURRENCY_CODE = "USD"
const PAID_PLANS: OperalyPlanCode[] = ["core", "pro", "pro_plus"]

const PAYMENT_PROVIDERS: Array<{
  code: PaymentProvider
  name: string
  description: string
  enabled: boolean
  badge?: string
}> = [
  {
    code: "mercadopago",
    name: "Mercado Pago",
    description: "Proveedor principal para suscripciones y cobros recurrentes en esta fase.",
    enabled: true,
    badge: "Principal",
  },
  {
    code: "stripe",
    name: "Stripe",
    description: "Preparado para expansión internacional cuando la cuenta esté habilitada.",
    enabled: false,
    badge: "Próximamente",
  },
]

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

function normalizeCheckoutError(message: string) {
  const value = String(message || "").trim()

  if (!value) {
    return "No se pudo iniciar el checkout en este momento."
  }

  switch (value) {
    case "missing_client_id":
      return "No se encontró el identificador del cliente para iniciar el pago."
    case "missing_plan_code":
      return "No se recibió el plan que se desea cobrar."
    case "missing_backend_url":
      return "La configuración del backend de pagos no está disponible."
    case "provider_not_enabled":
    case "provider_not_enabled_yet":
      return "La pasarela seleccionada todavía no está habilitada."
    case "missing_client_email_for_subscription":
      return "Este checkout requiere que el cliente tenga un email registrado para crear la suscripción."
    case "missing_mercadopago_access_token":
      return "Mercado Pago todavía no tiene credenciales activas en este entorno. La arquitectura ya quedó lista, pero falta la habilitación final."
    case "missing_checkout_url":
      return "La pasarela respondió, pero no devolvió una URL válida de checkout."
    case "checkout_failed":
      return "No se pudo crear la sesión de checkout."
    default:
      return value
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
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider>("mercadopago")
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const selectedPlan = useMemo(() => {
    return getPlanByCode(selectedPlanCode)
  }, [selectedPlanCode])

  const selectedProviderConfig = useMemo(() => {
    return PAYMENT_PROVIDERS.find((item) => item.code === selectedProvider) || null
  }, [selectedProvider])

  const customerDisplayName = useMemo(() => {
    if (!pendingSignup) return null
    return `${pendingSignup.firstName} ${pendingSignup.lastName}`.trim()
  }, [pendingSignup])

  const customerEmail = useMemo(() => {
    return pendingSignup?.email?.trim() || null
  }, [pendingSignup])

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
      setCheckoutError("No se encontró el identificador del cliente para iniciar el checkout.")
      return
    }

    const providerConfig = PAYMENT_PROVIDERS.find(
      (item) => item.code === selectedProvider
    )

    if (!providerConfig?.enabled) {
      setCheckoutError(
        `${providerConfig?.name || "Esta pasarela"} todavía no está habilitada en esta versión.`
      )
      return
    }

    setCheckoutError("")
    setCheckoutMode(null)
    setCheckoutUrl(null)
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
          provider: selectedProvider,
        }),
      })

      const payload: CheckoutResponse & { detail?: string } = await response.json()

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || payload?.detail || "checkout_failed")
      }

      const resolvedCheckoutUrl = String(
        payload.checkout_url || payload.init_point || payload.payment_url || ""
      ).trim()

      setCheckoutMode(payload.mode || null)
      setCheckoutUrl(resolvedCheckoutUrl || null)

      if (!resolvedCheckoutUrl) {
        throw new Error("missing_checkout_url")
      }

      const currentPath =
        typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}`
          : ""

      const normalizedRedirect = resolvedCheckoutUrl.split("?")[0]

      if (
        normalizedRedirect === currentPath ||
        normalizedRedirect.endsWith("/iniciar-pago")
      ) {
        throw new Error(
          "El backend devolvió una URL interna de Operaly en lugar del checkout final del proveedor."
        )
      }

      window.location.href = resolvedCheckoutUrl
    } catch (error: any) {
      setCheckoutError(
        normalizeCheckoutError(
          error?.message || "No se pudo iniciar el checkout del proveedor seleccionado."
        )
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
              Suscripción recurrente
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-slate-500" />
              Facturación en USD
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0F1F63_0%,#162C8A_65%,#2440BF_100%)] px-6 py-8 md:px-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Suscripción mensual Operaly
                </div>

                <div className="grid gap-6 md:grid-cols-[1.06fr_0.94fr] md:items-end">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                      Activa tu plan en una sola vista
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-[15px]">
                      Selecciona tu plan, revisa el resumen y continúa con una experiencia
                      de checkout orientada a suscripciones reales. Mercado Pago es la
                      pasarela principal en esta fase de Operaly.
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
                    <span className="text-sm font-medium">Suscripción real</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    Preparado para billing recurrente, no para cobros manuales aislados.
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
                    <span className="text-sm font-medium">Arquitectura escalable</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    Stripe podrá entrar después sin rehacer esta experiencia.
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 md:px-8 md:py-8">
                <div className="rounded-3xl border border-slate-200 overflow-hidden mb-8">
                  <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Pasarela de pago
                    </h2>
                  </div>

                  <div className="p-5 md:p-6 grid gap-3">
                    {PAYMENT_PROVIDERS.map((provider) => {
                      const isActive = selectedProvider === provider.code

                      return (
                        <button
                          key={provider.code}
                          type="button"
                          onClick={() => provider.enabled && setSelectedProvider(provider.code)}
                          disabled={!provider.enabled}
                          className={`w-full text-left rounded-2xl border p-4 transition-all ${
                            isActive
                              ? "border-[#0F1F63] bg-[#0F1F63]/5 shadow-sm"
                              : "border-slate-200 bg-white"
                          } ${provider.enabled ? "hover:border-slate-300" : "opacity-70 cursor-not-allowed"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-[#FFF159] text-[11px] font-semibold text-slate-900">
                                {provider.code === "mercadopago" ? "MP" : "ST"}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-base font-semibold text-slate-950">
                                    {provider.name}
                                  </p>
                                  {provider.badge ? (
                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                      {provider.badge}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                  {provider.description}
                                </p>
                              </div>
                            </div>

                            {isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#0F1F63]/15 bg-[#0F1F63]/10 px-2.5 py-1 text-[11px] font-medium text-[#0F1F63]">
                                <Check className="h-3.5 w-3.5" />
                                Seleccionado
                              </span>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

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
                      <span className="font-medium text-slate-900">
                        {selectedProviderConfig?.name || "No definida"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Modo técnico</span>
                      <span className="font-medium text-slate-900">
                        {checkoutMode || "Se define al iniciar el cobro"}
                      </span>
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
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-900">
                      Identidad de facturación
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Nombre
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {customerDisplayName || "Se resolverá desde la cuenta del cliente"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900 break-all">
                        {customerEmail || "No disponible en este navegador"}
                      </p>
                    </div>
                  </div>
                </div>

                {!customerEmail ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-700 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          El email del cliente es importante para la suscripción
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-800">
                          Si este cliente no tiene email registrado en backend, el checkout
                          de suscripción puede ser rechazado por la pasarela.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Lo que ocurrirá después
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      "Se abrirá el checkout seguro de Mercado Pago.",
                      "El intento de pago quedará trazado en billing_intents.",
                      "Cuando el webhook confirme el cobro, Operaly podrá activar el plan automáticamente.",
                      "La misma arquitectura permitirá add-ons y cobros desde WhatsApp.",
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

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CircleHelp className="h-4 w-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-900">
                      Señales de confianza
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      Mercado Pago como proveedor principal de checkout
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      Seguimiento operativo con billing intents y métricas internas
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      Cobros preparados para web, suscripción y add-ons
                    </div>
                  </div>
                </div>

                {checkoutUrl ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-sm font-semibold text-emerald-900">
                      Checkout generado
                    </p>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      La URL del checkout fue creada correctamente y el navegador será
                      redirigido al proveedor.
                    </p>
                  </div>
                ) : null}

                {checkoutError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-700 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          No se pudo continuar con el checkout
                        </p>
                        <p className="mt-1 text-sm leading-6 text-red-800">
                          {checkoutError}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <Button
                    onClick={handlePay}
                    disabled={submitting}
                    className="h-14 w-full rounded-2xl bg-[#0F1F63] px-6 text-base font-medium text-white hover:bg-[#12297f]"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        Preparando checkout...
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    ) : (
                      `Continuar con ${selectedProviderConfig?.name || "la pasarela"} • ${formatMoney(selectedPlan.price)}`
                    )}
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                      <Lock className="h-3.5 w-3.5" />
                      Conexión segura
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
                      {selectedProviderConfig?.name || "Pasarela"}
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
