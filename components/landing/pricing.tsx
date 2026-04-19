"use client"

import Link from "next/link"
import { ArrowRight, Check, TimerReset, Zap } from "lucide-react"
import { OPERLAY_PLANS } from "@/lib/plans"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

const PLAN_FEATURES: Record<string, string[]> = {
  trial: [
    "7 días de uso real con todos los módulos base",
    "Google Suite completo gratis durante el trial",
    "250 mensajes IA, 5 min de voz y llamadas",
    "0.5 GB, 100 contactos y 2 automatizaciones",
    "Sin personalizar voz ni asistente",
  ],
  core: [
    "1200 mensajes IA y 10 min de voz",
    "3 GB, 500 contactos y 10 automatizaciones",
    "Todos los módulos base activos",
    "Google Suite se desbloquea desde Pro",
    "Pensado para operar todos los días sin complicarse",
  ],
  pro: [
    "3000 mensajes IA y 30 min de voz",
    "5 GB, 1000 contactos y 15 automatizaciones",
    "Google Suite incluido",
    "Más capacidad para agenda, correos y seguimiento",
    "La ruta natural para una operación más completa",
  ],
  pro_plus: [
    "5000 mensajes IA y 60 min de voz",
    "10 GB, 2000 contactos y 30 automatizaciones",
    "Google Suite incluido",
    "Más margen para automatizar y acompañar",
    "Pensado para vivir dentro de Operaly todo el día",
  ],
}

export function Pricing() {
  const { pricing, loading, isPeru } = usePricingCurrency()

  return (
    <section id="precios" className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Planes</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#0F1F63] sm:text-4xl md:text-5xl">
            Pruebe primero. Luego suba solo cuando ya sienta el valor de Operaly.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Lo importante se entiende rápido: Trial entra fuerte, Core ordena el día y Pro desbloquea Google Suite con más capacidad.
          </p>
        </div>

        <div className="mb-8 rounded-[30px] border border-[#DCE7F5] bg-[linear-gradient(135deg,rgba(37,211,102,0.08),rgba(59,130,246,0.08),rgba(124,58,237,0.06))] p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0F1F63]">En Trial, Google Suite va incluido gratis durante 7 días.</p>
              <p className="mt-1 text-sm text-slate-600">
                Desde Pro en adelante también queda incluido. En Core, la ruta correcta si lo necesita es subir de plan.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0F1F63] shadow-sm">
              <TimerReset className="h-4 w-4 text-[#3B82F6]" />
              Prueba gratis primero
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {OPERLAY_PLANS.map((plan) => {
            const features = PLAN_FEATURES[plan.code] || plan.features
            const isPopular = plan.code === "pro"
            const isTrial = plan.code === "trial"

            return (
              <div
                key={plan.code}
                className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
                  isPopular
                    ? "border-[#3B82F6] bg-gradient-to-b from-[#EFF6FF] to-card shadow-xl shadow-[#3B82F6]/10"
                    : isTrial
                      ? "border-[#25D366]/35 bg-gradient-to-b from-[#ECFDF5] to-white shadow-lg shadow-[#25D366]/10"
                      : "border-border bg-card hover:border-[#3B82F6]/30 hover:shadow-lg"
                }`}
              >
                {(isPopular || isTrial) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg ${
                        isTrial
                          ? "bg-gradient-to-r from-[#25D366] to-[#06B6D4]"
                          : "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED]"
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      {isTrial ? "Empiece aquí" : "Más popular"}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#0F1F63]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-black text-[#0F1F63]">Gratis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-[#0F1F63]">
                          {loading ? "..." : pricing.formatCatalogMoney(plan.price, plan.currency)}
                        </span>
                        <span className="text-sm text-slate-500">/ mes</span>
                      </>
                    )}
                  </div>
                  {!loading && !isPeru && plan.price > 0 && (
                    <p className="mt-2 text-xs text-[#0369A1]">
                      Cobro real en Mercado Pago: {pricing.formatPen(pricing.toPenAmount(plan.price, plan.currency))}
                    </p>
                  )}
                </div>

                <ul className="mb-7 flex-1 space-y-2.5">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isTrial ? "text-[#25D366]" : isPopular ? "text-[#3B82F6]" : "text-[#10B981]"}`} />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.code}`}
                  className={`flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all ${
                    isTrial
                      ? "bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] text-white shadow-[0_8px_20px_-8px_rgba(37,211,102,0.55)] hover:opacity-90"
                      : isPopular
                        ? "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] hover:opacity-90"
                        : "border border-border bg-white text-[#0F1F63] hover:bg-secondary"
                  }`}
                >
                  {isTrial ? "Prueba gratis" : plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
