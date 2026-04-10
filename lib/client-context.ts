import { supabase } from "@/lib/supabase"

export type ClientContext = {
  userId: string
  clientId: string
  email: string | null
}

/**
 * Obtiene el client_id del usuario autenticado.
 * Prioriza app_metadata (seguro, solo el servidor puede escribirlo)
 * con fallback a user_metadata (legacy) y localStorage.
 */
export async function getClientContext(): Promise<ClientContext> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error("No hay sesión activa.")

  // app_metadata es seguro (solo service_role puede escribirlo)
  // user_metadata es editable por el usuario — solo como fallback legacy
  const clientId =
    user.app_metadata?.client_id ||
    user.user_metadata?.client_id ||
    localStorage.getItem("operaly_client_id")

  if (!clientId || typeof clientId !== "string") {
    throw new Error("El usuario no tiene client_id configurado.")
  }

  // Guardar en localStorage como caché local
  localStorage.setItem("operaly_client_id", clientId)

  return {
    userId: user.id,
    clientId,
    email: user.email ?? null,
  }
}
