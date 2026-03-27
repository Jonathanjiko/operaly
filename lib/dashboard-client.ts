import { getClientContext } from "@/lib/client-context"

export async function getCurrentClientId(): Promise<string> {
  const context = await getClientContext()
  return context.clientId
}
