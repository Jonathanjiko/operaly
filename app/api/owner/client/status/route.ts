import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ALLOWED_STATUSES = new Set(["active", "blocked", "inactive"])

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
    const { clientId, status } = await request.json()

    const normalizedClientId = String(clientId || "").trim()
    const normalizedStatus = String(status || "").trim().toLowerCase()

    if (!normalizedClientId) throw new HttpError(400, "missing_client_id")
    if (!ALLOWED_STATUSES.has(normalizedStatus)) throw new HttpError(400, "invalid_status")

    const { error } = await admin
      .from("clients")
      .update({
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", normalizedClientId)

    if (error) throw new HttpError(500, error.message)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500
    const message = typeof error?.message === "string" ? error.message : "owner_status_update_failed"
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
