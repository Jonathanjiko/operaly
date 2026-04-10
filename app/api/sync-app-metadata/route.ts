import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * POST /api/auth/sync-app-metadata
 *
 * Escribe el client_id en app_metadata del usuario de Supabase Auth.
 * app_metadata solo puede escribirse con service_role (nunca desde el cliente).
 *
 * Body: { clientId: string, userId: string }
 *
 * SEGURIDAD:
 * - Solo acepta requests del propio usuario autenticado
 * - Valida que el userId del JWT coincida con el userId del body
 * - Usa service_role_key para escribir en app_metadata
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, userId } = body

    if (!clientId || !userId) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 })
    }

    // Verificar que el request viene de un usuario autenticado
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Crear cliente con JWT del usuario para verificar identidad
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 })
    }

    // Verificar que el userId del JWT coincide con el del body
    if (user.id !== userId) {
      return NextResponse.json({ error: "user_mismatch" }, { status: 403 })
    }

    // Usar service_role para escribir app_metadata
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        app_metadata: {
          ...((user.app_metadata as Record<string, unknown>) || {}),
          client_id: clientId,
        },
      }
    )

    if (updateError) {
      console.error("[sync-app-metadata] updateUserById error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, client_id: clientId })
  } catch (err: unknown) {
    console.error("[sync-app-metadata] unexpected error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
