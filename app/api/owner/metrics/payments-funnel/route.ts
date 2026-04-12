import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const backendUrl = String(
    process.env.OPERALY_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ""
  ).replace(/\/$/, "")

  if (!backendUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_backend_url",
      },
      { status: 500 }
    )
  }

  const days = String(req.nextUrl.searchParams.get("days") || "30").trim()
  const backendKey = String(process.env.INTERNAL_WORKER_KEY || "").trim()

  if (!backendKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_internal_worker_key",
      },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `${backendUrl}/owner/metrics/payments-funnel?days=${encodeURIComponent(days)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Internal-Key": backendKey,
        },
        cache: "no-store",
      }
    )

    const contentType = response.headers.get("content-type") || ""

    const payload = contentType.includes("application/json")
      ? await response.json()
      : {
          ok: false,
          error: await response.text(),
        }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: payload?.detail || payload?.error || "metrics_fetch_failed",
        },
        { status: response.status }
      )
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "unexpected_metrics_proxy_error",
      },
      { status: 500 }
    )
  }
}
