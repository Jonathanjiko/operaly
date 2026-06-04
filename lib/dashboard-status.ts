export type DashboardStatusPayload = {
  ok: boolean
  clientId?: string
  plan: {
    code: string
    name: string
    status: string
    subscription_status: string
    gate_allowed: boolean
    current_period_end: string | null
    is_active: boolean
  }
  payment: {
    status: string
    checkout_url: string | null
    status_component?: DashboardPaymentStatusComponent | null
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
    normalized_phone: string | null
    activation_status: string
    welcome_sent: boolean
  }
}

export type DashboardPaymentStatusComponent = {
  status_key: string
  tone: "success" | "warning" | "error" | "neutral"
  title: string
  description?: string | null
  cta_label?: string | null
  cta_href?: string | null
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

export function normalizeDashboardPaymentStatus(value: unknown) {
  const normalized = normalizeDashboardStatus(value)

  if (["approved", "paid", "succeeded", "active"].includes(normalized)) return "approved"
  if (["pending_payment", "pending-payment", "pending payment"].includes(normalized)) return "pending_payment"
  if (["pending", "processing", "initiated"].includes(normalized)) return "pending"
  if (["past_due", "past-due", "past due", "failed", "declined"].includes(normalized)) return "failed"
  if (["cancelled", "canceled"].includes(normalized)) return "canceled"

  return normalized || "unknown"
}

export function buildFallbackPaymentStatusComponent({
  planStatus,
  paymentStatus,
  gateAllowed,
  checkoutUrl,
}: {
  planStatus: unknown
  paymentStatus: unknown
  gateAllowed: boolean
  checkoutUrl?: string | null
}): DashboardPaymentStatusComponent {
  const normalizedPlanStatus = canonicalDashboardPlanStatus(planStatus)
  const normalizedPaymentStatus = normalizeDashboardPaymentStatus(paymentStatus)
  const actionHref = checkoutUrl || "/dashboard/professional/configuracion"

  if (
    normalizedPlanStatus === "pending_payment" ||
    normalizedPaymentStatus === "pending_payment" ||
    normalizedPaymentStatus === "pending"
  ) {
    return {
      status_key: "pending_payment",
      tone: "warning",
      title: "Pago pendiente",
      description: "Completa tu pago para activar tu plan.",
      cta_label: "Completar pago",
      cta_href: actionHref,
    }
  }

  if (normalizedPlanStatus === "past_due" || normalizedPaymentStatus === "failed") {
    return {
      status_key: "past_due",
      tone: "warning",
      title: "Pago vencido",
      description: "Tu suscripción necesita regularización para volver a operar.",
      cta_label: "Regularizar pago",
      cta_href: actionHref,
    }
  }

  if (normalizedPlanStatus === "canceled" || normalizedPaymentStatus === "canceled") {
    return {
      status_key: "rejected",
      tone: "error",
      title: "Pago rechazado",
      description: "Tu último intento no se confirmó.",
      cta_label: "Intentar nuevamente",
      cta_href: actionHref,
    }
  }

  if (normalizedPlanStatus === "expired_trial") {
    return {
      status_key: "expired_trial",
      tone: "warning",
      title: "Trial vencido",
      description: "Tu prueba terminó y ahora necesitas elegir un plan.",
      cta_label: "Actualizar plan",
      cta_href: actionHref,
    }
  }

  if (normalizedPlanStatus === "trialing") {
    return {
      status_key: "trialing",
      tone: "success",
      title: "Trial activo",
      description: "Tu prueba sigue vigente.",
      cta_label: null,
      cta_href: null,
    }
  }

  if (normalizedPlanStatus === "active" && gateAllowed) {
    return {
      status_key: "active",
      tone: "success",
      title: "Pago aprobado",
      description: "Tu plan ya está operativo.",
      cta_label: null,
      cta_href: null,
    }
  }

  return {
    status_key: "unknown",
    tone: "neutral",
    title: "Estado de pago no disponible",
    description: "No pudimos confirmar tu estado comercial ahora mismo.",
    cta_label: null,
    cta_href: null,
  }
}

export function normalizeWhatsappActivationStatus(value: unknown) {
  const normalized = normalizeDashboardStatus(value)

  if (["active", "verified", "connected", "ready"].includes(normalized)) return "active"
  if (["pending", "requested", "queued", "awaiting_plan", "welcome_pending"].includes(normalized)) return "pending"
  if (["failed", "rejected", "missing_phone", "disconnected", "attention"].includes(normalized)) return "attention"

  return normalized || "unknown"
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
