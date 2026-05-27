import { NextResponse } from "next/server"
import { getResolvedOwnerCatalog, ownerErrorResponse } from "@/lib/owner-console-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const catalog = await getResolvedOwnerCatalog()
    return NextResponse.json({ ok: true, catalog })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}
