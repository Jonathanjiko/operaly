import { supabase } from "@/lib/supabase"

export type ProfessionalRuntimeSnapshot = {
  clientId?: string
  client?: Record<string, any> | null
  voice?: Record<string, any> | null
  preferences?: Record<string, string>
  welcome?: Record<string, any> | null
  contextState?: Record<string, any> | null
  recentEvents?: Array<Record<string, any>>
  recentUnderstandingRuns?: Array<Record<string, any>>
}

const PROFESSIONAL_RUNTIME_TIMEOUT_MS = 12000

async function fetchWithProfessionalTimeout(input: string, init: RequestInit) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), PROFESSIONAL_RUNTIME_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Esta información tardó más de lo normal. Se mostrarán los últimos datos disponibles.")
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

export async function fetchProfessionalRuntime(): Promise<ProfessionalRuntimeSnapshot | null> {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token || ""
  if (!accessToken) return null

  const response = await fetchWithProfessionalTimeout("/api/professional/runtime", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(String(payload?.detail || payload?.error || "No se pudo cargar esta información por ahora."))
  }

  return payload as ProfessionalRuntimeSnapshot
}

export function normalizeRuntimeStatus(value: string | null | undefined) {
  const normalized = String(value || "").toLowerCase()
  if (!normalized) return "Sin actividad reciente"
  if (normalized.includes("sent")) return "Enviado"
  if (normalized.includes("failed")) return "Falló"
  if (normalized.includes("pending")) return "Pendiente"
  if (normalized.includes("queued")) return "En cola"
  if (normalized.includes("connected")) return "Conectado"
  if (normalized.includes("ok")) return "OK"
  return normalized.replace(/_/g, " ")
}
