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
}

export const OPERLAY_PLANS: OperalyPlan[] = [
  {
    code: "trial",
    name: "Trial",
    price: 0,
    currency: "USD",
    description: "Prueba gratuita para empezar con Operaly.",
    cta: "Empezar gratis",
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
    price: 12,
    currency: "USD",
    description: "Plan base para empezar a operar con Operaly.",
    cta: "Elegir Core",
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
    price: 24,
    currency: "USD",
    description: "Más capacidad, automatizaciones y funciones avanzadas.",
    cta: "Elegir Pro",
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
    price: 48,
    currency: "USD",
    description: "Plan más potente para una operación más completa.",
    cta: "Elegir Pro Plus",
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
