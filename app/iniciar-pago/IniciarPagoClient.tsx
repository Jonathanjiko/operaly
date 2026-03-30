"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando checkout...</p>
      </div>
    )
  }

  if (!plan || plan.code === "trial") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Plan inválido para pago</h1>
          <p className="text-muted-foreground mb-6">
            Esta página es solo para planes de pago.
          </p>
          <Link href="/precios">
            <Button>Volver a precios</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <p className="text-sm text-[#3B82F6] font-medium mb-3">Checkout Operaly</p>

          <h1 className="text-3xl font-bold text-[#0F1F63] mb-3">
            Iniciar pago de {plan.name}
          </h1>

          <p className="text-muted-foreground mb-8">
            Estás a un paso de activar tu plan de Operaly.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-[#0F1F63] mb-4">Resumen del plan</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Plan:</strong> {plan.name}</p>
                <p><strong>Código:</strong> {plan.code}</p>
                <p><strong>Precio:</strong> {plan.currency} {plan.price} / mes</p>
                <p><strong>Descripción:</strong> {plan.description}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-[#0F1F63] mb-4">Datos del registro</h2>
              {pendingSignup ? (
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {pendingSignup.firstName} {pendingSignup.lastName}</p>
                  <p><strong>Email:</strong> {pendingSignup.email}</p>
                  <p><strong>Teléfono:</strong> {pendingSignup.phone || "No indicado"}</p>
                  <p><strong>Empresa:</strong> {pendingSignup.companyName || "No indicada"}</p>
                  <p><strong>País:</strong> {pendingSignup.country}</p>
                  <p><strong>Perfil:</strong> {pendingSignup.businessType}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No se encontraron datos adicionales del registro en el navegador.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/20 border border-border p-5 mb-8">
            <p className="text-sm text-muted-foreground">
              Vas a iniciar el checkout real de Operaly con Izipay. Cuando el pago se confirme,
              tu plan quedará activado automáticamente.
            </p>
          </div>

          {checkoutError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-8">
              <p className="text-sm text-red-700">{checkoutError}</p>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleContinue}
              disabled={submitting}
              className="h-12 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white"
            >
              {submitting ? "Conectando con Izipay..." : `Pagar ${plan.currency} ${plan.price}`}
            </Button>

            <Link href="/precios">
              <Button variant="outline" className="h-12 rounded-xl w-full sm:w-auto">
                Volver a planes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
