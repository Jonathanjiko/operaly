"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap } from "lucide-react"
import { getDefaultOwnerCatalog, type OwnerCatalogPlan } from "@/lib/owner-catalog"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<OwnerCatalogPlan[]>(getDefaultOwnerCatalog().plans)
  const { pricing, isPeru } = usePricingCurrency()

  const goToRegister = (planCode: string) => {
    router.push(`/register?plan=${planCode}`)
  }

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch("/api/product/catalog", {
          method: "GET",
          cache: "no-store",
        })
        const payload = await response.json().catch(() => ({}))
        const commercialCatalog =
          payload?.user_facing?.catalog ||
          payload?.user_facing ||
          payload?.catalog
        if (response.ok && commercialCatalog?.plans) {
          setPlans(commercialCatalog.plans as OwnerCatalogPlan[])
        }
      } catch {}
    }

    void loadCatalog()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={120}
              height={120}
              className="h-8 w-auto"
            />
          </Link>

          <Link href="/login">
            <Button variant="outline" className="rounded-xl">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </header>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#34D399]/10 via-[#06B6D4]/10 to-[#3B82F6]/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#34D399]" />
            <span className="text-sm font-medium text-[#0F1F63]">Planes oficiales</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#0F1F63] mb-4 text-balance">
            Elige el plan de Operaly para empezar
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Hemos simplificado el catálogo. Ahora Operaly trabaja solo con Trial, Core, Pro y Pro Plus.
          </p>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.code}
                className={`bg-card rounded-3xl border p-8 relative ${
                  plan.code === "pro"
                    ? "border-[#34D399] shadow-xl shadow-[#34D399]/10"
                    : "border-border"
                }`}
              >
                {plan.code === "pro" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#34D399] to-[#06B6D4] text-white text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Más popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-[#0F1F63] mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[#0F1F63]">
                      {pricing.formatCatalogMoney(plan.price, plan.currency)}
                    </span>
                    <span className="text-muted-foreground">/ mes</span>
                  </div>
                  {!isPeru && plan.price > 0 && (
                    <p className="mt-2 text-xs text-[#0369A1]">
                      Cobro real en Mercado Pago: {pricing.formatPen(pricing.toPenAmount(plan.price, plan.currency))}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#34D399] flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => goToRegister(plan.code)}
                  className={`w-full rounded-xl h-12 ${
                    plan.code === "pro"
                      ? "bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white"
                      : ""
                  }`}
                  variant={plan.code === "pro" ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
