import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ""
const BACKEND_KEY = process.env.BACKEND_API_KEY || ""

export async function POST(request: Request) {
  try {
    const { clientId, authUserId } = await request.json()
    if (!clientId || !authUserId)
      return NextResponse.json({ ok: false, error: "Missing clientId or authUserId" }, { status: 400 })

    // 1. Write client_id to app_metadata via Admin API (cannot be done from client SDK)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      app_metadata: { client_id: clientId },
    })
    if (updateError) console.error("[sync-app-metadata] updateUserById:", updateError.message)

    // 2. Ensure welcome message preference is set
    await supabaseAdmin.from("client_preferences").upsert({
      client_id:  clientId,
      pref_key:   "pending_welcome_message",
      pref_value: "true",
      source:     "registration",
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id,pref_key" })

    // 3. Notify backend to send WhatsApp welcome message immediately
    if (BACKEND_URL) {
      try {
        await fetch(`${BACKEND_URL}/internal/send-welcome`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", "X-Internal-Key": BACKEND_KEY },
          body:    JSON.stringify({ client_id: clientId }),
        })
      } catch { /* cron will pick it up */ }
    }

    return NextResponse.json({ ok: true, clientId, appMetaSet: !updateError })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
