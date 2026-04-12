import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use dynamic config so Next.js doesn't try to evaluate at build time
export const dynamic = "force-dynamic"
export const runtime  = "nodejs"

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
    const { clientId, authUserId } = await request.json()

    if (!clientId || !authUserId) {
      return NextResponse.json(
        { ok: false, error: "Missing clientId or authUserId" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getAdminClient()

    // 1. Write client_id to app_metadata via Admin API
    // (cannot be done from the browser/client SDK — needs service role)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      { app_metadata: { client_id: clientId } }
    )
    if (updateError) {
      console.error("[sync-app-metadata] updateUserById error:", updateError.message)
    }

    // 2. Mark welcome message as pending (belt-and-suspenders alongside DB trigger)
    const { error: prefError } = await supabaseAdmin
      .from("client_preferences")
      .upsert(
        {
          client_id:  clientId,
          pref_key:   "pending_welcome_message",
          pref_value: "true",
          source:     "registration",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,pref_key" }
      )
    if (prefError) {
      console.warn("[sync-app-metadata] preference upsert:", prefError.message)
    }

    // 3. Notify backend to send WhatsApp welcome message immediately
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ""
    const backendKey = process.env.BACKEND_API_KEY || process.env.INTERNAL_WORKER_KEY || ""
    if (backendUrl) {
      try {
        await fetch(`${backendUrl}/internal/send-welcome`, {
          method:  "POST",
          headers: {
            "Content-Type":   "application/json",
            "X-Internal-Key": backendKey,
          },
          body: JSON.stringify({ client_id: clientId }),
        })
      } catch {
        // Non-fatal — cron will retry pending_welcome_message
      }
    }

    return NextResponse.json({
      ok:         true,
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
