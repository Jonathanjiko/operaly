import { NextResponse } from "next/server"
import { getOperalyBackendUrl, getSessionBearerToken, readBackendPayload } from "../../_utils"

export const dynamic = "force-dynamic"

export async function POST() {
  const backendUrl = getOperalyBackendUrl()
  if (!backendUrl) {
    return NextResponse.json({ ok: false, error: "missing_backend_url" }, { status: 500 })
  }

  const { error, token } = await getSessionBearerToken()
  if (error) return error

  try {
    const response = await fetch(`${backendUrl}/api/google/calendar/validate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
    const payload = await readBackendPayload(response)
    return NextResponse.json(payload, { status: response.status })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "google_validate_proxy_failed" },
      { status: 500 }
    )
  }
}

