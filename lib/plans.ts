export type OperalyPlanCode = "trial" | "core" | "pro" | "pro_plus"

export type OperalyPlan = {
  code: OperalyPlanCode
  name: string
  price: number
  currency: string
  description: string
  cta: string
  popular?: boolean
  features: string[]
  billingPeriodLabel: string
}

export const OPERLAY_PLANS: OperalyPlan[] = [
  {
    code: "trial",
    name: "Trial",
    price: 0,
    currency: "PEN",
    description: "Prueba gratis de 7 dias con Google Suite incluido y todos los modulos base habilitados.",
    cta: "Prueba gratis",
    billingPeriodLabel: "7 dias",
    features: [
      "250 mensajes IA",
      "5 min de voz y llamadas",
      "0.5 GB de almacenamiento",
      "100 contactos y 2 automatizaciones",
      "Google Suite incluido durante trial",
    ],
  },
  {
    code: "core",
    name: "Core",
    price: 49,
    currency: "PEN",
    description: "Plan base para usar Operaly todos los dias con mas capacidad y una operacion ya estable.",
    cta: "Elegir Core",
    billingPeriodLabel: "mensual",
    features: [
      "1200 mensajes IA",
      "10 min de voz y llamadas",
      "3 GB de almacenamiento",
      "500 contactos y 10 automatizaciones",
      "Google Suite desde Pro en adelante",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    price: 99,
    currency: "PEN",
    description: "Mas capacidad para seguimiento continuo, audio frecuente y operacion profesional.",
    cta: "Elegir Pro",
    billingPeriodLabel: "mensual",
    popular: true,
    features: [
      "3000 mensajes IA",
      "30 min de voz y llamadas",
      "5 GB de almacenamiento",
      "1000 contactos y 15 automatizaciones",
      "Google Suite incluido",
    ],
  },
  {
    code: "pro_plus",
    name: "Pro Plus",
    price: 199,
    currency: "PEN",
    description: "La capa mas amplia para vivir dentro de Operaly con automatizacion y capacidad extendida.",
    cta: "Elegir Pro Plus",
    billingPeriodLabel: "mensual",
    features: [
      "5000 mensajes IA",
      "60 min de voz y llamadas",
      "10 GB de almacenamiento",
      "2000 contactos y 30 automatizaciones",
      "Google Suite incluido",
    ],
  },
]

export function getPlanByCode(code: string | null | undefined) {
  return OPERLAY_PLANS.find((plan) => plan.code === code)
}

export function getDisplayPlanPrice(planCode: string | null | undefined) {
  return getPlanByCode(planCode)?.price ?? 0
}

export function getDisplayPlanPeriodicity(planCode: string | null | undefined) {
  return getPlanByCode(planCode)?.billingPeriodLabel ?? "mensual"
}

export function getDisplayPlanName(planCode: string | null | undefined) {
  const normalized = String(planCode || "").trim().toLowerCase()
  if (normalized === "owner") return "Owner"
  if (normalized === "owner_unlimited") return "Owner Unlimited"
  return getPlanByCode(normalized)?.name ?? String(planCode || "Trial")
}

export function hasIncludedLimit(limit: number | null | undefined, enabled = true) {
  return enabled && Number(limit ?? 0) > 0
}

export function formatLimit(limit: number | null | undefined, enabled = true) {
  if (!hasIncludedLimit(limit, enabled)) return "No incluido"
  return Number(limit ?? 0).toLocaleString()
}
