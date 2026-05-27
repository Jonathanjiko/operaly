import { NextResponse } from "next/server"
import {
  OWNER_CATALOG_PREF_KEY,
  ownerErrorResponse,
  requireOwner,
  upsertClientPreference,
  getResolvedOwnerCatalog,
} from "@/lib/owner-console-server"
import { sanitizeOwnerCatalog } from "@/lib/owner-catalog"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { ownerClientId } = await requireOwner(request)
    const catalog = await getResolvedOwnerCatalog(ownerClientId)
    return NextResponse.json({ ok: true, catalog })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    const { ownerClientId } = await requireOwner(request)
    const body = await request.json().catch(() => ({}))
    const catalog = sanitizeOwnerCatalog(body?.catalog)
    catalog.updatedAt = new Date().toISOString()

    await upsertClientPreference(
      ownerClientId,
      OWNER_CATALOG_PREF_KEY,
      JSON.stringify(catalog)
    )

    return NextResponse.json({ ok: true, catalog })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}
