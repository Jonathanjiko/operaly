import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export type ClientContext = {
  userId: string
  clientId: string
  email: string | null
}

export function resolveClientIdFromUser(user: Pick<User, "app_metadata" | "user_metadata">): string | null {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) {
    return fromAppMeta.trim()
  }

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) {
    return fromUserMeta.trim()
  }

  return null
}

/**
 * Obtiene el client_id del usuario autenticado.
 * app_metadata manda. user_metadata queda como fallback legacy.
 * localStorage NO es fuente de verdad.
 */
export async function getClientContext(): Promise<ClientContext> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error("No hay sesión activa.")

  const clientId = resolveClientIdFromUser(user)

  if (!clientId) {
    throw new Error("El usuario no tiene client_id configurado en metadata segura.")
  }

  try {
    localStorage.setItem("operaly_client_id", clientId)
  } catch {
    // best-effort cache only
  }

  return {
    userId: user.id,
    clientId,
    email: user.email ?? null,
  }
}

export async function getClientPlanCode(clientId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("plan_code")
    .eq("id", clientId)
    .single()

  if (error) {
    throw error
  }

  return typeof data?.plan_code === "string" ? data.plan_code : null
}

export async function isOwnerAccount(clientId: string): Promise<boolean> {
  const planCode = await getClientPlanCode(clientId)
  return String(planCode || "").toLowerCase() === "owner"
}
