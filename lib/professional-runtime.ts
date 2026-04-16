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

export async function fetchProfessionalRuntime(): Promise<ProfessionalRuntimeSnapshot | null> {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token || ""
  if (!accessToken) return null

  const response = await fetch("/api/professional/runtime", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(String(payload?.detail || payload?.error || "No se pudo cargar el runtime profesional."))
  }

  return payload as ProfessionalRuntimeSnapshot
}

export function normalizeRuntimeStatus(value: string | null | undefined) {
  const normalized = String(value || "").toLowerCase()
  if (!normalized) return "Sin señal"
  if (normalized.includes("sent")) return "Enviado"
  if (normalized.includes("failed")) return "Falló"
  if (normalized.includes("pending")) return "Pendiente"
  if (normalized.includes("queued")) return "En cola"
  if (normalized.includes("connected")) return "Conectado"
  if (normalized.includes("ok")) return "OK"
  return normalized.replace(/_/g, " ")
}
