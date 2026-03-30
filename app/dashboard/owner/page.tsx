"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Layers3,
  ShieldCheck,
  Users,
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

const BILLING_CURRENCY_CODE = "USD"

const SECTIONS = [
  { id: "overview", label: "Resumen", icon: BarChart3 },
  { id: "payments", label: "Pagos", icon: CreditCard },
  { id: "subscriptions", label: "Suscripciones", icon: Layers3 },
  { id: "clients", label: "Clientes", icon: Users },
]

export default function OwnerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview")
  const [summary, setSummary] = useState<SummaryRow | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [ownerName, setOwnerName] = useState("Operaly Owner")
  const [ownerEmail, setOwnerEmail] = useState("")

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

  useEffect(() => {
    let cancelled = false

    const loadOwnerDashboard = async () => {
      setLoading(true)

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

        setOwnerName(String(metadata.full_name || "Operaly Owner"))
        setOwnerEmail(String(user.email || ""))

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

        if (!cancelled) {
          setSummary((summaryResponse.data || null) as SummaryRow | null)
          setPayments((paymentsResponse.data || []) as PaymentRow[])
          setSubscriptions((subscriptionsResponse.data || []) as SubscriptionRow[])
          setClients((clientsResponse.data || []) as ClientRow[])
        }
      } catch (error: any) {
        if (!cancelled) {
          alert(error.message || "No se pudo cargar el panel owner.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOwnerDashboard()

    return () => {
      cancelled = true
    }
  }, [])

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
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-[#3B82F6]">Operaly Owner Console</p>
          <h1 className="text-3xl font-bold text-[#0F1F63] mt-1">
            Panel privado del negocio
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualiza ventas, suscripciones, clientes y comportamiento comercial de Operaly.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-sm font-medium text-[#0F1F63]">{ownerName}</p>
          <p className="text-xs text-muted-foreground">{ownerEmail}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="bg-card rounded-2xl border border-border p-4 h-fit">
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
                      : "bg-secondary/20 text-foreground hover:bg-secondary/40"
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
          {activeSection === "overview" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {overviewCards.map((card) => {
                  const Icon = card.icon

                  return (
                    <div
                      key={card.title}
                      className="bg-card rounded-2xl border border-border p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <Icon className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#0F1F63]">
                        {card.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              {summary ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm text-muted-foreground mb-2">Trials</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {summary.trial_clients}
                    </p>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm text-muted-foreground mb-2">Pro Plus</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {summary.pro_plus_clients}
                    </p>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm text-muted-foreground mb-2">Pagos pendientes</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {formatMoney(summary.payments_pending_total)}
                    </p>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm text-muted-foreground mb-2">Pagos fallidos</p>
                    <p className="text-2xl font-semibold text-[#0F1F63]">
                      {formatMoney(summary.payments_failed_total)}
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {activeSection === "payments" ? (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold text-[#0F1F63] mb-6">
                Pagos recientes
              </h2>

              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {payment.client_name || "Cliente sin nombre"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {payment.client_phone || "Sin teléfono"} ·{" "}
                          {payment.country_code || "—"} · {payment.city || "—"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Plan: {payment.plan_code || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Orden: {payment.order_number || "—"} · TX:{" "}
                          {payment.transaction_id || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha: {formatDateTime(payment.created_at)}
                        </p>
                      </div>

                      <div className="text-left xl:text-right">
                        <p className="text-xl font-semibold text-[#0F1F63]">
                          {formatMoney(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {payment.payment_method_brand || payment.payment_method || "Método no informado"}
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
                  <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    No hay pagos registrados todavía.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSection === "subscriptions" ? (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold text-[#0F1F63] mb-6">
                Suscripciones recientes
              </h2>

              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {subscription.client_name || "Cliente sin nombre"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subscription.client_phone || "Sin teléfono"} ·{" "}
                          {subscription.country_code || "—"} · {subscription.city || "—"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Plan: {subscription.plan_code}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
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
                  <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    No hay suscripciones registradas todavía.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSection === "clients" ? (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold text-[#0F1F63] mb-6">
                Clientes recientes
              </h2>

              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {client.name || "Cliente sin nombre"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {client.email || "Sin email"} · {client.phone || "Sin teléfono"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {client.country_code || "—"} · {client.city || "—"} ·{" "}
                          {client.timezone || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Alta: {formatDateTime(client.created_at)}
                        </p>
                      </div>

                      <div className="text-left xl:text-right">
                        <p className="text-sm font-medium text-[#0F1F63]">
                          Plan: {client.plan_code || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Estado plan: {client.plan_status || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Estado cuenta: {client.status || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {clients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
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
