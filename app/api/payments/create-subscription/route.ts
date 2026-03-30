import { NextRequest, NextResponse } from "next/server"

type PaymentProvider = "izipay" | "mercadopago" | "stripe"
type CheckoutMode = "redirect" | "embed"

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
  const provider = (String(body.provider || "izipay").trim().toLowerCase() ||
    "izipay") as PaymentProvider

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

  const backendUrl = String(process.env.OPERALY_BACKEND_URL || "").replace(/\/$/, "")

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
        },
        { status: response.status }
      )
    }

    const formToken = payload?.formToken || null
    const paymentUrl = payload?.payment_url || null

    const mode: CheckoutMode = formToken ? "embed" : "redirect"

    return NextResponse.json(
      {
        ok: true,
        provider,
        mode,
        checkout_url: paymentUrl,
        embed_token: formToken,
        public_key: payload?.publicKey || null,
        order_id: payload?.order_id || null,
        deferred: Boolean(payload?.deferred),

        // compatibilidad temporal con tu frontend actual
        payment_url: paymentUrl,
        formToken,
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
