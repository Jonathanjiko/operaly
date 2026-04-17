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

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}))
    const now = new Date().toISOString()

    const clientUpdate = {
      profession_code: body?.profession_code ? String(body.profession_code) : null,
      preferred_name: body?.preferred_name ? String(body.preferred_name).trim() : null,
      treatment: body?.treatment ? String(body.treatment) : null,
      preferred_style: body?.style ? String(body.style) : null,
      updated_at: now,
    }

    const { error: clientError } = await admin.from("clients").update(clientUpdate).eq("id", clientId)
    if (clientError) {
      return NextResponse.json({ ok: false, error: clientError.message }, { status: 400 })
    }

    const prefRows = [
      { client_id: clientId, pref_key: "assistant_tone", pref_value: String(body?.tone || "profesional"), source: "dashboard_api", updated_at: now },
      { client_id: clientId, pref_key: "assistant_context", pref_value: String(body?.assistant_context || ""), source: "dashboard_api", updated_at: now },
      { client_id: clientId, pref_key: "assistant_profession", pref_value: String(body?.profession_code || "consultor"), source: "dashboard_api", updated_at: now },
      { client_id: clientId, pref_key: "assistant_style", pref_value: String(body?.style || "balanceado"), source: "dashboard_api", updated_at: now },
    ]

    const { error: prefError } = await admin
      .from("client_preferences")
      .upsert(prefRows, { onConflict: "client_id,pref_key" })

    if (prefError) {
      return NextResponse.json({ ok: false, error: prefError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "professional_assistant_save_failed",
        detail: typeof error?.message === "string" ? error.message : "Unexpected assistant save error.",
      },
      { status: 500 }
    )
  }
}
