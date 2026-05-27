import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type ClientRow = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  country_code: string | null
  city: string | null
  timezone: string | null
  plan_code: string | null
  plan_status: string | null
  status: string | null
  created_at: string
  subscription_started_at: string | null
  current_period_end: string | null
  latest_payment_at: string | null
  messages_used: number
  audio_minutes_used: number
  automations_used: number
  storage_used_mb: number
  docs_count: number
  canonical_status?: string | null
  owner_dashboard_status?: string | null
  professional_dashboard_status?: string | null
  recovery_status?: string | null
  recovery_started_at?: string | null
  recovery_ends_at?: string | null
  recovery_last_message_at?: string | null
  recovery_messages_sent?: number
  converted_after_recovery?: boolean
  blocked_reason?: string | null
  gate_allowed?: boolean
}

type PaymentRow = {
  id: string
  client_id: string
  client_name: string | null
  client_phone: string | null
  country_code: string | null
  city: string | null
  plan_code: string | null
  status: string
  amount: number
  currency_code: string
  payment_method: string | null
  payment_method_brand: string | null
  order_number: string | null
  transaction_id: string | null
  created_at: string
}

type SubscriptionRow = {
  id: string
  client_id: string
  client_name: string | null
  client_phone: string | null
  country_code: string | null
  city: string | null
  plan_code: string
  status: string
  amount: number
  currency_code: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  canonical_status?: string | null
  owner_dashboard_status?: string | null
  recovery_status?: string | null
}

type RecoverySnapshot = {
  status?: string | null
  started_at?: string | null
  ends_at?: string | null
  last_message_at?: string | null
  messages_sent?: number | null
  converted_after_recovery?: boolean | null
}

type OwnerActivityEntry = {
  id: string
  action: "plan_change" | "status_change" | "client_delete"
  clientId: string
  clientName: string
  previousValue: string | null
  nextValue: string | null
  createdAt: string
}

const OWNER_ACTIVITY_PREF_KEY = "owner_console_activity"
const COMMERCIAL_RECOVERY_PREF_KEY = "commercial_recovery_state_v1"

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function getAdminClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getAnonClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getCurrentPeriodMonth() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

function isPastDate(value: string | null | undefined) {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getTime() < Date.now()
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase()
}

function deriveCommercialSnapshot(input: {
  planCode?: string | null
  rawStatus?: string | null
  planStatus?: string | null
  currentPeriodEnd?: string | null
  recovery?: RecoverySnapshot | null
}) {
  const planCode = normalizeStatus(input.planCode)
  const rawStatus = normalizeStatus(input.rawStatus)
  const planStatus = normalizeStatus(input.planStatus)
  const expired = isPastDate(input.currentPeriodEnd)
  const isTrial = planCode === "trial"
  const isPaidPlan = Boolean(planCode) && !["trial", "owner", "owner_unlimited"].includes(planCode)
  const recoveryStatus = normalizeStatus(input.recovery?.status)

  let canonicalStatus = "inactive"
  if (rawStatus === "cancelled" || planStatus === "cancelled") {
    canonicalStatus = "cancelled"
  } else if (rawStatus === "blocked") {
    canonicalStatus = "blocked"
  } else if (isTrial) {
    canonicalStatus = expired ? "trial_expired" : "trial_active"
  } else if (isPaidPlan) {
    canonicalStatus = expired ? "paid_expired" : "paid_active"
  } else if (rawStatus === "active" && !expired) {
    canonicalStatus = "paid_active"
  }

  const gateAllowed = ["trial_active", "paid_active"].includes(canonicalStatus)

  let ownerDashboardStatus = canonicalStatus
  if (canonicalStatus === "trial_expired" && recoveryStatus === "active") {
    ownerDashboardStatus = "trial_recovery_active"
  } else if (canonicalStatus === "trial_expired" && recoveryStatus === "converted") {
    ownerDashboardStatus = "converted"
  } else if (canonicalStatus === "trial_expired" && recoveryStatus === "completed_without_conversion") {
    ownerDashboardStatus = "trial_expired"
  } else if (canonicalStatus === "paid_expired") {
    ownerDashboardStatus = "expired"
  } else if (canonicalStatus === "paid_active" || canonicalStatus === "trial_active") {
    ownerDashboardStatus = "active"
  }

  const professionalDashboardStatus = gateAllowed ? "active" : "restricted"
  const blockedReason = gateAllowed
    ? null
    : canonicalStatus === "trial_expired"
      ? "trial_expired"
      : canonicalStatus === "paid_expired"
        ? "plan_expired"
        : canonicalStatus

  return {
    canonicalStatus,
    ownerDashboardStatus,
    professionalDashboardStatus,
    gateAllowed,
    blockedReason,
  }
}

function extractBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(401, "missing_bearer_token")
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    throw new HttpError(401, "missing_bearer_token")
  }

  return token
}

function resolveClientIdFromUser(user: { app_metadata?: Record<string, any>; user_metadata?: Record<string, any> }): string {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) return fromAppMeta.trim()

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) return fromUserMeta.trim()

  throw new HttpError(403, "missing_client_id")
}

async function requireOwner(request: Request) {
  const token = extractBearerToken(request)
  const anon = getAnonClient()
  const admin = getAdminClient()

  const { data: authData, error: authError } = await anon.auth.getUser(token)
  if (authError || !authData.user) {
    throw new HttpError(401, "invalid_session")
  }

  const clientId = resolveClientIdFromUser(authData.user as any)
  const { data: ownerClient, error: ownerError } = await admin
    .from("clients")
    .select("id, plan_code, status")
    .eq("id", clientId)
    .maybeSingle()

  if (ownerError) {
    throw new HttpError(500, ownerError.message)
  }

  if (
    !ownerClient ||
    !["owner", "owner_unlimited"].includes(String(ownerClient.plan_code || "").toLowerCase())
  ) {
    throw new HttpError(403, "forbidden")
  }

  return { admin, authUser: authData.user, ownerClientId: clientId }
}

async function loadUsageRows(admin: ReturnType<typeof getAdminClient>) {
  const periodMonth = getCurrentPeriodMonth()
  const legacyPeriod = periodMonth.slice(0, 7).replace("-", "")

  const runtimeRes = await admin
    .from("usage_monthly")
    .select("client_id, messages_used, audio_minutes_used, automations_used, storage_used_mb, docs_count")
    .eq("period_month", periodMonth)

  if (!runtimeRes.error) {
    return runtimeRes.data || []
  }

  const legacyRes = await admin
    .from("usage_monthly")
    .select("client_id, messages_used, audio_minutes_used, automations_used, storage_used_mb, docs_count")
    .eq("period_yyyymm", legacyPeriod)

  if (legacyRes.error) {
    throw new HttpError(500, legacyRes.error.message)
  }

  return legacyRes.data || []
}

export async function GET(request: Request) {
  try {
    const { admin, authUser, ownerClientId } = await requireOwner(request)

    const [clientsRes, paymentsRes, subscriptionsRes, usageRows, ownerActivityPrefRes] = await Promise.all([
      admin
        .from("clients")
        .select("id, name, email, phone, country_code, city, timezone, plan_code, plan_status, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      admin
        .from("payments")
        .select("id, client_id, status, amount_pen, display_amount, display_currency, amount_usd, currency, provider, provider_ref, paid_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      admin
        .from("subscriptions")
        .select("id, client_id, plan_code, status, current_period_start, current_period_end, started_at, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      loadUsageRows(admin),
      admin
        .from("client_preferences")
        .select("pref_value")
        .eq("client_id", ownerClientId)
        .eq("pref_key", OWNER_ACTIVITY_PREF_KEY)
        .maybeSingle(),
    ])

    if (clientsRes.error) throw new HttpError(500, clientsRes.error.message)
    if (paymentsRes.error) throw new HttpError(500, paymentsRes.error.message)
    if (subscriptionsRes.error) throw new HttpError(500, subscriptionsRes.error.message)

    if (ownerActivityPrefRes.error) throw new HttpError(500, ownerActivityPrefRes.error.message)

    const clientIds = ((clientsRes.data || []) as any[]).map((row) => String(row.id))
    const recoveryPrefMap = new Map<string, RecoverySnapshot>()
    if (clientIds.length > 0) {
      const recoveryPrefsRes = await admin
        .from("client_preferences")
        .select("client_id, pref_value")
        .eq("pref_key", COMMERCIAL_RECOVERY_PREF_KEY)
        .in("client_id", clientIds)

      if (recoveryPrefsRes.error) {
        throw new HttpError(500, recoveryPrefsRes.error.message)
      }

      ;((recoveryPrefsRes.data || []) as any[]).forEach((row) => {
        try {
          const parsed = JSON.parse(String(row.pref_value || "{}")) as RecoverySnapshot
          recoveryPrefMap.set(String(row.client_id), parsed || {})
        } catch {
          recoveryPrefMap.set(String(row.client_id), {})
        }
      })
    }

    const usageMap = new Map(
      ((usageRows || []) as any[]).map((row) => [
        String(row.client_id),
        {
          messages_used: Number(row.messages_used || 0),
          audio_minutes_used: Number(row.audio_minutes_used || 0),
          automations_used: Number(row.automations_used || 0),
          storage_used_mb: Number(row.storage_used_mb || 0),
          docs_count: Number(row.docs_count || 0),
        },
      ])
    )

    const latestSubscriptionByClient = new Map<string, any>()
    ;((subscriptionsRes.data || []) as any[]).forEach((row) => {
      const key = String(row.client_id)
      if (!latestSubscriptionByClient.has(key)) latestSubscriptionByClient.set(key, row)
    })

    const latestPaymentByClient = new Map<string, any>()
    ;((paymentsRes.data || []) as any[]).forEach((row) => {
      const key = String(row.client_id)
      if (!latestPaymentByClient.has(key)) latestPaymentByClient.set(key, row)
    })

    const clients: ClientRow[] = ((clientsRes.data || []) as any[]).map((row) => {
      const usage = usageMap.get(String(row.id))
      const latestSubscription = latestSubscriptionByClient.get(String(row.id))
      const latestPayment = latestPaymentByClient.get(String(row.id))
      const recovery = recoveryPrefMap.get(String(row.id)) || null
      const commercial = deriveCommercialSnapshot({
        planCode: row.plan_code,
        rawStatus: row.status,
        planStatus: row.plan_status,
        currentPeriodEnd: latestSubscription?.current_period_end ?? null,
        recovery,
      })

      return {
        id: String(row.id),
        name: row.name ?? null,
        email: row.email ?? null,
        phone: row.phone ?? null,
        country_code: row.country_code ?? null,
        city: row.city ?? null,
        timezone: row.timezone ?? null,
        plan_code: row.plan_code ?? null,
        plan_status: row.plan_status ?? null,
        status: row.status ?? null,
        created_at: row.created_at,
        subscription_started_at: latestSubscription?.current_period_start ?? latestSubscription?.started_at ?? null,
        current_period_end: latestSubscription?.current_period_end ?? null,
        latest_payment_at: latestPayment?.paid_at ?? latestPayment?.created_at ?? null,
        messages_used: usage?.messages_used ?? 0,
        audio_minutes_used: usage?.audio_minutes_used ?? 0,
        automations_used: usage?.automations_used ?? 0,
        storage_used_mb: usage?.storage_used_mb ?? 0,
        docs_count: usage?.docs_count ?? 0,
        canonical_status: commercial.canonicalStatus,
        owner_dashboard_status: commercial.ownerDashboardStatus,
        professional_dashboard_status: commercial.professionalDashboardStatus,
        recovery_status: normalizeStatus(recovery?.status) || "inactive",
        recovery_started_at: recovery?.started_at ?? null,
        recovery_ends_at: recovery?.ends_at ?? null,
        recovery_last_message_at: recovery?.last_message_at ?? null,
        recovery_messages_sent: Number(recovery?.messages_sent || 0),
        converted_after_recovery: Boolean(recovery?.converted_after_recovery),
        blocked_reason: commercial.blockedReason,
        gate_allowed: commercial.gateAllowed,
      }
    })

    const clientMap = new Map(clients.map((client) => [client.id, client]))

    const payments: PaymentRow[] = ((paymentsRes.data || []) as any[]).map((row) => {
      const client = clientMap.get(String(row.client_id))
      return {
        id: String(row.id),
        client_id: String(row.client_id),
        client_name: client?.name ?? null,
        client_phone: client?.phone ?? null,
        country_code: client?.country_code ?? null,
        city: client?.city ?? null,
        plan_code: client?.plan_code ?? null,
        status: String(row.status || ""),
        amount: Number((row.amount_pen ?? row.display_amount ?? row.amount_usd) || 0),
        currency_code: String(row.currency || row.display_currency || "PEN"),
        payment_method: row.provider ?? null,
        payment_method_brand: null,
        order_number: row.provider_ref ?? null,
        transaction_id: row.provider_ref ?? null,
        created_at: row.paid_at || row.created_at,
      }
    })

    const subscriptions: SubscriptionRow[] = ((subscriptionsRes.data || []) as any[]).map((row) => {
      const client = clientMap.get(String(row.client_id))
      const recovery = recoveryPrefMap.get(String(row.client_id)) || null
      const commercial = deriveCommercialSnapshot({
        planCode: row.plan_code || client?.plan_code,
        rawStatus: row.status || client?.status,
        planStatus: client?.plan_status,
        currentPeriodEnd: row.current_period_end ?? null,
        recovery,
      })
      return {
        id: String(row.id),
        client_id: String(row.client_id),
        client_name: client?.name ?? null,
        client_phone: client?.phone ?? null,
        country_code: client?.country_code ?? null,
        city: client?.city ?? null,
        plan_code: String(row.plan_code || ""),
        status: String(row.status || ""),
        amount: 0,
        currency_code: "PEN",
        current_period_start: row.current_period_start ?? row.started_at ?? null,
        current_period_end: row.current_period_end ?? null,
        created_at: row.created_at,
        canonical_status: commercial.canonicalStatus,
        owner_dashboard_status: commercial.ownerDashboardStatus,
        recovery_status: normalizeStatus(recovery?.status) || "inactive",
      }
    })

    let activityLog: OwnerActivityEntry[] = []
    try {
      const raw = String(ownerActivityPrefRes.data?.pref_value || "[]")
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        activityLog = parsed.slice(0, 100)
      }
    } catch {
      activityLog = []
    }

    const approvedPayments = payments.filter((payment) =>
      ["approved", "paid", "succeeded"].includes(String(payment.status || "").toLowerCase())
    )
    const pendingPayments = payments.filter(
      (payment) => String(payment.status || "").toLowerCase() === "pending"
    )
    const failedPayments = payments.filter((payment) =>
      ["failed", "declined"].includes(String(payment.status || "").toLowerCase())
    )

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now)
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    weekStart.setDate(now.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const summary = {
      total_clients: clients.length,
      active_clients: clients.filter((client) => client.owner_dashboard_status === "active").length,
      trial_clients: clients.filter((client) => String(client.plan_code || "").toLowerCase() === "trial").length,
      paid_clients: clients.filter((client) => ["core", "pro", "pro_plus"].includes(String(client.plan_code || "").toLowerCase())).length,
      pro_plus_clients: clients.filter((client) => String(client.plan_code || "").toLowerCase() === "pro_plus").length,
      payments_approved_total: approvedPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
      payments_pending_total: pendingPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
      payments_failed_total: failedPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
      payments_today_total: approvedPayments.filter((item) => new Date(item.created_at) >= todayStart).reduce((acc, item) => acc + Number(item.amount || 0), 0),
      payments_week_total: approvedPayments.filter((item) => new Date(item.created_at) >= weekStart).reduce((acc, item) => acc + Number(item.amount || 0), 0),
      payments_month_total: approvedPayments.filter((item) => new Date(item.created_at) >= monthStart).reduce((acc, item) => acc + Number(item.amount || 0), 0),
      subscriptions_active: subscriptions.filter((item) => item.owner_dashboard_status === "active").length,
      subscriptions_pending: subscriptions.filter((item) => String(item.status || "").toLowerCase() === "pending").length,
      subscriptions_cancelled: subscriptions.filter((item) => String(item.status || "").toLowerCase() === "cancelled").length,
    }

    return NextResponse.json({
      ok: true,
      ownerProfile: {
        fullName: String((authUser.user_metadata as any)?.full_name || "Operaly Owner"),
        email: String(authUser.email || ""),
      },
      summary,
      payments,
      subscriptions,
      clients,
      activityLog,
    })
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500
    const message = typeof error?.message === "string" ? error.message : "owner_dashboard_failed"
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
