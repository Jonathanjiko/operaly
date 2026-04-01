"use client"

import Link from "next/link"
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react"
import { OPERLAY_PLANS } from "@/lib/plans"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

const PLAN_FEATURES: Record<string, string[]> = {
  trial: [
    "7 días de acceso completo",
    "Agente IA en WhatsApp",
    "Tareas y recordatorios",
    "Dashboard privado",
    "Sin tarjeta de crédito",
  ],
  core: [
    "Agente IA en WhatsApp",
    "Tareas, agenda y contactos",
    "Dashboard privado",
    "Documentos básicos",
    "Soporte por WhatsApp",
  ],
  pro: [
    "Todo lo de Core",
    "Voz: audios y llamadas (20 min/mes)",
    "Automatizaciones activas",
    "Análisis de documentos",
    "Mensajes a terceros",
    "Google Drive (add-on)",
  ],
  pro_plus: [
    "Todo lo de Pro",
    "Voz extendida (60 min/mes)",
    "Llamadas conversacionales con IA",
    "Análisis profundo por profesión",
    "Agente personalizado",
    "Acceso API",
    "Soporte prioritario",
  ],
}

export function Pricing() {
  const { pricing, loading } = usePricingCurrency()

  // Safe price getter - handles SSR and loading states
  const getPrice = (planCode: string, fallback: number): number => {
    return pricing?.prices?.[planCode as keyof typeof pricing.prices] ?? fallback
  }

  const getCurrency = (): string => pricing?.currency ?? "USD"

  return (
    <section id="precios" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Planes</p>
          <h2 className="mt-4 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
            Empieza gratis. Escala cuando lo necesites.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sin contratos. Sin permanencia. Cancela cuando quieras.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {OPERLAY_PLANS.map((plan) => {
            const features = PLAN_FEATURES[plan.code] || plan.features
            const isPop = plan.popular
            return (
              <div
                key={plan.code}
                className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
                  isPop
                    ? "border-[#3B82F6] shadow-xl shadow-[#3B82F6]/10 bg-gradient-to-b from-[#EFF6FF] to-card"
                    : "border-border bg-card hover:border-[#3B82F6]/30 hover:shadow-lg"
                }`}
              >
                {isPop && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-xs font-bold shadow-lg">
                      <Zap className="w-3 h-3" /> Más popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#0F1F63]">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-[#0F1F63]">Gratis</span>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-muted-foreground">{getCurrency()}</span>
                        <span className="text-4xl font-bold text-[#0F1F63]">
                          {getPrice(plan.code, plan.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">/mes</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="flex-1 space-y-2.5 mb-7">
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPop ? "text-[#3B82F6]" : "text-[#10B981]"}`} />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.code}`}
                  className={`flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-semibold transition-all ${
                    isPop
                      ? "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] hover:opacity-90"
                      : "border border-border bg-white hover:bg-secondary text-[#0F1F63]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿Necesitas más minutos de voz o almacenamiento?{" "}
          <span className="font-medium text-[#3B82F6]">Puedes comprar add-ons desde tu dashboard en cualquier momento.</span>
        </p>
      </div>
    </section>
  )
}
