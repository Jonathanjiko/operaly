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
}

export function toNumber(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const DASHBOARD_FETCH_TIMEOUT_MS = 8000

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
      throw new Error("La lectura auth-bound tardó demasiado. Supabase o el backend siguen degradados.")
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
    throw new Error(
      String(payload?.detail || payload?.error || "No se pudo cargar el runtime auth-bound.")
    )
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
    throw new Error(String(payload?.detail || payload?.error || "No se pudo cargar el dashboard auth-bound."))
  }

  return payload as T
}
