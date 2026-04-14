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
    description: "Prueba gratuita para empezar con Operaly.",
    cta: "Empezar gratis",
    billingPeriodLabel: "7 días",
    features: [
      "Acceso de prueba",
      "Configuración inicial",
      "Onboarding guiado",
      "Sin pago inmediato",
    ],
  },
  {
    code: "core",
    name: "Core",
    price: 49,
    currency: "PEN",
    description: "Plan base para empezar a operar con Operaly.",
    cta: "Elegir Core",
    billingPeriodLabel: "mensual",
    features: [
      "Agente IA en WhatsApp",
      "Contactos habilitados",
      "Uso mensual base",
      "Dashboard y métricas",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    price: 99,
    currency: "PEN",
    description: "Más capacidad, automatizaciones y funciones avanzadas.",
    cta: "Elegir Pro",
    billingPeriodLabel: "mensual",
    popular: true,
    features: [
      "Todo lo de Core",
      "Más capacidad mensual",
      "Automatizaciones",
      "Drive habilitado",
      "Llamadas habilitadas",
    ],
  },
  {
    code: "pro_plus",
    name: "Pro Plus",
    price: 199,
    currency: "PEN",
    description: "Plan más potente para una operación más completa.",
    cta: "Elegir Pro Plus",
    billingPeriodLabel: "mensual",
    features: [
      "Todo lo de Pro",
      "Mayor capacidad",
      "Funciones avanzadas IA",
      "Mayor escalabilidad operativa",
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
  return getPlanByCode(planCode)?.name ?? String(planCode || "Trial")
}

export function hasIncludedLimit(limit: number | null | undefined, enabled = true) {
  return enabled && Number(limit ?? 0) > 0
}

export function formatLimit(limit: number | null | undefined, enabled = true) {
  if (!hasIncludedLimit(limit, enabled)) return "No incluido"
  return Number(limit ?? 0).toLocaleString()
}
