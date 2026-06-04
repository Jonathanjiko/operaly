import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getDisplayPlanName } from "@/lib/plans"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function getClientKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ""
  )
}

function getAdminClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getAnonClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getClientKey() || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function readBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) return ""
  return authHeader.slice(7).trim()
}

function resolveClientIdFromUser(user: {
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) return fromAppMeta.trim()

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) return fromUserMeta.trim()

  return ""
}

const PLAN_LIMIT_FALLBACK: Record<string, { messages: number; calls: number }> = {
  trial: { messages: 250, calls: 5 },
  core: { messages: 1200, calls: 10 },
  pro: { messages: 3000, calls: 20 },
  pro_plus: { messages: 8000, calls: 180 },
}

function normalizeStatus(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

function isConnectedGoogleStatus(value: unknown) {
  return ["connected", "ok", "active", "synced"].includes(normalizeStatus(value))
}

function isSuccessfulWelcomeStatus(value: unknown) {
  return ["sent", "delivered", "success", "completed"].includes(normalizeStatus(value))
}

function isPendingWelcomeStatus(value: unknown) {
  return ["pending", "queued", "processing", "requested"].includes(normalizeStatus(value))
}

function getCurrentPeriods() {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const legacy = month.replace("-", "")
  return { month, legacy }
}

function derivePlanStatus(planCode: string, subscriptionStatus: string, currentPeriodEnd: string | null) {
  const normalizedSubscription = normalizeStatus(subscriptionStatus)
  const now = Date.now()
  const endAt = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() : null
  const expiredByDate = Boolean(endAt && Number.isFinite(endAt) && endAt < now)

  if (["pending_payment", "pending-payment", "pending payment"].includes(normalizedSubscription)) return "pending_payment"
  if (["past_due", "past-due", "past due", "failed"].includes(normalizedSubscription)) return "past_due"
  if (normalizedSubscription === "cancelled" || normalizedSubscription === "canceled") return "canceled"
  if (normalizedSubscription === "expired") return planCode === "trial" ? "expired_trial" : "expired"
  if (expiredByDate) return planCode === "trial" ? "expired_trial" : "expired"
  if (normalizedSubscription === "trialing" || normalizedSubscription === "trial") return "trialing"
  if (normalizedSubscription === "active" || normalizedSubscription === "paid") return "active"
  if (planCode === "trial" && !normalizedSubscription) return "trialing"
  return "active"
}

export async function GET(request: Request) {
  try {
    const token = readBearerToken(request)
    if (!token) {
      return NextResponse.json({ ok: false, error: "missing_bearer_token" }, { status: 401 })
    }

    const anon = getAnonClient()
    const admin = getAdminClient()

    const { data: authData, error: authError } = await anon.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 })
    }

    const clientId = resolveClientIdFromUser(authData.user as any)
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "missing_client_id" }, { status: 403 })
    }

    const { month, legacy } = getCurrentPeriods()

    const [clientResp, subscriptionResp, usageResp, googleResp, prefsResp, welcomeResp, paymentResp] = await Promise.all([
      admin
        .from("clients")
        .select("id, plan_code, plan_status, phone, phone_normalized, phone_verification_status")
        .eq("id", clientId)
        .maybeSingle(),
      admin
        .from("subscriptions")
        .select("id, plan_code, status, current_period_end, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("usage_monthly")
        .select("client_id, period_month, period_yyyymm, messages_used, audio_minutes_used")
        .eq("client_id", clientId)
        .or(`period_month.eq.${month},period_yyyymm.eq.${legacy}`)
        .limit(1)
        .maybeSingle(),
      admin
        .from("google_connections")
        .select("connection_status, status, granted_scopes, scopes, authorized_products, updated_at")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("client_preferences")
        .select("pref_key, pref_value")
        .eq("client_id", clientId)
        .in("pref_key", ["welcome_initial_status", "welcome_initial_sent_at", "pending_welcome_message"]),
      admin
        .from("scheduled_messages")
        .select("status, message_status, delivery_status, sent_at, updated_at")
        .eq("client_id", clientId)
        .eq("message_kind", "welcome_initial")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("payments")
        .select("status, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (clientResp.error) {
      return NextResponse.json({ ok: false, error: clientResp.error.message }, { status: 400 })
    }

    const client = clientResp.data || null
    const subscription = subscriptionResp.data || null
    const googleConnection = googleResp.data || null

    const planCode = String(subscription?.plan_code || client?.plan_code || "trial").trim().toLowerCase()
    const planStatus = derivePlanStatus(planCode, String(subscription?.status || client?.plan_status || ""), subscription?.current_period_end || null)
    const gateAllowed = ["active", "trialing"].includes(planStatus)

    let messagesLimit = PLAN_LIMIT_FALLBACK[planCode]?.messages ?? 0
    let callsLimit = PLAN_LIMIT_FALLBACK[planCode]?.calls ?? 0

    const planConfigResp = await admin.from("plan_configs").select("*").limit(20)
    const matchedPlanConfig = (planConfigResp.data || []).find((row: any) => {
      const rowCode = String(row?.plan_code || row?.code || "").trim().toLowerCase()
      return rowCode === planCode
    })

    if (!planConfigResp.error && matchedPlanConfig) {
      messagesLimit = Number(matchedPlanConfig.ia_messages_limit ?? messagesLimit) || messagesLimit
      callsLimit = Number(matchedPlanConfig.calls_minutes ?? callsLimit) || callsLimit
    }

    const scopes = Array.isArray(googleConnection?.granted_scopes)
      ? googleConnection.granted_scopes
      : Array.isArray(googleConnection?.scopes)
        ? googleConnection.scopes
        : []

    const authorizedProducts = Array.isArray(googleConnection?.authorized_products)
      ? googleConnection.authorized_products
      : []

    const connectionStatus = String(googleConnection?.connection_status || googleConnection?.status || "")
    const googleConnected = isConnectedGoogleStatus(connectionStatus)
    const normalizedPhone = String(client?.phone_normalized || "").trim() || null
    const rawPhone = String(client?.phone || "").trim() || null
    const phoneVerificationStatus = normalizeStatus(client?.phone_verification_status || "pending")
    const preferenceMap = ((prefsResp.data || []) as Array<{ pref_key?: string; pref_value?: string }>).reduce<Record<string, string>>(
      (acc, row) => {
        const key = String(row.pref_key || "").trim()
        if (!key) return acc
        acc[key] = String(row.pref_value || "")
        return acc
      },
      {},
    )
    const latestWelcomeStatus =
      String(
        welcomeResp.data?.delivery_status ||
          welcomeResp.data?.message_status ||
          welcomeResp.data?.status ||
          preferenceMap.welcome_initial_status ||
          "",
      ).trim() || null
    const welcomeSent =
      isSuccessfulWelcomeStatus(latestWelcomeStatus) ||
      Boolean(preferenceMap.welcome_initial_sent_at)
    const pendingWelcome =
      isPendingWelcomeStatus(latestWelcomeStatus) ||
      normalizeStatus(preferenceMap.pending_welcome_message) === "true"
    const activationStatus = !normalizedPhone && !rawPhone
      ? "missing_phone"
      : !gateAllowed
        ? "awaiting_plan"
        : welcomeSent || ["verified", "active", "connected"].includes(phoneVerificationStatus)
          ? "active"
          : ["failed", "rejected", "invalid"].includes(phoneVerificationStatus)
            ? "attention"
            : pendingWelcome || ["pending", "requested", "sent"].includes(phoneVerificationStatus)
              ? "pending"
              : "pending"
    const paymentStatus = String(
      paymentResp.data?.status ||
        (planStatus === "pending_payment"
          ? "pending_payment"
          : planStatus === "past_due"
            ? "failed"
            : planStatus === "canceled"
              ? "canceled"
              : planStatus),
    ).trim()
    const checkoutUrl = !gateAllowed && planCode !== "trial" ? `/iniciar-pago?plan=${planCode}&cid=${clientId}` : null

    const response = NextResponse.json({
      ok: true,
      clientId,
      plan: {
        code: planCode,
        name: getDisplayPlanName(planCode),
        status: planStatus,
        subscription_status: String(subscription?.status || client?.plan_status || ""),
        gate_allowed: gateAllowed,
        current_period_end: subscription?.current_period_end || null,
        is_active: gateAllowed,
      },
      payment: {
        status: paymentStatus,
        checkout_url: checkoutUrl,
      },
      usage: {
        period: String(usageResp.data?.period_month || usageResp.data?.period_yyyymm || month),
        messages_used: Number(usageResp.data?.messages_used ?? 0),
        messages_limit: messagesLimit,
        calls_used: Number(usageResp.data?.audio_minutes_used ?? 0),
        calls_limit: callsLimit,
      },
      google: {
        connected: googleConnected,
        connection_status: connectionStatus,
        scopes,
        products: {
          gmail: authorizedProducts.includes("gmail") || scopes.some((scope: string) => String(scope).includes("gmail")),
          drive: authorizedProducts.includes("drive") || scopes.some((scope: string) => String(scope).includes("drive")),
          calendar: authorizedProducts.includes("calendar") || scopes.some((scope: string) => String(scope).includes("calendar")),
          contacts: authorizedProducts.includes("contacts") || scopes.some((scope: string) => String(scope).includes("contacts")),
        },
      },
      whatsapp: {
        connected: Boolean(normalizedPhone || rawPhone),
        phone: rawPhone,
        normalized_phone: normalizedPhone,
        activation_status: activationStatus,
        welcome_sent: welcomeSent,
      },
    })
    response.headers.set("Cache-Control", "no-store, max-age=0")
    return response
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "dashboard_status_read_failed",
        detail: typeof error?.message === "string" ? error.message : "Unexpected dashboard status error.",
      },
      { status: 500 },
    )
  }
}
