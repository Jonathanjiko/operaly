import { NextResponse } from "next/server"
import { getOperalyBackendUrl, getSessionBearerToken, readBackendPayload } from "../../_utils"

export const dynamic = "force-dynamic"

const GOOGLE_PRODUCTS = new Set(["calendar", "drive", "gmail", "contacts"])

async function resolveProduct(context: any) {
  const params = await context?.params
  const product = String(params?.product || "").toLowerCase()
  return GOOGLE_PRODUCTS.has(product) ? product : null
}

export async function GET(_request: Request, context: any) {
  const product = await resolveProduct(context)
  if (!product) {
    return NextResponse.json({ ok: false, error: "invalid_google_product" }, { status: 400 })
  }

  const backendUrl = getOperalyBackendUrl()
  if (!backendUrl) {
    return NextResponse.json({ ok: false, error: "missing_backend_url" }, { status: 500 })
  }

  const { error, token } = await getSessionBearerToken()
  if (error) return error

  try {
    const response = await fetch(`${backendUrl}/api/google/${product}/connect`, {
      method: "GET",
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
      { ok: false, error: err?.message || "google_connect_proxy_failed" },
      { status: 500 }
    )
  }
}
