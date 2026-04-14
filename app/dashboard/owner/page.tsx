"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  DollarSign,
  Layers3,
  Receipt,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Settings,
  ArrowRight,
  Lock,
  LogOut,
  X,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OwnerCatalog, OwnerTargets } from "@/lib/owner-catalog"
import { supabase } from "@/lib/supabase"
import { getDisplayPlanName } from "@/lib/plans"
import OwnerCatalogManager from "./_components/OwnerCatalogManager"
import OwnerPaymentsMetricsPanel from "./_components/OwnerPaymentsMetricsPanel"
import OwnerTargetsManager from "./_components/OwnerTargetsManager"

type SummaryRow = {
  total_clients: number
  active_clients: number
  trial_clients: number
  paid_clients: number
  pro_plus_clients: number
  payments_approved_total: number
  payments_pending_total: number
  payments_failed_total: number
  payments_today_total: number
  payments_week_total: number
  payments_month_total: number
  subscriptions_active: number
  subscriptions_pending: number
  subscriptions_cancelled: number
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
}

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
}

type OwnerActivityEntry = {
  id: string
  action: "plan_change" | "status_change"
  clientId: string
  clientName: string
  previousValue: string | null
  nextValue: string | null
  createdAt: string
}

type OwnerProfile = {
  fullName: string
  email: string
}

// Revenue is received in PEN via MercadoPago Peru
// Costs are in USD (what we pay providers)
const BILLING_CURRENCY_CODE = "PEN"
const USD_TO_PEN = 5.0
const MP_FEE_PCT = 0.0399

const fmtPEN = (n: number) =>
  `S/${new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0)}`
const fmtUSD = (n: number) =>
  `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0)}`

// Convert stored amount to PEN for display
const toPEN = (amount: number, currency: string) =>
  (currency || "").toUpperCase() === "USD" ? amount * USD_TO_PEN : amount

const PROVIDER_COSTS = [
  { name: "OpenAI (GPT-4o)",    category: "IA",         cost_usd: 10, billing: "variable", url: "https://platform.openai.com/usage",    notes: "Variable según uso. ~$0.005/1k tokens." },
  { name: "ElevenLabs",         category: "Voz",        cost_usd: 5,  billing: "mensual",  url: "https://elevenlabs.io/subscription",   notes: "Starter: 30k chars/mes." },
  { name: "Telnyx",             category: "Telefonía",  cost_usd: 1,  billing: "variable", url: "https://portal.telnyx.com",            notes: "Número + por minuto de llamada." },
  { name: "Vapi",               category: "IA calls",   cost_usd: 0,  billing: "variable", url: "https://app.vapi.ai/billing",          notes: "Free: 10 min/mes. Luego $0.05/min." },
  { name: "Supabase",           category: "Base datos", cost_usd: 25, billing: "mensual",  url: "https://supabase.com/dashboard",       notes: "Pro plan: 8 GB DB, 100 GB storage." },
  { name: "Vercel",             category: "Frontend",   cost_usd: 0,  billing: "mensual",  url: "https://vercel.com/dashboard",         notes: "Free tier. Pro si escala: $20/mes." },
  { name: "Hetzner (servidor)", category: "Backend",    cost_usd: 15, billing: "mensual",  url: "https://console.hetzner.cloud",        notes: "VPS backend Python + Docker." },
  { name: "Mercado Pago",       category: "Pasarela",   cost_usd: 0,  billing: "variable", url: "https://www.mercadopago.com.pe",        notes: "~3.99% por transacción. Variable según volumen." },
]
const TOTAL_FIXED_USD = PROVIDER_COSTS.filter(p => p.billing === "mensual").reduce((a, p) => a + p.cost_usd, 0)
const TOTAL_FIXED_PEN = TOTAL_FIXED_USD * USD_TO_PEN

const SECTIONS = [
  { id: "workspace",     label: "Mi Operaly",    icon: Sparkles },
  { id: "overview",      label: "Alcances",       icon: BarChart3 },
  { id: "payments",      label: "Pagos",          icon: CreditCard },
  { id: "subscriptions", label: "Suscripciones",  icon: Layers3 },
  { id: "clients",       label: "Clientes",       icon: Users },
  { id: "costos",        label: "Costos Operaly", icon: Receipt },
] as const

const ADMIN_PLANS = ["trial", "core", "pro", "pro_plus"] as const
type AdminPlan = (typeof ADMIN_PLANS)[number]

const TIME_FILTERS = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
  { id: "all", label: "Todo" },
] as const

type TimeFilter = (typeof TIME_FILTERS)[number]["id"]

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
}

function getOwnerPlanLabel(planCode: string | null | undefined) {
  const normalized = String(planCode || "").toLowerCase()
  if (normalized === "owner") return "Owner interno"
  if (normalized === "owner_unlimited") return "Owner ilimitado"
  if (normalized === "internal") return "Interno"
  return getDisplayPlanName(planCode)
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string
  value: string
  detail?: string
  icon: typeof DollarSign
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-[#0F1F63]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-[#0F1F63]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </div>
  )
}

function RadialGauge({
  label,
  value,
  max,
  tone = "blue",
  detail,
}: {
  label: string
  value: number
  max: number
  tone?: "blue" | "emerald" | "amber" | "violet"
  detail?: string
}) {
  const pct = clampPercentage(max > 0 ? (value / max) * 100 : 0)
  const palette = {
    blue: { ring: "#2563EB", glow: "rgba(37,99,235,0.18)" },
    emerald: { ring: "#10B981", glow: "rgba(16,185,129,0.18)" },
    amber: { ring: "#F59E0B", glow: "rgba(245,158,11,0.18)" },
    violet: { ring: "#7C3AED", glow: "rgba(124,58,237,0.18)" },
  }[tone]

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-4 flex items-center gap-5">
        <div
          className="relative grid h-28 w-28 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${palette.ring} ${pct}%, #E2E8F0 ${pct}% 100%)`,
            boxShadow: `0 0 0 8px ${palette.glow}`,
          }}
        >
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
            <div>
              <p className="text-2xl font-semibold text-[#0F1F63]">{Math.round(pct)}%</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">avance</p>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-[#0F1F63]">{value.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Meta base: {max.toLocaleString()}</p>
          {detail ? <p className="text-xs text-slate-500">{detail}</p> : null}
        </div>
      </div>
    </div>
  )
}

function UsageBar({
  label,
  value,
  highlight,
  suffix = "",
}: {
  label: string
  value: number
  highlight: string
  suffix?: string
}) {
  const scaled = clampPercentage(value > 0 ? Math.min(100, 18 + Math.log10(value + 1) * 28) : 6)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-[#0F1F63]">
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${scaled}%`, backgroundColor: highlight }}
        />
      </div>
    </div>
  )
}

export default function OwnerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]["id"]>("workspace")
  const [summary, setSummary] = useState<SummaryRow | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>({
    fullName: "Operaly Owner",
    email: "",
  })
  const [actionLoadingKey, setActionLoadingKey] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [clientSearch, setClientSearch] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [notifications, setNotifications] = useState<Array<{id:string;title:string;body:string;amount_pen?:number;created_at:string;read:boolean}>>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [activityLog, setActivityLog] = useState<OwnerActivityEntry[]>([])
  const [catalog, setCatalog] = useState<OwnerCatalog | null>(null)
  const [targets, setTargets] = useState<OwnerTargets | null>(null)
  const [catalogSaving, setCatalogSaving] = useState(false)
  const [targetsSaving, setTargetsSaving] = useState(false)
  const [sessionBusy, setSessionBusy] = useState(false)
  const [catalogNotice, setCatalogNotice] = useState("")
  const [targetsNotice, setTargetsNotice] = useState("")

  // Revenue always shown in PEN (what MP deposits)
  const formatMoney = (amount: number | null | undefined, currency = "PEN") => {
    const n = Number(amount || 0)
    if (currency === "USD") return fmtUSD(n)
    return fmtPEN(n)
  }

  // For amounts stored in USD, convert to PEN for display
  const formatMoneyAuto = (amount: number | null | undefined, storedCurrency = "USD") =>
    fmtPEN(toPEN(Number(amount || 0), storedCurrency))

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "—"
    }

    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  const formatDateShort = (value: string | null) => {
    if (!value) return "—"
    try {
      return new Date(value).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return value
    }
  }

  const isWithinFilter = (value: string | null, filter: TimeFilter) => {
    if (!value) {
      return filter === "all"
    }

    if (filter === "all") {
      return true
    }

    const current = new Date(value)
    const now = new Date()

    if (Number.isNaN(current.getTime())) {
      return false
    }

    if (filter === "today") {
      return current >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    if (filter === "week") {
      const day = now.getDay()
      const diff = day === 0 ? 6 : day - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - diff)
      weekStart.setHours(0, 0, 0, 0)
      return current >= weekStart
    }

    if (filter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return current >= monthStart
    }

    return true
  }

  const paymentStatusClass = (status: string | null | undefined) => {
    const normalized = String(status || "").toLowerCase()

    if (["approved", "paid", "succeeded"].includes(normalized)) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (normalized === "pending") {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (["failed", "declined"].includes(normalized)) {
      return "border-red-200 bg-red-50 text-red-700"
    }

    return "border-slate-200 bg-slate-100 text-slate-700"
  }

  const subscriptionStatusClass = (status: string | null | undefined) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "active") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (normalized === "pending") {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (normalized === "cancelled") {
      return "border-slate-200 bg-slate-100 text-slate-700"
    }

    return "border-slate-200 bg-slate-100 text-slate-700"
  }

  const clientStatusClass = (status: string | null | undefined) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "active") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (normalized === "blocked") {
      return "border-red-200 bg-red-50 text-red-700"
    }

    if (normalized === "inactive") {
      return "border-slate-200 bg-slate-100 text-slate-700"
    }

    return "border-slate-200 bg-slate-100 text-slate-700"
  }


  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    const token = data.session?.access_token
    if (!token) {
      throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.")
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const loadOwnerDashboard = async (useRefreshing = false) => {
    if (useRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        throw authError
      }

      const user = authData.user

      if (!user) {
        throw new Error("No hay sesión activa.")
      }

      setOwnerProfile({
        fullName: String(user.user_metadata?.full_name || "Operaly Owner"),
        email: String(user.email || ""),
      })

      const headers = await getAuthHeaders()
      const [dashboardResponse, catalogResponse, targetsResponse] = await Promise.all([
        fetch("/api/owner/dashboard", {
          method: "GET",
          headers,
          cache: "no-store",
        }),
        fetch("/api/owner/catalog", {
          method: "GET",
          headers,
          cache: "no-store",
        }),
        fetch("/api/owner/targets", {
          method: "GET",
          headers,
          cache: "no-store",
        }),
      ])

      const payload = await dashboardResponse.json().catch(() => ({}))
      const catalogPayload = await catalogResponse.json().catch(() => ({}))
      const targetsPayload = await targetsResponse.json().catch(() => ({}))

      if (!dashboardResponse.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo cargar el panel owner.")
      }
      if (!catalogResponse.ok || !catalogPayload?.ok) {
        throw new Error(catalogPayload?.error || "No se pudo cargar el catálogo owner.")
      }
      if (!targetsResponse.ok || !targetsPayload?.ok) {
        throw new Error(targetsPayload?.error || "No se pudieron cargar las metas owner.")
      }

      setSummary((payload.summary || null) as SummaryRow | null)
      setPayments((payload.payments || []) as PaymentRow[])
      setSubscriptions((payload.subscriptions || []) as SubscriptionRow[])
      setClients((payload.clients || []) as ClientRow[])
      setActivityLog((payload.activityLog || []) as OwnerActivityEntry[])
      setCatalog((catalogPayload.catalog || null) as OwnerCatalog | null)
      setTargets((targetsPayload.targets || null) as OwnerTargets | null)

      const nextClients = (payload.clients || []) as ClientRow[]
      if (nextClients.length > 0) {
        setSelectedClientId((current) => {
          if (current && nextClients.some((client) => client.id === current)) {
            return current
          }
          return nextClients[0].id
        })
      } else {
        setSelectedClientId("")
      }
    } catch (error: any) {
      console.error("Owner dashboard load error:", error)
      setSummary(null)
      setPayments([])
      setSubscriptions([])
      setClients([])
      setActivityLog([])
      setCatalog(null)
      setTargets(null)
      setSelectedClientId("")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOwnerDashboard()

    // ── Realtime: new payments & clients ──────────────────────────────────
    const channel = supabase
      .channel("owner_realtime_v1")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payments" },
        (payload: any) => {
          const p = payload.new || {}
          const pen = toPEN(Number(p.amount_usd || 0), p.currency || "PEN")
          const note = {
            id: p.id || Date.now().toString(),
            title: "💰 Nuevo pago recibido",
            body: `${p.client_name || "Cliente"} · ${fmtPEN(pen)}`,
            amount_pen: pen,
            created_at: new Date().toISOString(),
            read: false,
          }
          setNotifications(prev => [note, ...prev].slice(0, 30))
        }
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "clients" },
        (payload: any) => {
          const c = payload.new || {}
          const note = {
            id: c.id || Date.now().toString(),
            title: "👤 Nuevo usuario registrado",
            body: `${c.name || "Usuario"} · Plan ${c.plan_code || "trial"}`,
            created_at: new Date().toISOString(),
            read: false,
          }
          setNotifications(prev => [note, ...prev].slice(0, 30))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const runPlanChange = async (clientId: string, planCode: AdminPlan) => {
    const loadingKey = `plan:${clientId}:${planCode}`
    setActionLoadingKey(loadingKey)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch("/api/owner/client/plan", {
        method: "POST",
        headers,
        body: JSON.stringify({ clientId, planCode }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo actualizar el plan.")
      }

      await loadOwnerDashboard(true)
    } catch (error: any) {
      alert(error.message || "No se pudo actualizar el plan.")
    } finally {
      setActionLoadingKey("")
    }
  }

  const runStatusChange = async (
    clientId: string,
    nextStatus: "active" | "blocked" | "inactive"
  ) => {
    const loadingKey = `status:${clientId}:${nextStatus}`
    setActionLoadingKey(loadingKey)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch("/api/owner/client/status", {
        method: "POST",
        headers,
        body: JSON.stringify({ clientId, status: nextStatus }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo actualizar el estado del cliente.")
      }

      await loadOwnerDashboard(true)
    } catch (error: any) {
      alert(error.message || "No se pudo actualizar el estado del cliente.")
    } finally {
      setActionLoadingKey("")
    }
  }

  const openProfessionalDashboard = () => {
    window.open("/dashboard/professional", "_blank", "noopener,noreferrer")
  }

  const openProfessionalSettings = () => {
    window.open("/dashboard/professional/configuracion", "_blank", "noopener,noreferrer")
  }

  const handleOwnerLogout = async () => {
    setSessionBusy(true)
    try {
      await supabase.auth.signOut()
    } finally {
      window.location.href = "/login"
    }
  }

  const handlePlanPriceChange = (planCode: string, field: "price", value: number) => {
    setCatalog((current) => {
      if (!current) return current
      return {
        ...current,
        plans: current.plans.map((plan) =>
          plan.code === planCode ? { ...plan, [field]: Math.max(0, value) } : plan
        ),
      }
    })
  }

  const handlePlanLimitChange = (planCode: string, limitKey: string, value: number) => {
    setCatalog((current) => {
      if (!current) return current
      return {
        ...current,
        plans: current.plans.map((plan) =>
          plan.code === planCode
            ? {
                ...plan,
                limits: {
                  ...plan.limits,
                  [limitKey]: Math.max(0, value),
                },
              }
            : plan
        ),
      }
    })
  }

  const handleAddonFieldChange = (
    addonCode: string,
    field:
      | "price"
      | "name"
      | "description"
      | "extra_messages"
      | "extra_minutes"
      | "extra_storage_gb"
      | "extra_automations",
    value: string | number
  ) => {
    setCatalog((current) => {
      if (!current) return current
      return {
        ...current,
        addons: current.addons.map((addon) =>
          addon.code === addonCode
            ? {
                ...addon,
                [field]: typeof value === "number" ? Math.max(0, value) : value,
              }
            : addon
        ),
      }
    })
  }

  const saveCatalog = async () => {
    if (!catalog) return
    setCatalogSaving(true)
    setCatalogNotice("")
    try {
      const headers = await getAuthHeaders()
      const response = await fetch("/api/owner/catalog", {
        method: "PUT",
        headers,
        body: JSON.stringify({ catalog }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo guardar el catálogo owner.")
      }
      setCatalog((payload.catalog || catalog) as OwnerCatalog)
      setCatalogNotice("Catálogo guardado correctamente.")
    } catch (error: any) {
      setCatalogNotice(error.message || "No se pudo guardar el catálogo owner.")
    } finally {
      setCatalogSaving(false)
    }
  }

  const handleTargetsChange = (
    windowKey: "week" | "month",
    field: "profitPen" | "salesPen" | "subscribers",
    value: number
  ) => {
    setTargets((current) => {
      if (!current) return current
      return {
        ...current,
        [windowKey]: {
          ...current[windowKey],
          [field]: Math.max(0, value),
        },
      }
    })
  }

  const saveTargets = async () => {
    if (!targets) return
    setTargetsSaving(true)
    setTargetsNotice("")
    try {
      const headers = await getAuthHeaders()
      const response = await fetch("/api/owner/targets", {
        method: "PUT",
        headers,
        body: JSON.stringify({ targets }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudieron guardar las metas owner.")
      }
      setTargets((payload.targets || targets) as OwnerTargets)
      setTargetsNotice("Metas owner guardadas correctamente.")
    } catch (error: any) {
      setTargetsNotice(error.message || "No se pudieron guardar las metas owner.")
    } finally {
      setTargetsSaving(false)
    }
  }

  const activeTargetWindow: "week" | "month" = timeFilter === "month" ? "month" : "week"
  const activeTargets = targets?.[activeTargetWindow] || {
    profitPen: 4000,
    salesPen: 12000,
    subscribers: 12,
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => isWithinFilter(payment.created_at, timeFilter))
  }, [payments, timeFilter])

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) =>
      isWithinFilter(subscription.created_at, timeFilter)
    )
  }, [subscriptions, timeFilter])

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase()

    return clients.filter((client) => {
      const filterDate = client.subscription_started_at || client.created_at
      if (!isWithinFilter(filterDate, timeFilter)) {
        return false
      }

      if (!term) {
        return true
      }

      const haystack = [
        client.name || "",
        client.email || "",
        client.phone || "",
        client.country_code || "",
        client.city || "",
        client.plan_code || "",
        client.status || "",
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [clients, clientSearch, timeFilter])

  const selectedClient = useMemo(() => {
    return clients.find((client) => client.id === selectedClientId) || null
  }, [clients, selectedClientId])

  const selectedClientPayments = useMemo(() => {
    if (!selectedClientId) {
      return []
    }

    return payments.filter((payment) => payment.client_id === selectedClientId).slice(0, 8)
  }, [payments, selectedClientId])

  const selectedClientSubscriptions = useMemo(() => {
    if (!selectedClientId) {
      return []
    }

    return subscriptions
      .filter((subscription) => subscription.client_id === selectedClientId)
      .slice(0, 5)
  }, [subscriptions, selectedClientId])

  const selectedClientActivity = useMemo(() => {
    if (!selectedClientId) return []
    return activityLog.filter((item) => item.clientId === selectedClientId).slice(0, 8)
  }, [activityLog, selectedClientId])

  const filteredOverview = useMemo(() => {
    const approvedPayments = filteredPayments.filter((payment) =>
      ["approved", "paid", "succeeded"].includes(String(payment.status || "").toLowerCase())
    )

    const pendingPayments = filteredPayments.filter(
      (payment) => String(payment.status || "").toLowerCase() === "pending"
    )

    const failedPayments = filteredPayments.filter((payment) =>
      ["failed", "declined"].includes(String(payment.status || "").toLowerCase())
    )

    const activeSubscriptions = filteredSubscriptions.filter(
      (subscription) => String(subscription.status || "").toLowerCase() === "active"
    )

    const approvedTotal = approvedPayments.reduce(
      (acc, payment) => acc + toPEN(Number(payment.amount || 0), payment.currency_code || "PEN"),
      0
    )

    const pendingTotal = pendingPayments.reduce(
      (acc, payment) => acc + toPEN(Number(payment.amount || 0), payment.currency_code || "PEN"),
      0
    )

    const failedTotal = failedPayments.reduce(
      (acc, payment) => acc + toPEN(Number(payment.amount || 0), payment.currency_code || "PEN"),
      0
    )

    return {
      approvedPayments,
      pendingPayments,
      failedPayments,
      activeSubscriptions,
      approvedTotal,
      pendingTotal,
      failedTotal,
    }
  }, [filteredPayments, filteredSubscriptions])

  const filteredClientUsage = useMemo(() => {
    return filteredClients.reduce(
      (acc, client) => {
        acc.messages += Number(client.messages_used || 0)
        acc.minutes += Number(client.audio_minutes_used || 0)
        acc.automations += Number(client.automations_used || 0)
        acc.storage += Number(client.storage_used_mb || 0)
        acc.docs += Number(client.docs_count || 0)
        return acc
      },
      { messages: 0, minutes: 0, automations: 0, storage: 0, docs: 0 }
    )
  }, [filteredClients])

  const filteredBusinessMetrics = useMemo(() => {
    const approvedRevenuePen = filteredOverview.approvedTotal
    const pendingRevenuePen = filteredOverview.pendingTotal
    const fixedCostsPen = TOTAL_FIXED_PEN
    const variableCostsPen = approvedRevenuePen * MP_FEE_PCT
    const totalCostsPen = fixedCostsPen + variableCostsPen
    const profitPen = approvedRevenuePen - totalCostsPen
    const breakEvenPen = fixedCostsPen / Math.max(0.0001, 1 - MP_FEE_PCT)
    const targetRevenuePen = Math.max(activeTargets.salesPen, breakEvenPen)
    const paidClients = filteredClients.filter((client) =>
      ["core", "pro", "pro_plus"].includes(String(client.plan_code || "").toLowerCase())
    ).length
    const totalClients = Math.max(filteredClients.length, 1)

    return {
      approvedRevenuePen,
      pendingRevenuePen,
      fixedCostsPen,
      variableCostsPen,
      totalCostsPen,
      profitPen,
      breakEvenPen,
      targetRevenuePen,
      paidClients,
      totalClients,
      subscriberPct: clampPercentage((paidClients / totalClients) * 100),
      subscriberTargetPct: clampPercentage((paidClients / Math.max(activeTargets.subscribers, 1)) * 100),
      targetProfitPct: clampPercentage((Math.max(profitPen, 0) / Math.max(activeTargets.profitPen, 1)) * 100),
      salesTargetPct: clampPercentage((approvedRevenuePen / Math.max(activeTargets.salesPen, 1)) * 100),
      breakEvenPct: clampPercentage((approvedRevenuePen / Math.max(breakEvenPen, 1)) * 100),
    }
  }, [activeTargets, filteredClients, filteredOverview])

  const filteredPlanDistribution = useMemo(() => {
    return filteredClients.reduce(
      (acc, client) => {
        const code = String(client.plan_code || "").toLowerCase()
        if (code === "trial") acc.trial += 1
        if (code === "core") acc.core += 1
        if (code === "pro") acc.pro += 1
        if (code === "pro_plus") acc.proPlus += 1
        return acc
      },
      { trial: 0, core: 0, pro: 0, proPlus: 0 }
    )
  }, [filteredClients])

  const overviewCards = useMemo(() => {
    const label =
      timeFilter === "today"
        ? "hoy"
        : timeFilter === "week"
        ? "semana"
        : timeFilter === "month"
        ? "mes"
        : "periodo"

    return [
      {
        title: `Ingresos ${label}`,
        value: formatMoney(filteredOverview.approvedTotal),
        icon: DollarSign,
        detail: `${filteredOverview.approvedPayments.length} pagos aprobados`,
      },
      {
        title: "Pagos pendientes",
        value: formatMoney(filteredOverview.pendingTotal),
        icon: Wallet,
        detail: `${filteredOverview.pendingPayments.length} cobros en curso`,
      },
      {
        title: "Pagos fallidos",
        value: formatMoney(filteredOverview.failedTotal),
        icon: CreditCard,
        detail: `${filteredOverview.failedPayments.length} intentos sin cierre`,
      },
      {
        title: "Clientes visibles",
        value: String(filteredClients.length),
        icon: Users,
        detail: "filtrados por fecha de suscripcion",
      },
      {
        title: "Pagos aprobados",
        value: String(filteredOverview.approvedPayments.length),
        icon: BarChart3,
        detail: "movimiento comercial del filtro",
      },
      {
        title: "Suscripciones activas",
        value: String(filteredOverview.activeSubscriptions.length),
        icon: ShieldCheck,
        detail: "estado vigente en este periodo",
      },
    ]
  }, [filteredOverview, filteredClients.length, timeFilter])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando panel owner...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0F1F63] via-[#1E3A8A] to-[#06B6D4] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                <Image
                  src="/images/operaly-logo.png"
                  alt="Operaly"
                  width={72}
                  height={72}
                  priority
                />
              </div>

              <div className="text-white">
                <p className="text-sm font-medium text-white/80">
                  Operaly Owner Console
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold mt-1">
                  Tu centro de control
                </h1>
                <p className="text-sm md:text-base text-white/80 mt-2 max-w-2xl">
                  Usa Operaly como usuario premium ilimitado y administra el negocio
                  desde un mismo lugar, sin perder foco en tu operación.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white">
                <p className="text-sm font-medium">{ownerProfile.fullName}</p>
                <p className="text-xs text-white/80">{ownerProfile.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="rounded-xl bg-white text-[#0F1F63] hover:bg-white/90"
                  onClick={openProfessionalSettings}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-xl bg-white text-[#0F1F63] hover:bg-white/90"
                  onClick={handleOwnerLogout}
                  disabled={sessionBusy}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {sessionBusy ? "Saliendo..." : "Cerrar sesión"}
                </Button>
                {/* Realtime notification bell */}
                <div className="relative">
                  <Button variant="secondary" size="icon"
                    className="rounded-xl bg-white text-[#0F1F63] hover:bg-white/90 relative"
                    onClick={() => setShowNotifs(!showNotifs)}>
                    <Bell className="w-4 h-4" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                        {Math.min(9, notifications.filter(n => !n.read).length)}
                      </span>
                    )}
                  </Button>
                  {showNotifs && (
                    <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                        <p className="font-semibold text-sm text-[#0F1F63]">Notificaciones en tiempo real</p>
                        <div className="flex gap-2 items-center">
                          {notifications.filter(n => !n.read).length > 0 && (
                            <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                              className="text-[10px] text-[#3B82F6] hover:underline">Marcar leídas</button>
                          )}
                          <button onClick={() => setShowNotifs(false)}>
                            <X className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                          <p className="text-xs text-slate-500">Sin notificaciones aún</p>
                          <p className="text-[10px] text-slate-400 mt-1">Los nuevos pagos y registros aparecen aquí</p>
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                          {notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-[#EFF6FF]/40" : ""}`}>
                              <p className="text-xs font-semibold text-[#0F1F63]">{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{n.body}</p>
                              {n.amount_pen && <p className="text-xs font-bold text-[#10B981] mt-1">{fmtPEN(n.amount_pen)}</p>}
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString("es-PE")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="secondary"
                  className="rounded-xl bg-white text-[#0F1F63] hover:bg-white/90"
                  onClick={() => loadOwnerDashboard(true)}
                  disabled={refreshing}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 md:px-8 bg-[#F8FAFF] border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              <Lock className="w-3.5 h-3.5" />
              Owner mode activo
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              Beneficios ilimitados
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              Billing exento
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              Cobro del negocio en {BILLING_CURRENCY_CODE}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-fit">
          <div className="space-y-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-[#0F1F63] text-white"
                      : "bg-[#F7F9FC] text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <main className="space-y-8">
          {activeSection !== "workspace" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  {TIME_FILTERS.map((filter) => {
                    const isActive = timeFilter === filter.id

                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setTimeFilter(filter.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? "border-[#0F1F63] bg-[#0F1F63] text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <CalendarDays className="w-4 h-4" />
                        {filter.label}
                      </button>
                    )
                  })}
                </div>

                <div className="relative w-full xl:w-[340px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar por nombre, email, teléfono, país o plan"
                    className="pl-10 rounded-xl"
                  />
                  {clientSearch ? (
                    <button
                      type="button"
                      onClick={() => setClientSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "workspace" ? (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                  <h2 className="text-xl font-semibold text-[#0F1F63]">
                    Mi Operaly premium
                  </h2>
                </div>

                <p className="text-slate-600 leading-7 mb-6">
                  Desde aquí entras a tu experiencia normal de Operaly como usuario,
                  pero con beneficios internos activos y sin flujo de cobro para tu cuenta.
                </p>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-5">
                    <p className="text-lg font-semibold text-[#0F1F63] mb-2">
                      Dashboard Operaly
                    </p>
                    <p className="text-sm text-slate-600 mb-4">
                      Abre tu workspace principal en otra pestaña para no perder este panel owner.
                    </p>
                    <Button
                      className="rounded-xl bg-[#0F1F63] hover:bg-[#132672] text-white"
                      onClick={openProfessionalDashboard}
                    >
                      Abrir mi Operaly
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-5">
                    <p className="text-lg font-semibold text-[#0F1F63] mb-2">
                      Configuración
                    </p>
                    <p className="text-sm text-slate-600 mb-4">
                      Ajusta timezone, idioma, perfil y preferencias en otra pestaña.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={openProfessionalSettings}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Ir a configuración
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-5">
                    <p className="text-lg font-semibold text-[#0F1F63] mb-2">
                      Estado de owner
                    </p>
                    <p className="text-sm text-slate-600 mb-4">
                      Tu cuenta esta marcada como owner, con acceso interno ilimitado y exento de cobro para operar y administrar.
                    </p>
                    <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      Owner activo
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="text-sm text-slate-500 mb-2">Tu plan interno</p>
                  <p className="text-2xl font-semibold text-[#0F1F63]">Owner ilimitado</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="text-sm text-slate-500 mb-2">Cobro propio</p>
                  <p className="text-2xl font-semibold text-[#0F1F63]">Exento</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="text-sm text-slate-500 mb-2">Acceso</p>
                  <p className="text-2xl font-semibold text-[#0F1F63]">Ilimitado</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="text-sm text-slate-500 mb-2">Módulos owner</p>
                  <p className="text-2xl font-semibold text-[#0F1F63]">Activos</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="h-5 w-5 text-[#0F1F63]" />
                    <h3 className="text-xl font-semibold text-[#0F1F63]">
                      Cuenta y seguridad
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    Mantén la sesión owner bajo control, entra a configuración cuando lo
                    necesites y sal de forma segura desde este mismo panel.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={openProfessionalSettings}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Abrir configuración
                    </Button>
                    <Button
                      className="rounded-2xl bg-[#0F1F63] text-white hover:bg-[#132672]"
                      onClick={handleOwnerLogout}
                      disabled={sessionBusy}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {sessionBusy ? "Cerrando sesión..." : "Cerrar sesión owner"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="h-5 w-5 text-[#10B981]" />
                    <h3 className="text-xl font-semibold text-[#0F1F63]">
                      Estado ejecutivo
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">meta activa</p>
                      <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                        {activeTargetWindow === "week" ? "Semana" : "Mes"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ventas objetivo</p>
                      <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                        {fmtPEN(activeTargets.salesPen)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">suscriptores objetivo</p>
                      <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                        {activeTargets.subscribers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <OwnerCatalogManager
                catalog={catalog}
                saving={catalogSaving}
                onPlanFieldChange={handlePlanPriceChange}
                onPlanLimitChange={handlePlanLimitChange}
                onAddonFieldChange={handleAddonFieldChange}
                onSave={saveCatalog}
              />
              {catalogNotice ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    catalogNotice.toLowerCase().includes("no se pudo")
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {catalogNotice}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeSection === "overview" ? (
            <div className="space-y-8">
              <OwnerTargetsManager
                targets={targets}
                saving={targetsSaving}
                activeWindow={activeTargetWindow}
                onChange={handleTargetsChange}
                onSave={saveTargets}
              />
              {targetsNotice ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    targetsNotice.toLowerCase().includes("no se pudo")
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {targetsNotice}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {overviewCards.map((card) => (
                  <MetricCard key={card.title} {...card} />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Pulso del negocio</p>
                      <h2 className="mt-1 text-2xl font-semibold text-[#0F1F63]">
                        Metrica ejecutiva de Operaly
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        ventana activa
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#0F1F63]">
                        {activeTargetWindow === "week" ? "Semana" : "Mes"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    <RadialGauge
                      label="Meta de suscriptores"
                      value={filteredBusinessMetrics.paidClients}
                      max={Math.max(activeTargets.subscribers, 1)}
                      tone="blue"
                      detail={`Penetración actual: ${Math.round(filteredBusinessMetrics.subscriberPct)}%`}
                    />
                    <RadialGauge
                      label="Meta de utilidad"
                      value={Math.max(filteredBusinessMetrics.profitPen, 0)}
                      max={Math.max(activeTargets.profitPen, 1)}
                      tone="emerald"
                      detail={`Utilidad estimada: ${fmtPEN(filteredBusinessMetrics.profitPen)}`}
                    />
                    <RadialGauge
                      label="Meta de ventas"
                      value={filteredBusinessMetrics.approvedRevenuePen}
                      max={Math.max(activeTargets.salesPen, 1)}
                      tone="amber"
                      detail={`Break-even operativo: ${fmtPEN(filteredBusinessMetrics.breakEvenPen)}`}
                    />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ingresos reales</p>
                      <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                        {fmtPEN(filteredBusinessMetrics.approvedRevenuePen)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ventas objetivo</p>
                      <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                        {fmtPEN(activeTargets.salesPen)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">utilidad objetivo</p>
                      <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                        {fmtPEN(activeTargets.profitPen)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">suscriptores objetivo</p>
                      <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                        {activeTargets.subscribers}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-blue-500">avance suscriptores</p>
                      <p className="mt-2 text-2xl font-semibold text-blue-900">
                        {Math.round(filteredBusinessMetrics.subscriberTargetPct)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-500">avance utilidad</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-900">
                        {Math.round(filteredBusinessMetrics.targetProfitPct)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-500">avance ventas</p>
                      <p className="mt-2 text-2xl font-semibold text-amber-900">
                        {Math.round(filteredBusinessMetrics.salesTargetPct)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Consumo agregado</p>
                      <h3 className="mt-1 text-xl font-semibold text-[#0F1F63]">
                        Uso del periodo visible
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Clientes filtrados
                    </div>
                  </div>

                  <div className="space-y-4">
                    <UsageBar label="Mensajes" value={filteredClientUsage.messages} highlight="#2563EB" />
                    <UsageBar label="Minutos de voz" value={filteredClientUsage.minutes} suffix=" min" highlight="#8B5CF6" />
                    <UsageBar label="Automatizaciones" value={filteredClientUsage.automations} highlight="#10B981" />
                    <UsageBar label="Almacenamiento" value={filteredClientUsage.storage} suffix=" MB" highlight="#F59E0B" />
                    <UsageBar label="Documentos" value={filteredClientUsage.docs} highlight="#EC4899" />
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">proyeccion rapida</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Ingresos objetivo activos para esta ventana:{" "}
                      <span className="font-semibold text-[#0F1F63]">
                        {fmtPEN(filteredBusinessMetrics.targetRevenuePen)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Costos fijos visibles:{" "}
                      <span className="font-semibold text-[#0F1F63]">
                        {fmtPEN(filteredBusinessMetrics.fixedCostsPen)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Cobros pendientes visibles:{" "}
                      <span className="font-semibold text-[#0F1F63]">
                        {fmtPEN(filteredBusinessMetrics.pendingRevenuePen)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {summary ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Trials</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {filteredPlanDistribution.trial}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Core</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {filteredPlanDistribution.core}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Pro</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {filteredPlanDistribution.pro}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Pro Plus</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {filteredPlanDistribution.proPlus}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Huella operativa</p>
                    <h3 className="mt-1 text-xl font-semibold text-[#0F1F63]">
                      Registro de acciones owner
                    </h3>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                    {activityLog.length} registros recientes
                  </span>
                </div>

                <div className="space-y-3">
                  {activityLog.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-[#0F1F63]">{entry.clientName}</p>
                          <p className="text-sm text-slate-500">
                            {entry.action === "plan_change" ? "Cambio de plan" : "Cambio de estado"}:{" "}
                            <span className="font-medium text-slate-700">{entry.previousValue || "—"}</span>
                            {" → "}
                            <span className="font-medium text-slate-700">{entry.nextValue || "—"}</span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}

                  {activityLog.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                      Aun no hay acciones administrativas registradas.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "payments" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                <h2 className="text-xl font-semibold text-[#0F1F63]">
                  Pagos recientes
                </h2>
              </div>

              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {payment.client_name || "Cliente sin nombre"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {payment.client_phone || "Sin teléfono"} ·{" "}
                          {payment.country_code || "—"} · {payment.city || "—"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Plan: {payment.plan_code || "—"}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Orden: {payment.order_number || "—"} · TX:{" "}
                          {payment.transaction_id || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Fecha: {formatDateTime(payment.created_at)}
                        </p>
                      </div>

                      <div className="text-left xl:text-right">
                        <p className="text-xl font-semibold text-[#0F1F63]">
                          {fmtPEN(toPEN(Number(payment.amount || 0), payment.currency_code || "PEN"))}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {payment.payment_method_brand ||
                            payment.payment_method ||
                            "Método no informado"}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mt-3 ${paymentStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPayments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No hay pagos registrados para este filtro.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSection === "subscriptions" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers3 className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-xl font-semibold text-[#0F1F63]">
                  Suscripciones recientes
                </h2>
              </div>

              <div className="space-y-4">
                {filteredSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {subscription.client_name || "Cliente sin nombre"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {subscription.client_phone || "Sin teléfono"} ·{" "}
                          {subscription.country_code || "—"} · {subscription.city || "—"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Plan: {subscription.plan_code}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Periodo: {formatDateTime(subscription.current_period_start)} →{" "}
                          {formatDateTime(subscription.current_period_end)}
                        </p>
                      </div>

                      <div className="text-left xl:text-right">
                        <p className="text-xl font-semibold text-[#0F1F63]">
                          {fmtPEN(toPEN(Number(subscription.amount || 0), subscription.currency_code || "PEN"))}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mt-3 ${subscriptionStatusClass(
                            subscription.status
                          )}`}
                        >
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSubscriptions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No hay suscripciones registradas para este filtro.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSection === "clients" ? (
            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="text-xl font-semibold text-[#0F1F63]">
                    Clientes y control manual
                  </h2>
                </div>

                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setSelectedClientId(client.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                        selectedClientId === client.id
                          ? "border-[#0F1F63] bg-[#0F1F63]/5"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-[#0F1F63]">
                            {client.name || "Cliente sin nombre"}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {client.email || "Sin email"} · {client.phone || "Sin teléfono"}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {client.country_code || "—"} · {client.city || "—"} ·{" "}
                            {client.timezone || "—"}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Suscripcion: {formatDateShort(client.subscription_started_at || client.created_at)} · Vence:{" "}
                            {formatDateShort(client.current_period_end)}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                              <span className="font-semibold text-[#0F1F63]">{client.messages_used.toLocaleString()}</span> mensajes
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                              <span className="font-semibold text-[#0F1F63]">{client.audio_minutes_used.toLocaleString()}</span> min voz
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                            {getOwnerPlanLabel(client.plan_code)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${clientStatusClass(
                              client.status
                            )}`}
                          >
                            {client.status || "—"}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredClients.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                      No hay clientes que coincidan con la búsqueda.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-[#0F1F63]">
                      Detalle del cliente
                    </h2>
                    {selectedClient ? (
                      <span className="text-xs text-slate-500">{selectedClient.id}</span>
                    ) : null}
                  </div>

                  {selectedClient ? (
                    <div className="space-y-6">
                      <div>
                        <p className="text-lg font-semibold text-[#0F1F63]">
                          {selectedClient.name || "Cliente sin nombre"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {selectedClient.email || "Sin email"} ·{" "}
                          {selectedClient.phone || "Sin teléfono"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {selectedClient.country_code || "—"} · {selectedClient.city || "—"} ·{" "}
                          {selectedClient.timezone || "—"}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Alta: {formatDateTime(selectedClient.created_at)}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                            Plan actual
                          </p>
                          <p className="text-sm font-medium text-[#0F1F63]">
                            {getOwnerPlanLabel(selectedClient.plan_code)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Estado plan: {selectedClient.plan_status || "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFF] p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                            Estado cuenta
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${clientStatusClass(
                              selectedClient.status
                            )}`}
                          >
                            {selectedClient.status || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">mensajes</p>
                          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                            {selectedClient.messages_used.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">voz</p>
                          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                            {selectedClient.audio_minutes_used.toLocaleString()} min
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">storage</p>
                          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                            {selectedClient.storage_used_mb.toLocaleString()} MB
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">automatizaciones</p>
                          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                            {selectedClient.automations_used.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">documentos</p>
                          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">
                            {selectedClient.docs_count.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ultimo cobro</p>
                          <p className="mt-2 text-sm font-semibold text-[#0F1F63]">
                            {formatDateShort(selectedClient.latest_payment_at)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#0F1F63] mb-3">
                          Cambiar plan
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ADMIN_PLANS.map((planCode) => {
                            const loadingKey = `plan:${selectedClient.id}:${planCode}`
                            const isCurrent = selectedClient.plan_code === planCode

                            return (
                              <Button
                                key={planCode}
                                variant={isCurrent ? "secondary" : "outline"}
                                className="rounded-xl"
                                disabled={Boolean(actionLoadingKey) || isCurrent}
                                onClick={() => runPlanChange(selectedClient.id, planCode)}
                              >
                                {actionLoadingKey === loadingKey
                                  ? "Actualizando..."
                                  : `Plan ${planCode}`}
                              </Button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#0F1F63] mb-3">
                          Estado de cuenta
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={Boolean(actionLoadingKey) || selectedClient.status === "active"}
                            onClick={() => runStatusChange(selectedClient.id, "active")}
                          >
                            {actionLoadingKey === `status:${selectedClient.id}:active`
                              ? "Actualizando..."
                              : "Activar"}
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={Boolean(actionLoadingKey) || selectedClient.status === "blocked"}
                            onClick={() => runStatusChange(selectedClient.id, "blocked")}
                          >
                            {actionLoadingKey === `status:${selectedClient.id}:blocked`
                              ? "Actualizando..."
                              : "Bloquear"}
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={Boolean(actionLoadingKey) || selectedClient.status === "inactive"}
                            onClick={() => runStatusChange(selectedClient.id, "inactive")}
                          >
                            {actionLoadingKey === `status:${selectedClient.id}:inactive`
                              ? "Actualizando..."
                              : "Dar de baja"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                      Selecciona un cliente de la lista para ver su detalle.
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">
                    Registro de acciones sobre este cliente
                  </h2>

                  <div className="space-y-3">
                    {selectedClientActivity.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-[#0F1F63]">
                              {entry.action === "plan_change" ? "Cambio de plan" : "Cambio de estado"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {entry.previousValue || "—"} → {entry.nextValue || "—"}
                            </p>
                          </div>

                          <p className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</p>
                        </div>
                      </div>
                    ))}

                    {selectedClientActivity.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                        Este cliente todavía no tiene acciones owner registradas.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">
                    Pagos recientes del cliente
                  </h2>

                  <div className="space-y-3">
                    {selectedClientPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-[#0F1F63]">
                              {fmtPEN(toPEN(Number(payment.amount || 0), payment.currency_code || "PEN"))}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {payment.order_number || "—"} · {formatDateTime(payment.created_at)}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${paymentStatusClass(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {selectedClientPayments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                        Este cliente no tiene pagos registrados.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">
                    Suscripciones recientes del cliente
                  </h2>

                  <div className="space-y-3">
                    {selectedClientSubscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-[#0F1F63]">
                              {subscription.plan_code}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDateTime(subscription.current_period_start)} →{" "}
                              {formatDateTime(subscription.current_period_end)}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${subscriptionStatusClass(
                              subscription.status
                            )}`}
                          >
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {selectedClientSubscriptions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                        Este cliente no tiene suscripciones registradas.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {activeSection === "costos" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0F1F63]">Costos operativos de Operaly</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Pagos mensuales a los proveedores. Mantenlos al día para no perder continuidad.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Fijo mensual</p>
                  <p className="text-3xl font-bold text-[#0F1F63] mt-1">
                    ${PROVIDER_COSTS.filter(p => p.billing === "mensual").reduce((a, b) => a + b.cost_usd, 0)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">USD garantizados</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Variable estimado</p>
                  <p className="text-3xl font-bold text-[#0F1F63] mt-1">
                    ~${PROVIDER_COSTS.filter(p => p.billing === "variable").reduce((a, b) => a + b.cost_usd, 0)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">USD según uso</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Total estimado</p>
                  <p className="text-3xl font-bold text-[#7C3AED] mt-1">
                    ~{fmtUSD(TOTAL_FIXED_USD)}/mes
                  </p>
                  <p className="text-xs text-slate-400 mt-1">≈ {fmtPEN(TOTAL_FIXED_PEN)} PEN · TC S/{USD_TO_PEN}/$</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-[#0F1F63]">Proveedores activos</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {PROVIDER_COSTS.map((provider) => (
                    <div key={provider.name} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-[#0F1F63]">{provider.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{provider.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${provider.billing === "mensual" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                              {provider.billing}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{provider.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-[#0F1F63]">{provider.cost_usd === 0 ? "Free" : fmtUSD(provider.cost_usd)}</p>
                          <p className="text-xs text-slate-400">
                            {provider.cost_usd > 0 ? `≈ ${fmtPEN(provider.cost_usd * USD_TO_PEN)}/mes` : "Variable"}
                          </p>
                        </div>
                        <a href={provider.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          Ver panel
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-medium text-amber-800">💡 Recordatorio</p>
                <p className="text-sm text-amber-700 mt-1">
                  Los costos variables dependen del uso real de tus clientes.
                  Revisa mensualmente y ajusta los precios de los planes si el uso escala.
                </p>
              </div>
            </div>
          ) : null}

          <OwnerPaymentsMetricsPanel />
        </main>
      </div>
    </div>
  )
}
