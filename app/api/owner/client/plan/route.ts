import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ADMIN_PLANS = new Set(["trial", "core", "pro", "pro_plus"])

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

export async function POST(request: Request) {
  try {
    const { admin } = await requireOwner(request)
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
      (normalizedPlanCode === "trial" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null)

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

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500
    const message = typeof error?.message === "string" ? error.message : "owner_plan_update_failed"
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
