import { NextResponse } from "next/server"
import {
  appendOwnerActivity,
  ownerErrorResponse,
  requireOwner,
  type OwnerActivityEntry,
} from "@/lib/owner-console-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ADMIN_PLANS = new Set(["trial", "core", "pro", "pro_plus"])

export async function POST(request: Request) {
  try {
    const { admin, ownerClientId } = await requireOwner(request)
    const { clientId, planCode } = await request.json()

    const normalizedClientId = String(clientId || "").trim()
    const normalizedPlanCode = String(planCode || "").trim().toLowerCase()

    if (!normalizedClientId) {
      return NextResponse.json({ ok: false, error: "missing_client_id" }, { status: 400 })
    }
    if (!ADMIN_PLANS.has(normalizedPlanCode)) {
      return NextResponse.json({ ok: false, error: "invalid_plan_code" }, { status: 400 })
    }

    const nowIso = new Date().toISOString()

    const { data: planRow, error: planError } = await admin
      .from("plans")
      .select("id, name, code")
      .eq("code", normalizedPlanCode)
      .maybeSingle()

    if (planError) throw planError
    if (!planRow) {
      return NextResponse.json({ ok: false, error: "plan_not_found" }, { status: 400 })
    }

    const { data: currentClient, error: currentClientError } = await admin
      .from("clients")
      .select("id, name, plan_code")
      .eq("id", normalizedClientId)
      .maybeSingle()

    if (currentClientError) throw currentClientError
    if (!currentClient) {
      return NextResponse.json({ ok: false, error: "client_not_found" }, { status: 404 })
    }

    const previousPlanCode = String(currentClient.plan_code || "").trim().toLowerCase() || null

    const { error: clientError } = await admin
      .from("clients")
      .update({
        plan_code: normalizedPlanCode,
        plan_status: "active",
        updated_at: nowIso,
      })
      .eq("id", normalizedClientId)

    if (clientError) throw clientError

    const { error: userError } = await admin
      .from("users")
      .update({
        plan_type: normalizedPlanCode,
        subscription_status: "active",
        updated_at: nowIso,
      })
      .eq("client_id", normalizedClientId)

    if (userError) throw userError

    const { data: latestSubscription, error: latestSubError } = await admin
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("client_id", normalizedClientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestSubError) throw latestSubError

    const nextPeriodEnd =
      latestSubscription?.current_period_end ??
      new Date(Date.now() + (normalizedPlanCode === "trial" ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString()

    if (latestSubscription?.id) {
      const { error: subscriptionUpdateError } = await admin
        .from("subscriptions")
        .update({
          plan_id: planRow.id,
          plan_code: normalizedPlanCode,
          plan_name: planRow.name,
          status: "active",
          current_period_start: nowIso,
          current_period_end: nextPeriodEnd,
          updated_at: nowIso,
        })
        .eq("id", latestSubscription.id)

      if (subscriptionUpdateError) throw subscriptionUpdateError
    } else {
      const { error: subscriptionInsertError } = await admin.from("subscriptions").insert({
        id: crypto.randomUUID(),
        client_id: normalizedClientId,
        plan_id: planRow.id,
        plan_code: normalizedPlanCode,
        plan_name: planRow.name,
        status: "active",
        current_period_start: nowIso,
        current_period_end: nextPeriodEnd,
        provider: "owner_console",
        provider_ref: "owner_manual_change",
        started_at: nowIso,
        created_at: nowIso,
        updated_at: nowIso,
      })

      if (subscriptionInsertError) throw subscriptionInsertError
    }

    await appendOwnerActivity(ownerClientId, {
      id: crypto.randomUUID(),
      action: "plan_change",
      clientId: normalizedClientId,
      clientName: String(currentClient.name || "Cliente sin nombre"),
      previousValue: previousPlanCode,
      nextValue: normalizedPlanCode,
      createdAt: nowIso,
    } satisfies OwnerActivityEntry)

    await admin.from("operational_events").insert({
      event_type: "owner_plan_changed",
      client_id: normalizedClientId,
      payload: {
        source: "owner_dashboard",
        owner_client_id: ownerClientId,
        previous_plan_code: previousPlanCode,
        next_plan_code: normalizedPlanCode,
      },
      created_at: nowIso,
    }).select("id").maybeSingle()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return ownerErrorResponse(error)
  }
}
