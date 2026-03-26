"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getPlanByCode } from "@/lib/plans"

type PendingSignup = {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  country: string
  businessType: string
  password: string
  planCode: "trial" | "core" | "pro" | "pro_plus"
}

export default function IniciarPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planCode = searchParams.get("plan")

  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleFakeContinue = () => {
    router.push("/onboarding?payment=ready")
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
            Esta página reemplaza la ruta faltante <strong>/iniciar-pago</strong> y será la base para conectar Izipay.
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
                  No se encontraron datos del registro en el navegador.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/20 border border-border p-5 mb-8">
            <p className="text-sm text-muted-foreground">
              En el siguiente bloque conectaremos esta página al backend real e Izipay.  
              Por ahora, la dejamos lista a nivel frontend para cerrar la ruta faltante y ordenar el flujo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleFakeContinue}
              className="h-12 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white"
            >
              Continuar implementación del flujo
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
