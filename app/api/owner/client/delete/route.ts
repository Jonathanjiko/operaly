import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getBackendUrl() {
  return String(
    process.env.OPERALY_BACKEND_URL || process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ""
  ).replace(/\/$/, "")
}

function readBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return ""
  }

  return authHeader.slice(7).trim()
}

async function readBackendPayload(response: Response) {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return response.json()
  }

  return {
    ok: response.ok,
    detail: await response.text(),
  }
}

export async function POST(request: Request) {
  try {
    const backendUrl = getBackendUrl()
    if (!backendUrl) {
      return NextResponse.json(
        { ok: false, error: "backend_not_configured", detail: "OPERALY_BACKEND_URL is not configured." },
        { status: 503 }
      )
    }

    const token = readBearerToken(request)
    if (!token) {
      return NextResponse.json({ ok: false, error: "missing_bearer_token" }, { status: 401 })
    }

    const body = await request.json()
    const response = await fetch(`${backendUrl}/owner/clients/hard-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        client_id: body?.clientId || null,
        phone: body?.phone || null,
        email: body?.email || null,
        email_base: body?.emailBase || null,
      }),
      cache: "no-store",
    })

    const payload = await readBackendPayload(response)
    return NextResponse.json(payload, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "owner_client_delete_failed",
        detail: typeof error?.message === "string" ? error.message : "Unexpected owner delete proxy error.",
      },
      { status: 500 }
    )
  }
}
