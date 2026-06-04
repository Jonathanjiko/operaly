export type DashboardStatusPayload = {
  ok: boolean
  clientId?: string
  plan: {
    code: string
    name: string
    status: string
    subscription_status: string
    current_period_end: string | null
    is_active: boolean
  }
  usage: {
    period: string
    messages_used: number
    messages_limit: number
    calls_used: number
    calls_limit: number
  }
  google: {
    connected: boolean
    connection_status: string
    scopes: string[]
    products: {
      gmail: boolean
      drive: boolean
      calendar: boolean
      contacts: boolean
    }
  }
  whatsapp: {
    connected: boolean
    phone: string | null
  }
}

export function normalizeDashboardStatus(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

export function canonicalDashboardPlanStatus(value: unknown) {
  const normalized = normalizeDashboardStatus(value)

  if (["cancelled", "canceled"].includes(normalized)) return "canceled"
  if (["pending_payment", "pending-payment", "pending payment"].includes(normalized)) return "pending_payment"
  if (["past_due", "past-due", "past due", "failed"].includes(normalized)) return "past_due"
  if (["expired_trial", "expired-trial", "trial_expired", "trial-expired"].includes(normalized)) return "expired_trial"
  if (normalized === "expired") return "expired"
  if (["trialing", "trial"].includes(normalized)) return "trialing"
  if (["active", "paid"].includes(normalized)) return "active"

  return normalized || "unknown"
}

export function isDashboardPlanActive(status: unknown) {
  return ["active", "trialing"].includes(canonicalDashboardPlanStatus(status))
}

export function formatPlanStatusDate(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
  }).format(date)
}

export function getUsagePercent(used: number, limit: number) {
  if (!limit || limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export function getDashboardPlanPresentation(status: unknown) {
  const normalized = canonicalDashboardPlanStatus(status)

  if (normalized === "active") {
    return {
      badgeLabel: "Activo",
      badgeClass: "bg-emerald-50 text-emerald-700",
      title: "Tu plan está activo",
    }
  }

  if (normalized === "trialing") {
    return {
      badgeLabel: "Trial",
      badgeClass: "bg-sky-50 text-sky-700",
      title: "Tu trial sigue activo",
    }
  }

  if (normalized === "pending_payment") {
    return {
      badgeLabel: "Pending Payment",
      badgeClass: "bg-amber-50 text-amber-700",
      title: "Tu pago está pendiente",
    }
  }

  if (normalized === "past_due") {
    return {
      badgeLabel: "Pago vencido",
      badgeClass: "bg-red-50 text-red-700",
      title: "Tu pago está vencido",
    }
  }

  if (normalized === "canceled") {
    return {
      badgeLabel: "Cancelado",
      badgeClass: "bg-slate-100 text-slate-700",
      title: "Tu suscripción fue cancelada",
    }
  }

  if (normalized === "expired_trial") {
    return {
      badgeLabel: "Trial vencido",
      badgeClass: "bg-amber-50 text-amber-800",
      title: "Tu trial venció",
    }
  }

  return {
    badgeLabel: "Vencido",
    badgeClass: "bg-amber-50 text-amber-800",
    title: "Tu suscripción venció",
  }
}
