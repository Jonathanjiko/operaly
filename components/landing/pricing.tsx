"use client"

import Link from "next/link"
import { ArrowRight, Check, Sparkles, TimerReset, Zap } from "lucide-react"
import { OPERLAY_PLANS } from "@/lib/plans"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

const PLAN_FEATURES: Record<string, string[]> = {
  trial: [
    "7 dias de uso real con todos los modulos base",
    "Google Suite completo gratis durante el trial",
    "250 mensajes IA, 5 min de voz y llamadas",
    "0.5 GB, 100 contactos y 2 automatizaciones",
    "Sin personalizar voz ni asistente",
  ],
  core: [
    "1200 mensajes IA y 20 min de voz",
    "3 GB, 1000 contactos y 10 automatizaciones",
    "Todos los modulos base activos",
    "Google Suite como add-on mensual desde aqui",
    "Ofertas contextuales y compra mas simple",
  ],
  pro: [
    "3000 mensajes IA y 30 min de voz",
    "5 GB, 1200 contactos y 15 automatizaciones",
    "Seguimiento mas intenso para uso profesional",
    "Google Suite como add-on mensual",
    "Mas capacidad para audio, agenda y operaciones",
  ],
  pro_plus: [
    "5000 mensajes IA y 60 min de voz",
    "10 GB, 2000 contactos y 30 automatizaciones",
    "Capacidad mas amplia para vivir dentro de Operaly",
    "Google Suite como add-on mensual",
    "Mayor margen para automatizar y acompañar",
  ],
}

const ADDON_HIGHLIGHTS = [
  "Audio +5 min: S/10",
  "Audio +10 min: S/18",
  "Storage +1 GB: S/7.5",
  "Storage +3 GB: S/20",
  "Mensajeria IA +500: S/15",
  "Google Suite mensual: S/25",
]

export function Pricing() {
  const { pricing, loading, isPeru } = usePricingCurrency()

  return (
    <section id="precios" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Planes y crecimiento</p>
          <h2 className="mt-4 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
            Entre con prueba gratis y escale solo cuando ya sienta el valor de Operaly.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            El trial expone lo mejor del producto. Desde Core en adelante, Google Suite pasa a suscripcion aparte y los add-ons refuerzan consumo real.
          </p>
        </div>

        <div className="mb-8 rounded-[30px] border border-[#DCE7F5] bg-[linear-gradient(135deg,rgba(37,211,102,0.08),rgba(59,130,246,0.08),rgba(124,58,237,0.06))] p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0F1F63]">
                En Trial, Google Suite va incluido gratis durante 7 dias.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Desde Core en adelante se activa como suscripcion mensual, con ofertas comerciales contextuales para onboarding o consumo alto.
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
            const isPop = plan.popular
            const isTrial = plan.code === "trial"

            return (
              <div
                key={plan.code}
                className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
                  isPop
                    ? "border-[#3B82F6] bg-gradient-to-b from-[#EFF6FF] to-card shadow-xl shadow-[#3B82F6]/10"
                    : isTrial
                      ? "border-[#25D366]/35 bg-gradient-to-b from-[#ECFDF5] to-white shadow-lg shadow-[#25D366]/10"
                      : "border-border bg-card hover:border-[#3B82F6]/30 hover:shadow-lg"
                }`}
              >
                {(isPop || isTrial) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg ${
                        isTrial
                          ? "bg-gradient-to-r from-[#25D366] to-[#06B6D4]"
                          : "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED]"
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      {isTrial ? "Hook principal" : "Mas popular"}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#0F1F63]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-[#0F1F63]">Gratis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-[#0F1F63]">
                          {loading ? "..." : pricing.formatCatalogMoney(plan.price, plan.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">/mes</span>
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
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isTrial ? "text-[#25D366]" : isPop ? "text-[#3B82F6]" : "text-[#10B981]"}`} />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.code}`}
                  className={`flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all ${
                    isTrial
                      ? "bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] text-white shadow-[0_8px_20px_-8px_rgba(37,211,102,0.55)] hover:opacity-90"
                      : isPop
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

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-[#DCE7F5] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#7C3AED]" />
              <p className="text-sm font-semibold text-[#0F1F63]">Add-ons y crecimiento contextual</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ADDON_HIGHLIGHTS.map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#DCE7F5] bg-[#0F1F63] p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Comercialmente mas fuerte</p>
            <p className="mt-3 text-2xl font-bold">
              Prueba gratis primero. Luego escale solo donde ya sienta friccion real.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Trial muestra el valor completo del uso diario. Core, Pro y Pro Plus abren mas capacidad; Google Suite y add-ons se activan como capa comercial natural sin romper el uso.
            </p>
            <Link
              href="/register?plan=trial"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#0F1F63]"
            >
              Prueba gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
