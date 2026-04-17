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

export async function fetchDashboardRuntime(): Promise<DashboardRuntimePayload | null> {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token || ""
  if (!accessToken) return null

  const response = await fetch("/api/dashboard/runtime", {
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
