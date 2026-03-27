import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing authorization header",
      },
      { status: 401 }
    )
  }

  const backendUrl = (process.env.OPERALY_BACKEND_URL || "").replace(/\/$/, "")

  if (!backendUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "OPERALY_BACKEND_URL is not configured",
      },
      { status: 500 }
    )
  }

  const { id } = await context.params

  try {
    const response = await fetch(`${backendUrl}/api/documents/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const contentType = response.headers.get("content-type") || ""

    const payload = contentType.includes("application/json")
      ? await response.json()
      : {
          ok: false,
          error: await response.text(),
        }

    return NextResponse.json(payload, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Unexpected proxy error",
      },
      { status: 500 }
    )
  }
}
