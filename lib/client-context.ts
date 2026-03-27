import { supabase } from "@/lib/supabase"

export type ClientContext = {
  userId: string
  clientId: string
  email: string | null
}

export async function getClientContext(): Promise<ClientContext> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error("No hay sesión activa.")
  }

  const clientId = user.user_metadata?.client_id

  if (!clientId || typeof clientId !== "string") {
    throw new Error("El usuario no tiene client_id en metadata.")
  }

  return {
    userId: user.id,
    clientId,
    email: user.email ?? null,
  }
}
