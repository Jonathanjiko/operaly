import { NextRequest, NextResponse } from "next/server"
import { getOperalyBackendUrl } from "../../_utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const backendUrl = getOperalyBackendUrl()
  if (!backendUrl) {
    return NextResponse.json({ ok: false, error: "missing_backend_url" }, { status: 500 })
  }

  const sourceUrl = new URL(request.url)
  const backendCallbackUrl = `${backendUrl}/api/google/oauth/callback${sourceUrl.search}`

  try {
    const response = await fetch(backendCallbackUrl, {
      method: "GET",
      headers: {
        Accept: "text/html,application/json",
      },
      redirect: "manual",
      cache: "no-store",
    })

    const location = response.headers.get("location")
    if (location && response.status >= 300 && response.status < 400) {
      return NextResponse.redirect(location, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "text/plain"
    const body = await response.text()
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": contentType,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "google_callback_proxy_failed" },
      { status: 500 }
    )
  }
}

