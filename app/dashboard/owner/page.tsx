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
  X,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getClientContext, isOwnerAccount } from "@/lib/client-context"
import OwnerPaymentsMetricsPanel from "./_components/OwnerPaymentsMetricsPanel"

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
  { id: "overview",      label: "Resumen",        icon: BarChart3 },
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

  const loadOwnerDashboard = async (useRefreshing = false) => {
    if (useRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    const withTimeout = async <T,>(promise: Promise<T>, ms = 12000): Promise<T> => {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          setTimeout(() => reject(new Error("timeout")), ms)
        }),
      ])
    }

    try {
      const { data: authData, error: authError } = await withTimeout(supabase.auth.getUser())

      if (authError) {
        throw authError
      }

      const user = authData.user

      if (!user) {
        throw new Error("No hay sesión activa.")
      }

      const { clientId } = await getClientContext()
      const ownerAllowed = await isOwnerAccount(clientId)

      if (!ownerAllowed) {
        throw new Error("No tienes permisos para ver este panel.")
      }

      const metadata = user.user_metadata || {}

      setOwnerProfile({
        fullName: String(metadata.full_name || "Operaly Owner"),
        email: String(user.email || ""),
      })

      let nextSummary: SummaryRow | null = null
      let nextPayments: PaymentRow[] = []
      let nextSubscriptions: SubscriptionRow[] = []
      let nextClients: ClientRow[] = []

      try {
        const [summaryResponse, paymentsResponse, subscriptionsResponse, clientsResponse] = await Promise.all([
          withTimeout(supabase.rpc("owner_dashboard_summary"), 12000),
          withTimeout(supabase.rpc("owner_recent_payments", { p_limit: 50 }), 12000),
          withTimeout(supabase.rpc("owner_recent_subscriptions", { p_limit: 50 }), 12000),
          withTimeout(supabase.rpc("owner_clients_list", { p_limit: 100 }), 12000),
        ])

        if (summaryResponse.error) throw summaryResponse.error
        if (paymentsResponse.error) throw paymentsResponse.error
        if (subscriptionsResponse.error) throw subscriptionsResponse.error
        if (clientsResponse.error) throw clientsResponse.error

        nextSummary = (summaryResponse.data || null) as SummaryRow | null
        nextPayments = (paymentsResponse.data || []) as PaymentRow[]
        nextSubscriptions = (subscriptionsResponse.data || []) as SubscriptionRow[]
        nextClients = (clientsResponse.data || []) as ClientRow[]
      } catch {
        const [directClientsResponse, directPaymentsResponse, directSubscriptionsResponse] = await Promise.all([
          withTimeout(
            supabase
              .from("clients")
              .select("id, name, email, phone, country_code, city, timezone, plan_code, plan_status, status, created_at")
              .order("created_at", { ascending: false })
              .limit(100),
            12000
          ),
          withTimeout(
            supabase
              .from("payments")
              .select("id, client_id, status, amount_usd, currency, provider, provider_ref, paid_at, created_at")
              .order("created_at", { ascending: false })
              .limit(100),
            12000
          ),
          withTimeout(
            supabase
              .from("subscriptions")
              .select("id, client_id, plan_code, status, current_period_end, started_at, created_at")
              .order("created_at", { ascending: false })
              .limit(100),
            12000
          ),
        ])

        if (directClientsResponse.error) throw directClientsResponse.error
        if (directPaymentsResponse.error) throw directPaymentsResponse.error
        if (directSubscriptionsResponse.error) throw directSubscriptionsResponse.error

        nextClients = ((directClientsResponse.data || []) as any[]).map((row) => ({
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
        }))

        const clientMap = new Map(nextClients.map((client) => [client.id, client]))

        nextPayments = ((directPaymentsResponse.data || []) as any[]).map((row) => {
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
            amount: Number(row.amount_usd || 0),
            currency_code: String(row.currency || "PEN"),
            payment_method: row.provider ?? null,
            payment_method_brand: null,
            order_number: row.provider_ref ?? null,
            transaction_id: row.provider_ref ?? null,
            created_at: row.paid_at || row.created_at,
          }
        })

        nextSubscriptions = ((directSubscriptionsResponse.data || []) as any[]).map((row) => {
          const client = clientMap.get(String(row.client_id))
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
            currency_code: String(row.currency || "PEN"),
            current_period_start: row.started_at ?? null,
            current_period_end: row.current_period_end ?? null,
            created_at: row.created_at,
          }
        })

        const approvedPayments = nextPayments.filter((payment) =>
          ["approved", "paid", "succeeded"].includes(String(payment.status || "").toLowerCase())
        )
        const pendingPayments = nextPayments.filter(
          (payment) => String(payment.status || "").toLowerCase() === "pending"
        )
        const failedPayments = nextPayments.filter((payment) =>
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

        nextSummary = {
          total_clients: nextClients.length,
          active_clients: nextClients.filter((client) => String(client.status || "").toLowerCase() === "active").length,
          trial_clients: nextClients.filter((client) => String(client.plan_code || "").toLowerCase() === "trial").length,
          paid_clients: nextClients.filter((client) => ["core", "pro", "pro_plus"].includes(String(client.plan_code || "").toLowerCase())).length,
          pro_plus_clients: nextClients.filter((client) => String(client.plan_code || "").toLowerCase() === "pro_plus").length,
          payments_approved_total: approvedPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
          payments_pending_total: pendingPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
          payments_failed_total: failedPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
          payments_today_total: approvedPayments.filter((item) => new Date(item.created_at) >= todayStart).reduce((acc, item) => acc + Number(item.amount || 0), 0),
          payments_week_total: approvedPayments.filter((item) => new Date(item.created_at) >= weekStart).reduce((acc, item) => acc + Number(item.amount || 0), 0),
          payments_month_total: approvedPayments.filter((item) => new Date(item.created_at) >= monthStart).reduce((acc, item) => acc + Number(item.amount || 0), 0),
          subscriptions_active: nextSubscriptions.filter((item) => String(item.status || "").toLowerCase() === "active").length,
          subscriptions_pending: nextSubscriptions.filter((item) => String(item.status || "").toLowerCase() === "pending").length,
          subscriptions_cancelled: nextSubscriptions.filter((item) => String(item.status || "").toLowerCase() === "cancelled").length,
        }
      }

      setSummary(nextSummary)
      setPayments(nextPayments)
      setSubscriptions(nextSubscriptions)
      setClients(nextClients)

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
      const { error } = await supabase.rpc("owner_set_client_plan", {
        p_client_id: clientId,
        p_plan_code: planCode,
        p_plan_status: "active",
      })

      if (error) {
        throw error
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
      const { error } = await supabase.rpc("owner_set_client_status", {
        p_client_id: clientId,
        p_status: nextStatus,
      })

      if (error) {
        throw error
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
  }, [clients, clientSearch])

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
      (acc, payment) => acc + Number(payment.amount || 0),
      0
    )

    const pendingTotal = pendingPayments.reduce(
      (acc, payment) => acc + Number(payment.amount || 0),
      0
    )

    const failedTotal = failedPayments.reduce(
      (acc, payment) => acc + Number(payment.amount || 0),
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
      },
      {
        title: "Pagos pendientes",
        value: formatMoney(filteredOverview.pendingTotal),
        icon: Wallet,
      },
      {
        title: "Pagos fallidos",
        value: formatMoney(filteredOverview.failedTotal),
        icon: CreditCard,
      },
      {
        title: "Clientes visibles",
        value: String(filteredClients.length),
        icon: Users,
      },
      {
        title: "Pagos aprobados",
        value: String(filteredOverview.approvedPayments.length),
        icon: BarChart3,
      },
      {
        title: "Suscripciones activas",
        value: String(filteredOverview.activeSubscriptions.length),
        icon: ShieldCheck,
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
                      Tu cuenta está marcada como owner, con plan Pro Plus interno activo.
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
                  <p className="text-2xl font-semibold text-[#0F1F63]">Pro Plus</p>
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
            </div>
          ) : null}

          {activeSection === "overview" ? (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {overviewCards.map((card) => {
                  const Icon = card.icon

                  return (
                    <div
                      key={card.title}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-slate-500">{card.title}</p>
                        <Icon className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <p className="text-3xl font-semibold text-[#0F1F63]">
                        {card.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              {summary ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Trials</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {summary.trial_clients}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Pro Plus</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {summary.pro_plus_clients}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Pagos pendientes</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {formatMoney(filteredOverview.pendingTotal)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Pagos fallidos</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {formatMoney(filteredOverview.failedTotal)}
                    </p>
                  </div>
                </div>
              ) : null}
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
                        </div>

                        <div className="flex items-center gap-3">
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
                            {selectedClient.plan_code || "—"}
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
