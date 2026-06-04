export type DashboardStatusPayload = {
  ok: boolean
  clientId?: string
  plan: {
    code: string
    name: string
    status: string
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

export function isDashboardPlanActive(status: unknown) {
  return ["active", "trialing"].includes(normalizeDashboardStatus(status))
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
