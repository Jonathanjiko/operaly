"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Layers3,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Settings,
  ArrowRight,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

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

const BILLING_CURRENCY_CODE = "USD"

const SECTIONS = [
  { id: "workspace", label: "Mi Operaly", icon: Sparkles },
  { id: "overview", label: "Resumen", icon: BarChart3 },
  { id: "payments", label: "Pagos", icon: CreditCard },
  { id: "subscriptions", label: "Suscripciones", icon: Layers3 },
  { id: "clients", label: "Clientes", icon: Users },
] as const

const ADMIN_PLANS = ["trial", "core", "pro", "pro_plus"] as const
type AdminPlan = (typeof ADMIN_PLANS)[number]

export default function OwnerDashboardPage() {
  const router = useRouter()

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

  const formatMoney = (amount: number | null | undefined) => {
    const numericAmount = Number(amount || 0)

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: BILLING_CURRENCY_CODE,
      }).format(numericAmount)
    } catch {
      return `${BILLING_CURRENCY_CODE} ${numericAmount}`
    }
  }

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

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        throw authError
      }

      const user = authData.user

      if (!user) {
        throw new Error("No hay sesión activa.")
      }

      const metadata = user.user_metadata || {}
      const appMetadata = user.app_metadata || {}
      const isOwner =
        Boolean(metadata.operaly_owner) ||
        Boolean(metadata.owner_mode) ||
        Boolean(appMetadata.operaly_owner)

      if (!isOwner) {
        throw new Error("No tienes permisos para ver este panel.")
      }

      setOwnerProfile({
        fullName: String(metadata.full_name || "Operaly Owner"),
        email: String(user.email || ""),
      })

      const [
        summaryResponse,
        paymentsResponse,
        subscriptionsResponse,
        clientsResponse,
      ] = await Promise.all([
        supabase.rpc("owner_dashboard_summary"),
        supabase.rpc("owner_recent_payments", { p_limit: 20 }),
        supabase.rpc("owner_recent_subscriptions", { p_limit: 20 }),
        supabase.rpc("owner_clients_list", { p_limit: 50 }),
      ])

      if (summaryResponse.error) {
        throw summaryResponse.error
      }

      if (paymentsResponse.error) {
        throw paymentsResponse.error
      }

      if (subscriptionsResponse.error) {
        throw subscriptionsResponse.error
      }

      if (clientsResponse.error) {
        throw clientsResponse.error
      }

      setSummary((summaryResponse.data || null) as SummaryRow | null)
      setPayments((paymentsResponse.data || []) as PaymentRow[])
      setSubscriptions((subscriptionsResponse.data || []) as SubscriptionRow[])
      setClients((clientsResponse.data || []) as ClientRow[])
    } catch (error: any) {
      alert(error.message || "No se pudo cargar el panel owner.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOwnerDashboard()
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

  const overviewCards = useMemo(() => {
    if (!summary) {
      return []
    }

    return [
      {
        title: "Ingresos hoy",
        value: formatMoney(summary.payments_today_total),
        icon: DollarSign,
      },
      {
        title: "Ingresos semana",
        value: formatMoney(summary.payments_week_total),
        icon: DollarSign,
      },
      {
        title: "Ingresos mes",
        value: formatMoney(summary.payments_month_total),
        icon: DollarSign,
      },
      {
        title: "Clientes totales",
        value: String(summary.total_clients),
        icon: Users,
      },
      {
        title: "Clientes de pago",
        value: String(summary.paid_clients),
        icon: Users,
      },
      {
        title: "Suscripciones activas",
        value: String(summary.subscriptions_active),
        icon: ShieldCheck,
      },
    ]
  }, [summary])

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
                  desde un mismo lugar, sin salir de la experiencia principal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white">
                <p className="text-sm font-medium">{ownerProfile.fullName}</p>
                <p className="text-xs text-white/80">{ownerProfile.email}</p>
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
                      Entra a tu workspace principal para usar agenda, tareas, documentos y más.
                    </p>
                    <Button
                      className="rounded-xl bg-[#0F1F63] hover:bg-[#132672] text-white"
                      onClick={() => router.push("/dashboard/professional")}
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
                      Ajusta timezone, idioma, perfil y preferencias de tu cuenta personal.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => router.push("/dashboard/professional/configuracion")}
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
                      {formatMoney(summary.payments_pending_total)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm text-slate-500 mb-2">Pagos fallidos</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {formatMoney(summary.payments_failed_total)}
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
                {payments.map((payment) => (
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
                          {formatMoney(payment.amount)}
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

                {payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No hay pagos registrados todavía.
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
                {subscriptions.map((subscription) => (
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
                          {formatMoney(subscription.amount)}
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

                {subscriptions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No hay suscripciones registradas todavía.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSection === "clients" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-[#3B82F6]" />
                <h2 className="text-xl font-semibold text-[#0F1F63]">
                  Clientes y control manual
                </h2>
              </div>

              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
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
                          <p className="text-xs text-slate-500 mt-2">
                            Alta: {formatDateTime(client.created_at)}
                          </p>
                        </div>

                        <div className="text-left xl:text-right">
                          <p className="text-sm font-medium text-[#0F1F63]">
                            Plan: {client.plan_code || "—"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Estado plan: {client.plan_status || "—"}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mt-3 ${clientStatusClass(
                              client.status
                            )}`}
                          >
                            {client.status || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
                        <div className="flex flex-wrap gap-2">
                          {ADMIN_PLANS.map((planCode) => {
                            const loadingKey = `plan:${client.id}:${planCode}`
                            const isCurrent = client.plan_code === planCode

                            return (
                              <Button
                                key={planCode}
                                variant={isCurrent ? "secondary" : "outline"}
                                className="rounded-xl"
                                disabled={Boolean(actionLoadingKey) || isCurrent}
                                onClick={() => runPlanChange(client.id, planCode)}
                              >
                                {actionLoadingKey === loadingKey
                                  ? "Actualizando..."
                                  : `Plan ${planCode}`}
                              </Button>
                            )
                          })}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={Boolean(actionLoadingKey) || client.status === "active"}
                            onClick={() => runStatusChange(client.id, "active")}
                          >
                            {actionLoadingKey === `status:${client.id}:active`
                              ? "Actualizando..."
                              : "Activar"}
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={Boolean(actionLoadingKey) || client.status === "blocked"}
                            onClick={() => runStatusChange(client.id, "blocked")}
                          >
                            {actionLoadingKey === `status:${client.id}:blocked`
                              ? "Actualizando..."
                              : "Bloquear"}
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={Boolean(actionLoadingKey) || client.status === "inactive"}
                            onClick={() => runStatusChange(client.id, "inactive")}
                          >
                            {actionLoadingKey === `status:${client.id}:inactive`
                              ? "Actualizando..."
                              : "Dar de baja"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {clients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No hay clientes todavía.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
