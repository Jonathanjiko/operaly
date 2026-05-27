import { NextResponse } from "next/server"
import {
  appendOwnerActivity,
  ownerErrorResponse,
  requireOwner,
  type OwnerActivityEntry,
} from "@/lib/owner-console-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ALLOWED_STATUSES = new Set(["active", "blocked", "inactive"])

export async function POST(request: Request) {
  try {
    const { admin, ownerClientId } = await requireOwner(request)
    const { clientId, status } = await request.json()

    const normalizedClientId = String(clientId || "").trim()
    const normalizedStatus = String(status || "").trim().toLowerCase()

    if (!normalizedClientId) {
      return NextResponse.json({ ok: false, error: "missing_client_id" }, { status: 400 })
    }
    if (!ALLOWED_STATUSES.has(normalizedStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 })
    }

    const { data: currentClient, error: currentClientError } = await admin
      .from("clients")
      .select("id, name, status")
      .eq("id", normalizedClientId)
      .maybeSingle()

    if (currentClientError) throw currentClientError
    if (!currentClient) {
      return NextResponse.json({ ok: false, error: "client_not_found" }, { status: 404 })
    }

    const previousStatus = String(currentClient.status || "").trim().toLowerCase() || null

    const { error } = await admin
      .from("clients")
      .update({
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", normalizedClientId)

    if (error) throw error

    const nowIso = new Date().toISOString()

    await appendOwnerActivity(ownerClientId, {
      id: crypto.randomUUID(),
      action: "status_change",
      clientId: normalizedClientId,
      clientName: String(currentClient.name || "Cliente sin nombre"),
      previousValue: previousStatus,
      nextValue: normalizedStatus,
      createdAt: nowIso,
    } satisfies OwnerActivityEntry)

    await admin
      .from("operational_events")
      .insert({
        event_type: "owner_status_changed",
        client_id: normalizedClientId,
        payload: {
          source: "owner_dashboard",
          owner_client_id: ownerClientId,
          previous_status: previousStatus,
          next_status: normalizedStatus,
        },
        created_at: nowIso,
      })
      .select("id")
      .maybeSingle()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}
