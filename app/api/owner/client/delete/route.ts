import { NextResponse } from "next/server"
import {
  appendOwnerActivity,
  ownerErrorResponse,
  requireOwner,
  type OwnerActivityEntry,
} from "@/lib/owner-console-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const CLIENT_SCOPED_TABLES = [
  "add_on_purchases",
  "cases",
  "client_preferences",
  "contacts",
  "documents",
  "notifications",
  "payments",
  "private_vault_items",
  "recurring_tasks",
  "subscriptions",
  "tasks",
  "usage_monthly",
  "users",
] as const

async function deleteByClientId(admin: any, table: (typeof CLIENT_SCOPED_TABLES)[number], clientId: string) {
  const { error, count } = await admin
    .from(table)
    .delete({ count: "exact" })
    .eq("client_id", clientId)

  if (error) {
    throw new Error(`${table}: ${error.message}`)
  }

  return Number(count || 0)
}

async function deleteAuthUsers(admin: any, clientId: string, email: string | null) {
  const deletedUserIds: string[] = []

  try {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) {
      throw error
    }

    const candidates = (data?.users || []).filter((user: any) => {
      const appClientId = String(user?.app_metadata?.client_id || "").trim()
      const metaClientId = String(user?.user_metadata?.client_id || "").trim()
      const normalizedEmail = String(user?.email || "").trim().toLowerCase()
      return (
        appClientId === clientId ||
        metaClientId === clientId ||
        (email ? normalizedEmail === email.toLowerCase() : false)
      )
    })

    for (const user of candidates) {
      const userId = String(user?.id || "")
      if (!userId) continue
      const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
      if (!deleteError) {
        deletedUserIds.push(userId)
      }
    }
  } catch {
    return []
  }

  return deletedUserIds
}

export async function POST(request: Request) {
  try {
    const { admin, ownerClientId } = await requireOwner(request)
    const body = await request.json()
    const clientId = String(body?.clientId || "").trim()
    const email = body?.email ? String(body.email).trim() : null
    const phone = body?.phone ? String(body.phone).trim() : null

    if (!clientId) {
      return NextResponse.json({ ok: false, error: "missing_client_id" }, { status: 400 })
    }

    if (clientId === ownerClientId) {
      return NextResponse.json(
        { ok: false, error: "owner_self_delete_blocked", detail: "No puedes eliminar tu propia cuenta owner." },
        { status: 400 }
      )
    }

    const { data: currentClient, error: currentClientError } = await admin
      .from("clients")
      .select("id, name, email, phone, plan_code")
      .eq("id", clientId)
      .maybeSingle()

    if (currentClientError) throw currentClientError
    if (!currentClient) {
      return NextResponse.json({ ok: false, error: "client_not_found" }, { status: 404 })
    }

    const targetPlan = String(currentClient.plan_code || "").toLowerCase()
    if (["owner", "owner_unlimited"].includes(targetPlan)) {
      return NextResponse.json(
        {
          ok: false,
          error: "owner_delete_forbidden",
          detail: "No puedes eliminar una cuenta owner desde este flujo.",
        },
        { status: 403 }
      )
    }

    const deleted: Record<string, number> = {}
    for (const table of CLIENT_SCOPED_TABLES) {
      deleted[table] = await deleteByClientId(admin, table, clientId)
    }

    const { error: clientDeleteError, count: clientsDeleted } = await admin
      .from("clients")
      .delete({ count: "exact" })
      .eq("id", clientId)
    if (clientDeleteError) {
      throw clientDeleteError
    }
    deleted.clients = Number(clientsDeleted || 0)

    const authDeleted = await deleteAuthUsers(
      admin,
      clientId,
      email || (currentClient.email ? String(currentClient.email) : null)
    )
    const nowIso = new Date().toISOString()

    await appendOwnerActivity(ownerClientId, {
      id: crypto.randomUUID(),
      action: "client_delete",
      clientId: clientId,
      clientName: String(currentClient.name || currentClient.email || currentClient.phone || "Cliente sin nombre"),
      previousValue: targetPlan || null,
      nextValue: "deleted",
      createdAt: nowIso,
    } satisfies OwnerActivityEntry)

    await admin
      .from("operational_events")
      .insert({
        event_type: "owner_client_deleted",
        client_id: ownerClientId,
        payload: {
          source: "owner_dashboard",
          owner_client_id: ownerClientId,
          deleted_client_id: clientId,
          deleted_client_email: email || currentClient.email || null,
          deleted_client_phone: phone || currentClient.phone || null,
          deleted_tables: deleted,
          deleted_auth_user_ids: authDeleted,
        },
        created_at: nowIso,
      })
      .select("id")
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      deleted,
      authDeletedCount: authDeleted.length,
    })
  } catch (error: any) {
    return ownerErrorResponse(error)
  }
}
