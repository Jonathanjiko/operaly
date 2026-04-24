import { supabase } from "@/lib/supabase"

export type DashboardRuntimePayload = {
  client?: Record<string, any> | null
  runtime?: Record<string, any> | null
  voice?: Record<string, any> | null
  preferences?: Record<string, string> | null
  welcome?: Record<string, any> | null
  contextState?: Record<string, any> | null
  recentEvents?: Array<Record<string, any>>
  recentUnderstandingRuns?: Array<Record<string, any>>
  plan?: Record<string, any> | null
  effective_plan_code?: string | null
  usage?: Record<string, any> | null
  limits?: Record<string, any> | null
  feature_access?: Record<string, any> | null
  offers?: Array<Record<string, any>>
  addon_offers?: Array<Record<string, any>>
  user_facing?: Record<string, any> | null
  commercial_status?: Record<string, any> | null
  recovery?: Record<string, any> | null
}

export function toNumber(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function readDashboardCurrentPlan(userFacing: Record<string, any> | null | undefined) {
  const raw = userFacing?.current_plan
  if (typeof raw === "string") return raw
  if (raw && typeof raw === "object") {
    return String((raw as Record<string, any>).code || (raw as Record<string, any>).plan_code || "")
  }
  return ""
}

export function resolveDashboardPlanCode(
  payload: DashboardRuntimePayload | null | undefined,
  fallback = "trial"
) {
  const userFacing = payload?.user_facing
  const resolved = String(
    readDashboardCurrentPlan(userFacing) ||
      payload?.plan?.effective_plan_code ||
      payload?.plan?.plan_type ||
      payload?.plan?.code ||
      payload?.effective_plan_code ||
      payload?.limits?.effective_plan_code ||
      fallback
  )
    .trim()
    .toLowerCase()

  return resolved || String(fallback || "trial").trim().toLowerCase() || "trial"
}

export function resolveDashboardPlanLimits(payload: DashboardRuntimePayload | null | undefined) {
  const numeric = payload?.user_facing?.plan_limits_numeric
  if (numeric && typeof numeric === "object") {
    return numeric as Record<string, any>
  }
  return (payload?.limits || {}) as Record<string, any>
}

function readDashboardCurrentPlanStatus(userFacing: Record<string, any> | null | undefined) {
  const raw = userFacing?.current_plan
  if (raw && typeof raw === "object") {
    return String((raw as Record<string, any>).status || (raw as Record<string, any>).plan_status || "")
  }
  return ""
}

function normalizeStatus(value: unknown, fallback = "") {
  return String(value ?? fallback)
    .trim()
    .toLowerCase()
}

export function resolveDashboardEffectiveStatus(
  payload: DashboardRuntimePayload | null | undefined,
  fallback = "trialing"
) {
  const resolved = normalizeStatus(
    payload?.commercial_status?.effective_status ||
      payload?.plan?.effective_status ||
      payload?.plan?.status ||
      payload?.user_facing?.account_status ||
      fallback
  )

  return resolved || normalizeStatus(fallback || "trialing") || "trialing"
}

function normalizeBooleanLike(value: unknown) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "true") return true
    if (normalized === "false") return false
  }
  return null
}

export function resolveDashboardPlanStatus(
  payload: DashboardRuntimePayload | null | undefined,
  fallback = "trialing"
) {
  const resolved = normalizeStatus(
    resolveDashboardEffectiveStatus(payload, fallback) ||
      payload?.commercial_status?.professional_dashboard_status ||
      payload?.plan?.canonical_status ||
      readDashboardCurrentPlanStatus(payload?.user_facing) ||
      payload?.limits?.effective_status ||
      payload?.client?.plan_status ||
      fallback
  )

  return resolved || normalizeStatus(fallback || "trialing") || "trialing"
}

export function isDashboardAccessRestricted(payload: DashboardRuntimePayload | null | undefined) {
  const status = resolveDashboardEffectiveStatus(payload)
  const gateAllowed =
    normalizeBooleanLike(payload?.user_facing?.gate_allowed) ??
    normalizeBooleanLike(payload?.limits?.gate_allowed)
  const blockedReason = normalizeStatus(
    payload?.user_facing?.blocked_reason || payload?.plan?.blocked_reason || payload?.commercial_status?.blocked_reason
  )

  if (gateAllowed === false) return true
  if (blockedReason) return true
  return !["active", "trialing"].includes(status)
}

export function isDashboardAccountActive(payload: DashboardRuntimePayload | null | undefined) {
  return !isDashboardAccessRestricted(payload)
}

const DASHBOARD_FETCH_TIMEOUT_MS = 12000

async function fetchWithDashboardTimeout(input: string, init: RequestInit) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), DASHBOARD_FETCH_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Esta sección tardó más de lo normal. Le mostramos la información más reciente disponible.")
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

export async function fetchDashboardRuntime(): Promise<DashboardRuntimePayload | null> {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token || ""
  if (!accessToken) return null

  const response = await fetchWithDashboardTimeout("/api/dashboard/runtime", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => ({}))) as DashboardRuntimePayload
  if (!response.ok) {
    throw new Error(String(payload?.detail || payload?.error || "No se pudo cargar esta sección por ahora."))
  }

  return payload
}

export async function fetchDashboardJson<T = Record<string, any>>(path: string): Promise<T | null> {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token || ""
  if (!accessToken) return null

  const response = await fetchWithDashboardTimeout(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => ({}))) as T & { detail?: string; error?: string }
  if (!response.ok) {
    throw new Error(String(payload?.detail || payload?.error || "No se pudo cargar esta vista por ahora."))
  }

  return payload as T
}
