import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type SearchParams = {
  plan?: string
  cid?: string
}

function formatPlan(plan: string) {
  const value = String(plan || "").trim().toLowerCase()

  if (value === "core") {
    return {
      code: "core",
      name: "Operaly Core",
      price: "$12",
      cycle: "/mes",
    }
  }

  if (value === "pro") {
    return {
      code: "pro",
      name: "Operaly Pro",
      price: "$24",
      cycle: "/mes",
    }
  }

  if (value === "pro_plus") {
    return {
      code: "pro_plus",
      name: "Operaly Pro+",
      price: "$48",
      cycle: "/mes",
    }
  }

  return {
    code: value || "plan",
    name: "Operaly Plan",
    price: "USD",
    cycle: "",
  }
}

export default async function PagoDemoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const plan = formatPlan(params.plan || "pro")
  const clientId = params.cid || null

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0F1F63_0%,#162C8A_65%,#2440BF_100%)] px-6 py-8 md:px-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Checkout demo de Operaly
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Experiencia de pago lista para producción
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-[15px]">
                Esta pantalla existe para validar el flujo visual, la continuidad del
                checkout y la experiencia premium mientras Mercado Pago termina de
                habilitar credenciales reales en este entorno.
              </p>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Plan
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {plan.name}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Flujo de checkout premium para suscripción mensual con arquitectura
                      ya preparada para Mercado Pago como pasarela principal.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-right shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Precio
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {plan.price}
                      <span className="text-base font-medium text-slate-500">
                        {plan.cycle}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Checkout seguro</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    La arquitectura final ya quedó preparada para un proveedor real.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">Billing en USD</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    Todos los planes de Operaly conservan una facturación consistente.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Funnel trazado</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    billing_intents y owner metrics ya capturan el flujo completo.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <CreditCard className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Mercado Pago aún no está activo en este entorno
                    </p>
                    <p className="mt-2 text-sm leading-7 text-amber-800">
                      Esta vista reemplaza temporalmente la redirección real mientras las
                      credenciales finales se habilitan. La UX del producto ya queda lista
                      y navegable sin fricción.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-14 rounded-2xl bg-[#0F1F63] px-6 text-base font-medium text-white hover:bg-[#12297f]"
                >
                  <Link href={`/pago/resultado?status=approved&external_reference=demo-${plan.code}-${clientId || "client"}`}>
                    Simular pago aprobado
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-2xl border-slate-300 px-6 text-base"
                >
                  <Link href={`/pago/resultado?status=pending&external_reference=demo-${plan.code}-${clientId || "client"}`}>
                    Simular pago pendiente
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-2xl border-slate-300 px-6 text-base"
                >
                  <Link href={`/pago/resultado?status=rejected&external_reference=demo-${plan.code}-${clientId || "client"}`}>
                    Simular pago rechazado
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-6">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Resumen de la sesión
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Información útil para validar el flujo completo del checkout.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Plan code
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {plan.code}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Client ID
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900">
                    {clientId || "No informado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Provider esperado
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Mercado Pago
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-700" />
                <p className="text-sm font-semibold text-slate-900">
                  Qué valida esta página
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Continuidad visual del checkout premium.",
                  "Botones y recorridos sin puntos muertos.",
                  "Pantalla post-pago conectada con estados reales.",
                  "Base lista para Mercado Pago apenas habilite credenciales.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    </div>
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-slate-300"
                >
                  <Link href={`/iniciar-pago?plan=${plan.code}${clientId ? `&cid=${clientId}` : ""}`}>
                    Volver al checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
