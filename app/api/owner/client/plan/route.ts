import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ADMIN_PLANS = new Set(["trial", "core", "pro", "pro_plus"])
const OWNER_ACTIVITY_PREF_KEY = "owner_console_activity"

type OwnerActivityEntry = {
  id: string
  action: "plan_change" | "status_change"
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
  if (!ownerClient || String(ownerClient.plan_code || "").toLowerCase() !== "owner") {
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

export async function POST(request: Request) {
  try {
    const { admin, ownerClientId } = await requireOwner(request)
    const { clientId, planCode } = await request.json()

    const normalizedClientId = String(clientId || "").trim()
    const normalizedPlanCode = String(planCode || "").trim().toLowerCase()

    if (!normalizedClientId) throw new HttpError(400, "missing_client_id")
    if (!ADMIN_PLANS.has(normalizedPlanCode)) throw new HttpError(400, "invalid_plan_code")

    const nowIso = new Date().toISOString()

    const { data: planRow, error: planError } = await admin
      .from("plans")
      .select("id, name, code")
      .eq("code", normalizedPlanCode)
      .maybeSingle()

    if (planError) throw new HttpError(500, planError.message)
    if (!planRow) throw new HttpError(400, "plan_not_found")

    const { data: currentClient, error: currentClientError } = await admin
      .from("clients")
      .select("id, name, plan_code")
      .eq("id", normalizedClientId)
      .maybeSingle()

    if (currentClientError) throw new HttpError(500, currentClientError.message)
    if (!currentClient) throw new HttpError(404, "client_not_found")

    const previousPlanCode = String(currentClient.plan_code || "").trim().toLowerCase() || null

    const { error: clientError } = await admin
      .from("clients")
      .update({
        plan_code: normalizedPlanCode,
        plan_status: "active",
        updated_at: nowIso,
      })
      .eq("id", normalizedClientId)

    if (clientError) throw new HttpError(500, clientError.message)

    const { error: userError } = await admin
      .from("users")
      .update({
        plan_type: normalizedPlanCode,
        subscription_status: "active",
        updated_at: nowIso,
      })
      .eq("client_id", normalizedClientId)

    if (userError) throw new HttpError(500, userError.message)

    const { data: latestSubscription, error: latestSubError } = await admin
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("client_id", normalizedClientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestSubError) throw new HttpError(500, latestSubError.message)

    const nextPeriodEnd =
      latestSubscription?.current_period_end ??
      new Date(
        Date.now() +
          (normalizedPlanCode === "trial" ? 7 : 30) * 24 * 60 * 60 * 1000
      ).toISOString()

    if (latestSubscription?.id) {
      const { error: subscriptionUpdateError } = await admin
        .from("subscriptions")
        .update({
          plan_id: planRow.id,
          plan_code: normalizedPlanCode,
          plan_name: planRow.name,
          status: "active",
          current_period_start: nowIso,
          current_period_end: nextPeriodEnd,
          updated_at: nowIso,
        })
        .eq("id", latestSubscription.id)

      if (subscriptionUpdateError) throw new HttpError(500, subscriptionUpdateError.message)
    } else {
      const { error: subscriptionInsertError } = await admin
        .from("subscriptions")
        .insert({
          id: crypto.randomUUID(),
          client_id: normalizedClientId,
          plan_id: planRow.id,
          plan_code: normalizedPlanCode,
          plan_name: planRow.name,
          status: "active",
          current_period_start: nowIso,
          current_period_end: nextPeriodEnd,
          provider: "owner_console",
          provider_ref: "owner_manual_change",
          started_at: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        })

      if (subscriptionInsertError) throw new HttpError(500, subscriptionInsertError.message)
    }

    await appendOwnerActivity(admin, ownerClientId, {
      id: crypto.randomUUID(),
      action: "plan_change",
      clientId: normalizedClientId,
      clientName: String(currentClient.name || "Cliente sin nombre"),
      previousValue: previousPlanCode,
      nextValue: normalizedPlanCode,
      createdAt: nowIso,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500
    const message = typeof error?.message === "string" ? error.message : "owner_plan_update_failed"
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
