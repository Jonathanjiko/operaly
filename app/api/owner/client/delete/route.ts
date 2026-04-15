import { NextResponse } from "next/server"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const OWNER_ACTIVITY_PREF_KEY = "owner_console_activity"
const INTERNAL_OWNER_PLANS = new Set(["owner", "owner_unlimited", "internal"])

type OwnerActivityEntry = {
  id: string
  action: "plan_change" | "status_change" | "client_delete"
  clientId: string
  clientName: string
  previousValue: string | null
  nextValue: string | null
  createdAt: string
}

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function getAdminClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getAnonClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function extractBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(401, "missing_bearer_token")
  }

  const token = authHeader.slice(7).trim()
  if (!token) throw new HttpError(401, "missing_bearer_token")
  return token
}

function resolveClientIdFromUser(user: { app_metadata?: Record<string, any>; user_metadata?: Record<string, any> }): string {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) return fromAppMeta.trim()

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) return fromUserMeta.trim()

  throw new HttpError(403, "missing_client_id")
}

async function requireOwner(request: Request) {
  const token = extractBearerToken(request)
  const anon = getAnonClient()
  const admin = getAdminClient()
  const { data: authData, error: authError } = await anon.auth.getUser(token)

  if (authError || !authData.user) throw new HttpError(401, "invalid_session")

  const ownerClientId = resolveClientIdFromUser(authData.user as any)
  const { data: ownerClient, error: ownerError } = await admin
    .from("clients")
    .select("id, plan_code")
    .eq("id", ownerClientId)
    .maybeSingle()

  if (ownerError) throw new HttpError(500, ownerError.message)

  const normalizedPlan = String(ownerClient?.plan_code || "").toLowerCase()
  if (!ownerClient || !INTERNAL_OWNER_PLANS.has(normalizedPlan)) {
    throw new HttpError(403, "forbidden")
  }

  return { admin, ownerClientId }
}

async function appendOwnerActivity(
  admin: ReturnType<typeof getAdminClient>,
  ownerClientId: string,
  entry: OwnerActivityEntry
) {
  const { data: prefRow } = await admin
    .from("client_preferences")
    .select("pref_value")
    .eq("client_id", ownerClientId)
    .eq("pref_key", OWNER_ACTIVITY_PREF_KEY)
    .maybeSingle()

  let history: OwnerActivityEntry[] = []

  try {
    history = JSON.parse(String(prefRow?.pref_value || "[]"))
    if (!Array.isArray(history)) history = []
  } catch {
    history = []
  }

  const nextHistory = [entry, ...history].slice(0, 100)

  const { error: prefError } = await admin
    .from("client_preferences")
    .upsert(
      {
        client_id: ownerClientId,
        pref_key: OWNER_ACTIVITY_PREF_KEY,
        pref_value: JSON.stringify(nextHistory),
        source: "owner_console",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id,pref_key" }
    )

  if (prefError) throw new HttpError(500, prefError.message)
}

function isIgnorableDeleteError(error: any) {
  const code = String(error?.code || "")
  const message = String(error?.message || "").toLowerCase()
  return (
    code === "PGRST205" ||
    message.includes("could not find the table") ||
    message.includes("relation") && message.includes("does not exist")
  )
}

async function deleteByClientId(admin: SupabaseClient, table: string, clientId: string) {
  const { error } = await admin.from(table).delete().eq("client_id", clientId)
  if (error && !isIgnorableDeleteError(error)) {
    throw new HttpError(500, `${table}: ${error.message}`)
  }
}

async function lookupAuthUserId(
  admin: ReturnType<typeof getAdminClient>,
  clientId: string,
  email: string | null,
  phone: string | null
) {
  const targetEmail = String(email || "").trim().toLowerCase()
  const normalizedPhone = String(phone || "").replace(/\D/g, "")

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new HttpError(500, `auth_lookup_failed:${error.message}`)

    const users = data?.users || []
    for (const user of users) {
      const appClientId = String((user.app_metadata as any)?.client_id || "").trim()
      const userClientId = String((user.user_metadata as any)?.client_id || "").trim()
      const userEmail = String(user.email || "").trim().toLowerCase()
      const userPhone = String((user.phone || (user.user_metadata as any)?.phone || "")).replace(/\D/g, "")

      if (
        appClientId === clientId ||
        userClientId === clientId ||
        (targetEmail && userEmail === targetEmail) ||
        (normalizedPhone && userPhone.endsWith(normalizedPhone))
      ) {
        return user.id
      }
    }

    if (users.length < 200) break
  }

  return null
}

export async function POST(request: Request) {
  try {
    const { admin, ownerClientId } = await requireOwner(request)
    const body = await request.json()

    const clientId = String(body?.clientId || "").trim()
    const email = body?.email ? String(body.email).trim() : null
    const phone = body?.phone ? String(body.phone).trim() : null

    if (!clientId) throw new HttpError(400, "missing_client_id")
    if (clientId === ownerClientId) throw new HttpError(400, "cannot_delete_owner_self")

    const { data: currentClient, error: clientLookupError } = await admin
      .from("clients")
      .select("id, name, email, phone, plan_code, status")
      .eq("id", clientId)
      .maybeSingle()

    if (clientLookupError) throw new HttpError(500, clientLookupError.message)
    if (!currentClient) throw new HttpError(404, "client_not_found")

    const authUserId = await lookupAuthUserId(admin, clientId, email ?? currentClient.email ?? null, phone ?? currentClient.phone ?? null)

    const clientScopedTables = [
      "task_reminders",
      "scheduled_messages",
      "recurring_tasks",
      "messages",
      "conversations",
      "contacts",
      "tasks",
      "documents",
      "cases",
      "lists",
      "checklists",
      "private_vault_items",
      "audio_transcriptions",
      "google_sync_state",
      "google_connections",
      "google_oauth_tokens",
      "payments",
      "billing_intents",
      "subscriptions",
      "add_on_purchases",
      "usage_monthly",
      "operational_events",
      "client_settings",
      "client_preferences",
      "users",
    ]

    for (const table of clientScopedTables) {
      await deleteByClientId(admin, table, clientId)
    }

    if (authUserId) {
      const { error: authDeleteError } = await admin.auth.admin.deleteUser(authUserId)
      if (authDeleteError) {
        throw new HttpError(500, `auth_delete_failed:${authDeleteError.message}`)
      }
    }

    const { error: clientDeleteError } = await admin.from("clients").delete().eq("id", clientId)
    if (clientDeleteError) throw new HttpError(500, clientDeleteError.message)

    await appendOwnerActivity(admin, ownerClientId, {
      id: crypto.randomUUID(),
      action: "client_delete",
      clientId,
      clientName: String(currentClient.name || currentClient.email || currentClient.phone || "Cliente eliminado"),
      previousValue: `${String(currentClient.plan_code || "sin_plan")}/${String(currentClient.status || "sin_estado")}`,
      nextValue: "deleted",
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      authUserDeleted: Boolean(authUserId),
    })
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500
    const message = typeof error?.message === "string" ? error.message : "owner_client_delete_failed"
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
