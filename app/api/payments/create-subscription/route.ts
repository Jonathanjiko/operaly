import { NextRequest, NextResponse } from "next/server"

type PaymentProvider = "mercadopago" | "stripe"

type CheckoutRequestBody = {
  clientId?: string
  planCode?: string
  provider?: PaymentProvider
}

export async function POST(req: NextRequest) {
  let body: CheckoutRequestBody

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_json",
      },
      { status: 400 }
    )
  }

  const clientId = String(body.clientId || "").trim()
  const planCode = String(body.planCode || "").trim().toLowerCase()
  const provider = (String(body.provider || "mercadopago").trim().toLowerCase() ||
    "mercadopago") as PaymentProvider

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_client_id",
      },
      { status: 400 }
    )
  }

  if (!planCode) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_plan_code",
      },
      { status: 400 }
    )
  }

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

  try {
    const response = await fetch(`${backendUrl}/billing/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        item_code: planCode,
        provider,
      }),
      cache: "no-store",
    })

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
          error: payload?.detail || payload?.error || "checkout_failed",
          detail: payload?.detail || payload?.error || "checkout_failed",
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        provider: payload?.provider || provider,
        mode: payload?.mode || null,
        checkout_url: payload?.checkout_url || null,
        init_point: payload?.init_point || null,
        subscription_id: payload?.subscription_id || null,
        preapproval_plan_id: payload?.preapproval_plan_id || null,
        order_id: payload?.order_id || null,
        payment_url: payload?.payment_url || null,
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "unexpected_checkout_proxy_error",
      },
      { status: 500 }
    )
  }
}
