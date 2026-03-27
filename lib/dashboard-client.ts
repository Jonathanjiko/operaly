import { supabase } from "@/lib/supabase"

export async function getCurrentClientId(): Promise<string> {
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

  if (!clientId) {
    throw new Error("No encontramos el client_id de esta cuenta.")
  }

  return clientId
}
