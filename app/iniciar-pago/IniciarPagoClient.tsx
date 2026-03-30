"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ShieldCheck, Lock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPlanByCode } from "@/lib/plans"

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

export default function IniciarPagoClient() {
  const searchParams = useSearchParams()
  const planCode = searchParams.get("plan")
  const clientId = searchParams.get("cid")

  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const plan = useMemo(() => getPlanByCode(planCode), [planCode])

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

  const handleContinue = async () => {
    if (!plan || plan.code === "trial") {
      setCheckoutError("Plan inválido para checkout.")
      return
    }

    if (!clientId) {
      setCheckoutError("Falta el identificador del cliente para iniciar el pago.")
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
          planCode: plan.code,
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
      setCheckoutError(error?.message || "No se pudo iniciar el checkout.")
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

  if (!plan || plan.code === "trial") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#F7F9FC]">
        <div className="max-w-lg text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Plan inválido para pago</h1>
          <p className="text-slate-600 mb-6">
            Esta página es solo para planes de pago.
          </p>
          <Link href="/precios">
            <Button className="rounded-xl">Volver a precios</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={180}
            height={44}
            priority
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 mb-5">
              <Lock className="h-3.5 w-3.5" />
              Pago seguro con Izipay
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-3">
              Finaliza tu suscripción a {plan.name}
            </h1>

            <p className="text-slate-600 text-[15px] leading-7 mb-8">
              Estás a un paso de activar tu plan en Operaly. El pago se procesa
              en una pasarela segura y, una vez confirmado, tu suscripción quedará
              activa automáticamente.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Seguridad</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">
                  Checkout protegido y validación segura del pago.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Pasarela</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">
                  Izipay como procesador de pago con soporte para tarjetas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 mb-2 text-slate-900">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Activación</span>
                </div>
                <p className="text-xs leading-6 text-slate-600">
                  Tu plan se activa automáticamente cuando el pago se confirma.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-900">Resumen del plan</h2>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xl font-semibold text-slate-950">{plan.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-semibold text-slate-950">
                      {plan.currency} {plan.price}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">mensual</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
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
                onClick={handleContinue}
                disabled={submitting}
                className="h-12 rounded-xl bg-[#0F1F63] hover:bg-[#12297f] text-white px-6"
              >
                {submitting ? "Conectando con Izipay..." : `Pagar ${plan.currency} ${plan.price}`}
              </Button>

              <Link href="/precios">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl w-full sm:w-auto border-slate-300 text-slate-700"
                >
                  Volver a planes
                </Button>
              </Link>
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
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-semibold text-slate-950 mb-5">
              Datos de activación
            </h2>

            {pendingSignup ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Nombre</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pendingSignup.firstName} {pendingSignup.lastName}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pendingSignup.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Teléfono</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pendingSignup.phone || "No indicado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">País</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pendingSignup.country}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Perfil</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pendingSignup.businessType}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  No se encontraron datos adicionales del registro en el navegador.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Lo que pasará después del pago
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Izipay procesará tu pago de forma segura.</li>
                <li>• Operaly activará tu plan automáticamente.</li>
                <li>• Entrarás a tu dashboard con la suscripción activa.</li>
                <li>• Tu plan quedará listo para renovación mensual.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
