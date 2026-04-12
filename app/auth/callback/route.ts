import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function sanitizeNext(nextValue: string | null): string {
  if (!nextValue) return "/dashboard"
  if (!nextValue.startsWith("/")) return "/dashboard"
  return nextValue
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = sanitizeNext(requestUrl.searchParams.get("next"))

  if (!code) {
    return NextResponse.redirect(new URL("/register?oauth=missing_code", requestUrl.origin))
  }

  const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin))
  const supabase = createSupabaseServerClient(request, redirectResponse)

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message)
    return NextResponse.redirect(new URL("/register?oauth=exchange_failed", requestUrl.origin))
  }

  return redirectResponse
}
