import { OPERLAY_PLANS, type OperalyPlanCode } from "@/lib/plans"

export type OwnerPlanLimits = {
  ia_limit: number
  calls_minutes: number
  storage_gb: number
  contacts_limit: number
  automations_limit: number
}

export type OwnerCatalogPlan = {
  code: OperalyPlanCode
  name: string
  price: number
  currency: string
  description: string
  cta: string
  billingPeriodLabel: string
  features: string[]
  limits: OwnerPlanLimits
}

export type OwnerCatalogAddon = {
  code: string
  name: string
  description: string
  price: number
  currency: string
  billingPeriodLabel: string
  category: string
  features: string[]
  extra_messages: number
  extra_minutes: number
  extra_storage_gb: number
  extra_automations: number
  enables_voice: boolean
  enables_google: boolean
  active: boolean
}

export type OwnerCatalog = {
  plans: OwnerCatalogPlan[]
  addons: OwnerCatalogAddon[]
  updatedAt: string
}

export type OwnerTargetMetrics = {
  profitPen: number
  salesPen: number
  subscribers: number
}

export type OwnerTargets = {
  week: OwnerTargetMetrics
  month: OwnerTargetMetrics
  updatedAt: string
}

const DEFAULT_PLAN_LIMITS: Record<OperalyPlanCode, OwnerPlanLimits> = {
  trial: {
    ia_limit: 250,
    calls_minutes: 0,
    storage_gb: 0.5,
    contacts_limit: 100,
    automations_limit: 0,
  },
  core: {
    ia_limit: 1200,
    calls_minutes: 60,
    storage_gb: 5,
    contacts_limit: 1000,
    automations_limit: 12,
  },
  pro: {
    ia_limit: 4000,
    calls_minutes: 180,
    storage_gb: 20,
    contacts_limit: 10000,
    automations_limit: 40,
  },
  pro_plus: {
    ia_limit: 12000,
    calls_minutes: 600,
    storage_gb: 80,
    contacts_limit: 50000,
    automations_limit: 150,
  },
}

const DEFAULT_ADDONS: OwnerCatalogAddon[] = [
  {
    code: "addon_voice_100",
    name: "Minutos de voz",
    description: "+100 minutos para audios y llamadas.",
    price: 10,
    currency: "USD",
    billingPeriodLabel: "mensual",
    category: "voz",
    features: ["Audio y llamadas", "Activación inmediata"],
    extra_messages: 0,
    extra_minutes: 100,
    extra_storage_gb: 0,
    extra_automations: 0,
    enables_voice: true,
    enables_google: false,
    active: true,
  },
  {
    code: "addon_audio_60",
    name: "Paquete audio 60",
    description: "+60 minutos adicionales para voz.",
    price: 6,
    currency: "USD",
    billingPeriodLabel: "mensual",
    category: "voz",
    features: ["Refuerzo de consumo", "Compatible con todos los planes"],
    extra_messages: 0,
    extra_minutes: 60,
    extra_storage_gb: 0,
    extra_automations: 0,
    enables_voice: true,
    enables_google: false,
    active: true,
  },
  {
    code: "addon_storage_5gb",
    name: "Almacenamiento 5 GB",
    description: "+5 GB para documentos y archivos.",
    price: 5,
    currency: "USD",
    billingPeriodLabel: "mensual",
    category: "storage",
    features: ["Más capacidad documental"],
    extra_messages: 0,
    extra_minutes: 0,
    extra_storage_gb: 5,
    extra_automations: 0,
    enables_voice: false,
    enables_google: false,
    active: true,
  },
  {
    code: "addon_storage_20gb",
    name: "Almacenamiento 20 GB",
    description: "+20 GB para operaciones con alto volumen.",
    price: 15,
    currency: "USD",
    billingPeriodLabel: "mensual",
    category: "storage",
    features: ["Capacidad extendida", "Documentos pesados"],
    extra_messages: 0,
    extra_minutes: 0,
    extra_storage_gb: 20,
    extra_automations: 0,
    enables_voice: false,
    enables_google: false,
    active: true,
  },
  {
    code: "addon_conv_2000",
    name: "Mensajes IA 2,000",
    description: "+2,000 conversaciones o mensajes IA.",
    price: 12,
    currency: "USD",
    billingPeriodLabel: "mensual",
    category: "ia",
    features: ["Más capacidad de IA"],
    extra_messages: 2000,
    extra_minutes: 0,
    extra_storage_gb: 0,
    extra_automations: 0,
    enables_voice: false,
    enables_google: false,
    active: true,
  },
  {
    code: "addon_google",
    name: "Google Suite",
    description: "Habilita Drive, Gmail y Calendar.",
    price: 8,
    currency: "USD",
    billingPeriodLabel: "mensual",
    category: "integracion",
    features: ["Drive", "Gmail", "Calendar"],
    extra_messages: 0,
    extra_minutes: 0,
    extra_storage_gb: 0,
    extra_automations: 0,
    enables_voice: false,
    enables_google: true,
    active: true,
  },
]

const DEFAULT_TARGETS: OwnerTargets = {
  week: {
    profitPen: 2500,
    salesPen: 7000,
    subscribers: 8,
  },
  month: {
    profitPen: 10000,
    salesPen: 24000,
    subscribers: 24,
  },
  updatedAt: new Date().toISOString(),
}

function toNumber(value: unknown, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function toBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback
}

export function getDefaultOwnerCatalog(): OwnerCatalog {
  return {
    plans: OPERLAY_PLANS.map((plan) => ({
      code: plan.code,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      description: plan.description,
      cta: plan.cta,
      billingPeriodLabel: plan.billingPeriodLabel,
      features: [...plan.features],
      limits: { ...DEFAULT_PLAN_LIMITS[plan.code] },
    })),
    addons: DEFAULT_ADDONS.map((addon) => ({
      ...addon,
      features: [...addon.features],
    })),
    updatedAt: new Date().toISOString(),
  }
}

export function getDefaultOwnerTargets(): OwnerTargets {
  return {
    week: { ...DEFAULT_TARGETS.week },
    month: { ...DEFAULT_TARGETS.month },
    updatedAt: new Date().toISOString(),
  }
}

export function sanitizeOwnerCatalog(input: unknown): OwnerCatalog {
  const fallback = getDefaultOwnerCatalog()
  const raw = input && typeof input === "object" ? (input as Partial<OwnerCatalog>) : {}
  const planMap = new Map(
    (Array.isArray(raw.plans) ? raw.plans : []).map((plan) => [String(plan?.code || ""), plan])
  )
  const addonMap = new Map(
    (Array.isArray(raw.addons) ? raw.addons : []).map((addon) => [String(addon?.code || ""), addon])
  )

  return {
    plans: fallback.plans.map((plan) => {
      const stored = planMap.get(plan.code)
      return {
        ...plan,
        name: String(stored?.name || plan.name),
        price: toNumber(stored?.price, plan.price),
        currency: String(stored?.currency || plan.currency).toUpperCase(),
        description: String(stored?.description || plan.description),
        cta: String(stored?.cta || plan.cta),
        billingPeriodLabel: String(stored?.billingPeriodLabel || plan.billingPeriodLabel),
        features: Array.isArray(stored?.features)
          ? stored!.features.map((feature) => String(feature))
          : plan.features,
        limits: {
          ia_limit: toNumber(stored?.limits?.ia_limit, plan.limits.ia_limit),
          calls_minutes: toNumber(stored?.limits?.calls_minutes, plan.limits.calls_minutes),
          storage_gb: toNumber(stored?.limits?.storage_gb, plan.limits.storage_gb),
          contacts_limit: toNumber(stored?.limits?.contacts_limit, plan.limits.contacts_limit),
          automations_limit: toNumber(
            stored?.limits?.automations_limit,
            plan.limits.automations_limit
          ),
        },
      }
    }),
    addons: (Array.isArray(raw.addons) ? raw.addons : fallback.addons).map((addon, index) => {
      const fallbackAddon = fallback.addons[index]
      const source = addonMap.get(String(addon?.code || "")) || addon || fallbackAddon
      return {
        code: String(source?.code || fallbackAddon?.code || `addon_${index + 1}`),
        name: String(source?.name || fallbackAddon?.name || "Add-on"),
        description: String(source?.description || fallbackAddon?.description || ""),
        price: toNumber(source?.price, fallbackAddon?.price || 0),
        currency: String(source?.currency || fallbackAddon?.currency || "USD").toUpperCase(),
        billingPeriodLabel: String(
          source?.billingPeriodLabel || fallbackAddon?.billingPeriodLabel || "mensual"
        ),
        category: String(source?.category || fallbackAddon?.category || "general"),
        features: Array.isArray(source?.features)
          ? source!.features.map((feature) => String(feature))
          : fallbackAddon?.features || [],
        extra_messages: toNumber(source?.extra_messages, fallbackAddon?.extra_messages || 0),
        extra_minutes: toNumber(source?.extra_minutes, fallbackAddon?.extra_minutes || 0),
        extra_storage_gb: toNumber(
          source?.extra_storage_gb,
          fallbackAddon?.extra_storage_gb || 0
        ),
        extra_automations: toNumber(
          source?.extra_automations,
          fallbackAddon?.extra_automations || 0
        ),
        enables_voice: toBoolean(source?.enables_voice, fallbackAddon?.enables_voice || false),
        enables_google: toBoolean(source?.enables_google, fallbackAddon?.enables_google || false),
        active: toBoolean(source?.active, fallbackAddon?.active ?? true),
      }
    }),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  }
}

export function sanitizeOwnerTargets(input: unknown): OwnerTargets {
  const fallback = getDefaultOwnerTargets()
  const raw = input && typeof input === "object" ? (input as Partial<OwnerTargets>) : {}

  return {
    week: {
      profitPen: toNumber(raw.week?.profitPen, fallback.week.profitPen),
      salesPen: toNumber(raw.week?.salesPen, fallback.week.salesPen),
      subscribers: toNumber(raw.week?.subscribers, fallback.week.subscribers),
    },
    month: {
      profitPen: toNumber(raw.month?.profitPen, fallback.month.profitPen),
      salesPen: toNumber(raw.month?.salesPen, fallback.month.salesPen),
      subscribers: toNumber(raw.month?.subscribers, fallback.month.subscribers),
    },
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  }
}
