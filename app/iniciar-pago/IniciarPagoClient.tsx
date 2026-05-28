"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Check, Lock, ShieldCheck, Sparkles, ArrowRight,
  RefreshCw, AlertCircle, CreditCard, CheckCircle2, Star,
} from "lucide-react"
import { getDefaultOwnerCatalog, type OwnerCatalogPlan } from "@/lib/owner-catalog"
import { getPlanByCode, type OperalyPlanCode } from "@/lib/plans"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

type PaymentProvider = "mercadopago" | "stripe"
type CheckoutResponse = {
  ok: boolean; checkout_url?: string | null; init_point?: string | null; error?: string; detail?: string
}

const PAID_PLANS: OperalyPlanCode[] = ["core", "pro", "pro_plus"]

const PLAN_FEATURES: Record<string, string[]> = {
  core:     ["Agente IA en WhatsApp 24/7", "Tareas, agenda y contactos", "Dashboard privado", "Documentos básicos", "Soporte por WhatsApp"],
  pro:      ["Todo lo de Core", "🎙️ Voz: audios y llamadas (20 min/mes)", "Automatizaciones activas", "Análisis de documentos con IA", "Mensajes a terceros"],
  pro_plus: ["Todo lo de Pro", "🤖 Llamadas conversacionales IA (180 min/mes)", "Análisis profundo por profesión", "Agente personalizado avanzado", "Acceso API + Google Suite"],
}

const TRUST = [
  { icon: Lock,         text: "Pago 100% seguro" },
  { icon: RefreshCw,    text: "Cancela cuando quieras" },
  { icon: ShieldCheck,  text: "Sin permanencia" },
  { icon: CheckCircle2, text: "Activo en 2 minutos" },
]

function normalizeError(msg: string) {
  const map: Record<string,string> = {
    "missing_client_id":                    "No encontramos tu cuenta. Recarga la página.",
    "missing_plan_code":                    "Selecciona un plan válido.",
    "missing_backend_url":                  "Error de configuración. Contacta soporte.",
    "provider_not_enabled":                 "La pasarela no está disponible.",
    "missing_client_email_for_subscription":"Tu cuenta necesita un email registrado.",
    "missing_mercadopago_access_token":     "Mercado Pago está en proceso de activación.",
    "missing_checkout_url":                 "No se pudo generar el link de pago. Intenta nuevamente.",
    "checkout_failed":                      "No se pudo iniciar el checkout. Intenta nuevamente.",
  }
  return map[msg.trim()] || msg
}

export default function IniciarPagoClient() {
  const searchParams = useSearchParams()
  const initialPlan  = (searchParams.get("plan") || "pro") as OperalyPlanCode
  const clientId     = searchParams.get("cid")

  const [plan, setPlan]           = useState<OperalyPlanCode>(initialPlan === "trial" ? "pro" : initialPlan)
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [catalogPlans, setCatalogPlans] = useState<OwnerCatalogPlan[]>(getDefaultOwnerCatalog().plans)

  const { pricing, loading: pricingLoading, isPeru } = usePricingCurrency()
  const selectedPlan = useMemo(
    () => catalogPlans.find((entry) => entry.code === plan) || getPlanByCode(plan),
    [catalogPlans, plan]
  )

  const chargePEN = selectedPlan
    ? pricing.toPenAmount(selectedPlan.price, selectedPlan.currency)
    : 0
  const displayPrice = pricing.toDisplayAmountFromPen(chargePEN)

  useEffect(() => {
    const load = async () => {
      try {
        const catalogResponse = await fetch("/api/product/catalog", {
          method: "GET",
          cache: "no-store",
        })
        const catalogPayload = await catalogResponse.json().catch(() => ({}))
        const commercialCatalog =
          catalogPayload?.user_facing?.catalog ||
          catalogPayload?.user_facing ||
          catalogPayload?.catalog
        if (catalogResponse.ok && commercialCatalog?.plans) {
          setCatalogPlans(commercialCatalog.plans as OwnerCatalogPlan[])
        }
      } catch {}

      // Try to get email from multiple localStorage sources
      const keys = ["operaly_pending_signup", "operaly_assistant_profile", "operaly_register_auth"]
      let email = ""
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const p = JSON.parse(raw)
            email = p?.email || p?.user?.email || ""
            if (email) break
          }
        } catch {}
      }
      // If still no email, get from Supabase auth session
      if (!email) {
        try {
          const { createClient } = await import("@supabase/supabase-js")
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
          if (url && key) {
            const sb = createClient(url, key)
            const { data: { user } } = await sb.auth.getUser()
            if (user?.email) email = user.email
          }
        } catch {}
      }
      setCustomerEmail(email)
      setLoading(false)
    }
    load()
  }, [])

  // Keep URL in sync
  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.set("plan", plan)
    if (clientId) url.searchParams.set("cid", clientId)
    window.history.replaceState({}, "", url.toString())
  }, [plan, clientId])

  const handlePay = async () => {
    if (!selectedPlan || selectedPlan.code === "trial") {
      setError("Selecciona un plan de pago válido."); return
    }
    const resolvedCid = clientId || localStorage.getItem("operaly_client_id") || ""
    if (!resolvedCid) {
      setError("No encontramos tu cuenta. Por favor inicia sesión."); return
    }
    setError(""); setSubmitting(true)
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: resolvedCid,
          planCode: selectedPlan.code,
          provider: "mercadopago",
          email: customerEmail || undefined,
          // Send internal PEN amount for backend validation
          amount_pen: chargePEN,
        }),
      })
      const payload: CheckoutResponse = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || payload?.detail || "checkout_failed")
      const url = String(payload.checkout_url || payload.init_point || "").trim()
      if (!url) throw new Error("missing_checkout_url")
      window.location.href = url
    } catch (err: any) {
      setError(normalizeError(err?.message || "checkout_failed"))
      setSubmitting(false)
    }
  }

  if (loading || pricingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Preparando checkout seguro...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/images/operaly-logo.png" alt="Operaly" width={110} height={40} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-medium">Checkout seguro</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Procesado por Mercado Pago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* ── Left: Plan selector ── */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F1F63]">Elige tu plan</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Activo inmediatamente. Sin permanencia. Cancela cuando quieras.
              </p>
            </div>

            {/* Plan cards */}
            <div className="space-y-3">
              {PAID_PLANS.map(code => {
                const p = catalogPlans.find((entry) => entry.code === code) || getPlanByCode(code)
                if (!p) return null
                const isSelected = plan === code
                const displayPriceForPlan = pricing.formatCatalogMoney(p.price, p.currency)
                const features = PLAN_FEATURES[code] || p.features

                return (
                  <button key={code} type="button" onClick={() => setPlan(code)}
                    className={`w-full rounded-2xl border p-5 text-left transition-all ${
                      isSelected
                        ? "border-[#3B82F6] bg-white shadow-md ring-1 ring-[#3B82F6]/20"
                        : "border-border bg-white hover:border-[#3B82F6]/30 hover:shadow-sm"
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? "border-[#3B82F6] bg-[#3B82F6]" : "border-border bg-white"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F1F63]">{p.name}</span>
                            {p.popular && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white">
                                <Star className="w-2.5 h-2.5" /> Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-[#0F1F63]">{displayPriceForPlan}</p>
                        <p className="text-xs text-muted-foreground">{pricing.currency}/mes</p>
                        {!isPeru && (
                          <p className="text-[11px] text-[#0369A1] mt-1">
                            Cobro real {pricing.formatPen(pricing.toPenAmount(p.price, p.currency))}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-[#3B82F6]/10 grid sm:grid-cols-2 gap-1.5">
                        {features.map(f => (
                          <div key={f} className="flex items-start gap-2 text-sm text-[#0F1F63]">
                            <Check className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST.map(ts => {
                const Icon = ts.icon
                return (
                  <div key={ts.text} className="flex items-center gap-2 bg-white rounded-xl border border-border p-3">
                    <Icon className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span className="text-xs font-medium text-[#0F1F63]">{ts.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right: Summary + Pay ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0F1F63] to-[#1a3a9f] px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Resumen del pedido</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-white">Operaly {selectedPlan?.name}</p>
                    <p className="text-sm text-white/70 mt-0.5">Suscripción mensual</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{pricing.formatDisplayFromPen(chargePEN)}</p>
                    <p className="text-xs text-white/60">por mes</p>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan {selectedPlan?.name}</span>
                  <span className="font-semibold text-[#0F1F63]">{pricing.formatDisplayFromPen(chargePEN)}/mes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Facturación</span>
                  <span className="font-semibold text-[#0F1F63]">Mensual recurrente</span>
                </div>
                {/* Show PEN charge amount for international users */}
                {!isPeru && (
                  <div className="flex items-center justify-between text-xs bg-[#F0F9FF] rounded-lg px-3 py-2">
                    <span className="text-[#0369A1]">Cobro en MercadoPago</span>
                    <span className="font-semibold text-[#0369A1]">{pricing.formatPen(chargePEN)}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F1F63]">Total a pagar</span>
                  <span className="font-bold text-2xl text-[#0F1F63]">{pricing.formatDisplayFromPen(chargePEN)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se cobra {pricing.formatDisplayFromPen(chargePEN)} {pricing.currency}/mes.
                  {!isPeru && ` El cargo se procesa en soles peruanos (${pricing.formatPen(chargePEN)}) a través de Mercado Pago.`}
                  {" "}Cancela cuando quieras desde tu dashboard.
                </p>
              </div>

              {/* Verified account */}
              {customerEmail && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#0F1F63]">Cuenta verificada</p>
                      <p className="text-xs text-muted-foreground truncate">{customerEmail}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-6 pb-4">
                  <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#EF4444] leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="px-6 pb-6">
                <button onClick={handlePay} disabled={submitting || !selectedPlan}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white font-bold text-base hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#3B82F6]/30">
                  {submitting ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Conectando con Mercado Pago...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Continuar con Mercado Pago <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" /> Pago procesado por Mercado Pago · SSL 256-bit
                </p>
              </div>
            </div>

            {/* MP Badge */}
            <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF159] flex items-center justify-center font-bold text-sm text-[#009EE3] flex-shrink-0">MP</div>
              <div>
                <p className="text-sm font-semibold text-[#0F1F63]">Procesado por Mercado Pago</p>
                <p className="text-xs text-muted-foreground">Tu información de pago nunca pasa por nuestros servidores</p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preguntas frecuentes</p>
              {[
                ["¿Cuándo se me cobra?",     "Inmediatamente al confirmar el pago en Mercado Pago."],
                ["¿Puedo cancelar?",          "Sí, en cualquier momento desde tu dashboard."],
                ["¿Qué pasa al cancelar?",    "Tu acceso continúa hasta el fin del período pagado."],
                ["¿En qué moneda me cobran?", isPeru ? "En soles peruanos (PEN) directamente." : "En soles peruanos (PEN) equivalentes al precio en USD mostrado."],
              ].map(([q, a]) => (
                <div key={q}>
                  <p className="text-xs font-semibold text-[#0F1F63]">{q}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
