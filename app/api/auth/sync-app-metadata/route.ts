import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase admin env vars not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)")
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: Request) {
  try {
    const { clientId, authUserId, preferredLanguage, webLocale, timezone } = await request.json()

    if (!clientId || !authUserId) {
      return NextResponse.json(
        { ok: false, error: "Missing clientId or authUserId" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getAdminClient()

    let existingAppMetadata: Record<string, unknown> = {}
    let existingUserMetadata: Record<string, unknown> = {}

    try {
      const { data: userResponse, error: userError } = await supabaseAdmin.auth.admin.getUserById(authUserId)
      if (userError) {
        console.warn("[sync-app-metadata] getUserById warning:", userError.message)
      } else {
        existingAppMetadata = (userResponse.user?.app_metadata || {}) as Record<string, unknown>
        existingUserMetadata = (userResponse.user?.user_metadata || {}) as Record<string, unknown>
      }
    } catch (lookupError) {
      console.warn("[sync-app-metadata] getUserById unexpected warning:", lookupError)
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        ...existingAppMetadata,
        client_id: clientId,
      },
      user_metadata: {
        ...existingUserMetadata,
        client_id: clientId,
      },
    })

    if (updateError) {
      console.error("[sync-app-metadata] updateUserById error:", updateError.message)
    }

    const { error: prefError } = await supabaseAdmin
      .from("client_preferences")
      .upsert(
        [
          {
            client_id: clientId,
            pref_key: "pending_welcome_message",
            pref_value: "true",
            source: "registration",
            updated_at: new Date().toISOString(),
          },
          ...(preferredLanguage
            ? [
                {
                  client_id: clientId,
                  pref_key: "preferred_language",
                  pref_value: String(preferredLanguage).toLowerCase(),
                  source: "registration",
                  updated_at: new Date().toISOString(),
                },
                {
                  client_id: clientId,
                  pref_key: "language_source",
                  pref_value: "registration",
                  source: "registration",
                  updated_at: new Date().toISOString(),
                },
              ]
            : []),
          ...(webLocale
            ? [
                {
                  client_id: clientId,
                  pref_key: "web_locale",
                  pref_value: String(webLocale).toLowerCase(),
                  source: "geoip_fallback",
                  updated_at: new Date().toISOString(),
                },
              ]
            : []),
          ...(timezone
            ? [
                {
                  client_id: clientId,
                  pref_key: "timezone",
                  pref_value: String(timezone),
                  source: "registration",
                  updated_at: new Date().toISOString(),
                },
              ]
            : []),
        ],
        { onConflict: "client_id,pref_key" }
      )
    if (prefError) {
      console.warn("[sync-app-metadata] preference upsert:", prefError.message)
    }

    const backendUrl = process.env.OPERALY_BACKEND_URL || process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ""
    const backendKey = process.env.INTERNAL_WORKER_KEY || process.env.BACKEND_API_KEY || ""
    if (backendUrl) {
      try {
        await fetch(`${backendUrl}/internal/send-welcome`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Key": backendKey,
          },
          body: JSON.stringify({ client_id: clientId }),
        })
      } catch {
        // Non-fatal — cron will retry pending_welcome_message
      }
    }

    return NextResponse.json({
      ok: true,
      clientId,
      appMetaSet: !updateError,
    })
  } catch (err: any) {
    console.error("[sync-app-metadata] unexpected error:", err)
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
