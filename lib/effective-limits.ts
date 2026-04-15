export type EffectiveLimitsRuntime = {
  effective_plan_code?: string | null
  effective_status?: string | null
  effective_plan_name?: string | null
  gate_allowed?: boolean | null
  usage_period_month?: string | null
  period_month?: string | null
  plan_code?: string | null
  plan_status?: string | null
  plan?: {
    plan_type?: string | null
  } | null
  max_messages_month?: number | null
  max_audio_minutes?: number | null
  max_automations?: number | null
  max_storage_mb?: number | null
  voice_enabled?: boolean | null
  google_enabled?: boolean | null
  calls_enabled?: boolean | null
  custom_agent_enabled?: boolean | null
  [key: string]: unknown
}

export function getCurrentPeriodMonth() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

export function getEffectivePlanCode(limits: EffectiveLimitsRuntime | null | undefined) {
  return (
    limits?.effective_plan_code ||
    limits?.plan_code ||
    limits?.plan?.plan_type ||
    "trial"
  )
}

export function getEffectivePlanStatus(limits: EffectiveLimitsRuntime | null | undefined) {
  return limits?.effective_status || limits?.plan_status || "trialing"
}

export function getEffectivePeriodMonth(limits: EffectiveLimitsRuntime | null | undefined) {
  return limits?.usage_period_month || limits?.period_month || getCurrentPeriodMonth()
}

export function formatPeriodMonthLabel(periodMonth: string | null | undefined) {
  const value = String(periodMonth || "")
  const match = value.match(/^(\d{4})-(\d{2})/)
  if (!match) return value || "periodo actual"
  return `${match[1]}/${match[2]}`
}
