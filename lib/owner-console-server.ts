import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import {
  getDefaultOwnerCatalog,
  getDefaultOwnerTargets,
  sanitizeOwnerCatalog,
  sanitizeOwnerTargets,
} from "@/lib/owner-catalog"

export const OWNER_ACTIVITY_PREF_KEY = "owner_console_activity"
export const OWNER_CATALOG_PREF_KEY = "owner_console_catalog"
export const OWNER_TARGETS_PREF_KEY = "owner_console_targets"

export class OwnerHttpError extends Error {
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

export function getAdminClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getAnonClient() {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

function extractBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    throw new OwnerHttpError(401, "missing_bearer_token")
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    throw new OwnerHttpError(401, "missing_bearer_token")
  }

  return token
}

function resolveClientIdFromUser(user: {
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) return fromAppMeta.trim()

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) return fromUserMeta.trim()

  throw new OwnerHttpError(403, "missing_client_id")
}

export async function requireOwner(request: Request) {
  const token = extractBearerToken(request)
  const anon = getAnonClient()
  const admin = getAdminClient()

  const { data: authData, error: authError } = await anon.auth.getUser(token)
  if (authError || !authData.user) {
    throw new OwnerHttpError(401, "invalid_session")
  }

  const clientId = resolveClientIdFromUser(authData.user as any)
  const { data: ownerClient, error: ownerError } = await admin
    .from("clients")
    .select("id, plan_code")
    .eq("id", clientId)
    .maybeSingle()

  if (ownerError) {
    throw new OwnerHttpError(500, ownerError.message)
  }

  if (
    !ownerClient ||
    !["owner", "owner_unlimited"].includes(String(ownerClient.plan_code || "").toLowerCase())
  ) {
    throw new OwnerHttpError(403, "forbidden")
  }

  return { admin, authUser: authData.user, ownerClientId: clientId }
}

export async function getPrimaryOwnerClientId() {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("clients")
    .select("id, created_at, plan_code")
    .in("plan_code", ["owner", "owner_unlimited"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new OwnerHttpError(500, error.message)
  }

  if (!data?.id) {
    throw new OwnerHttpError(404, "owner_not_found")
  }

  return String(data.id)
}

export async function readClientPreference(clientId: string, prefKey: string) {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("client_preferences")
    .select("pref_value")
    .eq("client_id", clientId)
    .eq("pref_key", prefKey)
    .maybeSingle()

  if (error) {
    throw new OwnerHttpError(500, error.message)
  }

  return String(data?.pref_value || "")
}

export async function upsertClientPreference(clientId: string, prefKey: string, prefValue: string) {
  const admin = getAdminClient()
  const { error } = await admin.from("client_preferences").upsert(
    {
      client_id: clientId,
      pref_key: prefKey,
      pref_value: prefValue,
      source: "owner-dashboard",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "client_id,pref_key",
    }
  )

  if (error) {
    throw new OwnerHttpError(500, error.message)
  }
}

export async function getResolvedOwnerCatalog(clientId?: string) {
  const targetClientId = clientId || (await getPrimaryOwnerClientId())
  const raw = await readClientPreference(targetClientId, OWNER_CATALOG_PREF_KEY)
  if (!raw) {
    return getDefaultOwnerCatalog()
  }

  try {
    return sanitizeOwnerCatalog(JSON.parse(raw))
  } catch {
    return getDefaultOwnerCatalog()
  }
}

export async function getResolvedOwnerTargets(clientId?: string) {
  const targetClientId = clientId || (await getPrimaryOwnerClientId())
  const raw = await readClientPreference(targetClientId, OWNER_TARGETS_PREF_KEY)
  if (!raw) {
    return getDefaultOwnerTargets()
  }

  try {
    return sanitizeOwnerTargets(JSON.parse(raw))
  } catch {
    return getDefaultOwnerTargets()
  }
}

export function ownerErrorResponse(error: unknown) {
  const status = typeof (error as any)?.status === "number" ? (error as any).status : 500
  const message =
    typeof (error as any)?.message === "string" ? (error as any).message : "owner_request_failed"
  return NextResponse.json({ ok: false, error: message }, { status })
}
