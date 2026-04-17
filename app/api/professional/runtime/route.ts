import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function getClientKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ""
  )
}

function getAdminClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getAnonClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getClientKey() || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function readBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) return ""
  return authHeader.slice(7).trim()
}

function resolveClientIdFromUser(user: {
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) return fromAppMeta.trim()

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) return fromUserMeta.trim()

  return ""
}

function normalizePrefMap(rows: Array<Record<string, any>> = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = String(row.pref_key || "").trim()
    if (!key) return acc
    acc[key] = String(row.pref_value || "")
    return acc
  }, {})
}

export async function GET(request: Request) {
  try {
    const token = readBearerToken(request)
    if (!token) {
      return NextResponse.json({ ok: false, error: "missing_bearer_token" }, { status: 401 })
    }

    const anon = getAnonClient()
    const admin = getAdminClient()

    const { data: authData, error: authError } = await anon.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 })
    }

    const clientId = resolveClientIdFromUser(authData.user as any)
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "missing_client_id" }, { status: 403 })
    }

    const [
      clientResp,
      voiceResp,
      prefsResp,
      welcomeResp,
      contextResp,
      eventsResp,
      understandingResp,
    ] = await Promise.all([
      admin
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle(),
      admin
        .from("user_voice_settings")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle(),
      admin
        .from("client_preferences")
        .select("pref_key, pref_value, updated_at")
        .eq("client_id", clientId)
        .in("pref_key", [
          "preferred_language",
          "language_source",
          "assistant_tone",
          "assistant_style",
          "assistant_profession",
          "assistant_context",
          "welcome_initial_status",
          "welcome_initial_sent_at",
          "pending_welcome_message",
        ]),
      admin
        .from("scheduled_messages")
        .select("*")
        .eq("client_id", clientId)
        .eq("message_kind", "welcome_initial")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("operational_context_states")
        .select("*")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("operational_events")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(6),
      admin
        .from("operational_understanding_runs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(3),
    ])

    const preferences = normalizePrefMap((prefsResp.data || []) as Array<Record<string, any>>)

    return NextResponse.json({
      ok: true,
      clientId,
      client: clientResp.data || null,
      voice: voiceResp.data || null,
      preferences,
      welcome: welcomeResp.data || null,
      contextState: contextResp.data || null,
      recentEvents: eventsResp.data || [],
      recentUnderstandingRuns: understandingResp.data || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "professional_runtime_failed",
        detail: typeof error?.message === "string" ? error.message : "Unexpected runtime dashboard error.",
      },
      { status: 500 }
    )
  }
}
