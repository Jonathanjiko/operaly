import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const COUNTRY_LOCALE: Record<string, string> = {
  AR: "es",
  BO: "es",
  CL: "es",
  CO: "es",
  CR: "es",
  EC: "es",
  ES: "es",
  MX: "es",
  PA: "es",
  PE: "es",
  PY: "es",
  UY: "es",
  VE: "es",
  BR: "pt",
  PT: "pt",
  DE: "de",
  AT: "de",
  CH: "de",
  FR: "fr",
  CA: "en",
  GB: "en",
  US: "en",
}

function detectWebLocale(request: NextRequest) {
  const country = String(
    request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      ""
  ).toUpperCase()

  return {
    country,
    locale: COUNTRY_LOCALE[country] || "en",
  }
}

export async function middleware(request: NextRequest) {
  const webLocale = detectWebLocale(request)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const response = NextResponse.next({ request })
    response.cookies.set("operaly_country", webLocale.country || "OT", { path: "/", sameSite: "lax" })
    response.cookies.set("operaly_web_locale", webLocale.locale, { path: "/", sameSite: "lax" })
    return response
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.getUser()

  response.cookies.set("operaly_country", webLocale.country || "OT", { path: "/", sameSite: "lax" })
  response.cookies.set("operaly_web_locale", webLocale.locale, { path: "/", sameSite: "lax" })

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
