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
    const payload = {
      client_id: clientId,
      voice_provider: "elevenlabs",
      voice_id: body?.voice_id ? String(body.voice_id) : null,
      voice_name: body?.voice_name ? String(body.voice_name) : "custom",
      voice_language: body?.voice_language ? String(body.voice_language) : "es",
      tone_style: body?.tone_style ? String(body.tone_style) : "profesional",
      call_style: body?.call_style ? String(body.call_style) : "breve",
      prefer_audio_over_call: Boolean(body?.prefer_audio_over_call ?? true),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await admin
      .from("user_voice_settings")
      .upsert(payload, { onConflict: "client_id" })
      .select("client_id,voice_provider,voice_id,voice_name,voice_language,tone_style,call_style,prefer_audio_over_call,updated_at")
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, voice: data })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "professional_voice_save_failed",
        detail: typeof error?.message === "string" ? error.message : "Unexpected voice save error.",
      },
      { status: 500 }
    )
  }
}
