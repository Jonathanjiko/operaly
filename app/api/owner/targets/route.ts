import { NextResponse } from "next/server"
import {
  OWNER_TARGETS_PREF_KEY,
  ownerErrorResponse,
  requireOwner,
  upsertClientPreference,
  getResolvedOwnerTargets,
} from "@/lib/owner-console-server"
import { sanitizeOwnerTargets } from "@/lib/owner-catalog"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { ownerClientId } = await requireOwner(request)
    const targets = await getResolvedOwnerTargets(ownerClientId)
    return NextResponse.json({ ok: true, targets })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    const { ownerClientId } = await requireOwner(request)
    const body = await request.json().catch(() => ({}))
    const targets = sanitizeOwnerTargets(body?.targets)
    targets.updatedAt = new Date().toISOString()

    await upsertClientPreference(
      ownerClientId,
      OWNER_TARGETS_PREF_KEY,
      JSON.stringify(targets)
    )

    return NextResponse.json({ ok: true, targets })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}
