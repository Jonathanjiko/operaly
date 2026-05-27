import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export function getOperalyBackendUrl() {
  return String(
    process.env.OPERALY_BACKEND_URL || process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ""
  ).replace(/\/$/, "")
}

export async function getSessionBearerToken() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    return {
      error: NextResponse.json(
        { ok: false, error: "session_lookup_failed", detail: error.message },
        { status: 401 }
      ),
      token: "",
    }
  }

  const token = String(session?.access_token || "").trim()
  if (!token) {
    return {
      error: NextResponse.json({ ok: false, error: "missing_session" }, { status: 401 }),
      token: "",
    }
  }

  return { error: null, token }
}

export async function readBackendPayload(response: Response) {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return response.json()
  }

  return {
    ok: response.ok,
    detail: await response.text(),
  }
}

