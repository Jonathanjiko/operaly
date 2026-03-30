"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Layers3,
  RefreshCcw,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type FunnelTotals = {
  rows: number
  initiated: number
  checkout_created: number
  payment_confirmed: number
  payment_pending: number
  payment_rejected: number
  subscription_authorized: number
  subscription_pending: number
  subscription_rejected: number
  error: number
  revenue_confirmed_usd: number
}

type FunnelConversion = {
  checkout_to_confirmed: number
  initiated_to_confirmed: number
  initiated_to_checkout: number
  error_rate: number
}

type FunnelHealth = {
  confirmed_total: number
  pending_total: number
  rejected_total: number
}

type FunnelByItem = {
  item_code: string
  initiated: number
  checkout_created: number
  payment_confirmed: number
  payment_pending: number
  payment_rejected: number
  subscription_authorized: number
  subscription_pending: number
  subscription_rejected: number
  error: number
  revenue_confirmed_usd: number
}

type FunnelByProvider = {
  provider: string
  initiated: number
  checkout_created: number
  payment_confirmed: number
  payment_pending: number
  payment_rejected: number
  subscription_authorized: number
  subscription_pending: number
  subscription_rejected: number
  error: number
  revenue_confirmed_usd: number
}

type FunnelDaily = {
  date: string
  initiated: number
  checkout_created: number
  payment_confirmed: number
  payment_pending: number
  payment_rejected: number
  subscription_authorized: number
  subscription_pending: number
  subscription_rejected: number
  error: number
  revenue_confirmed_usd: number
}

type FunnelResponse = {
  ok: boolean
  days: number
  since: string
  totals: FunnelTotals
  conversion: FunnelConversion
  health: FunnelHealth
  by_item: FunnelByItem[]
  by_provider: FunnelByProvider[]
  daily: FunnelDaily[]
  error?: string
}

function formatMoney(value: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value || 0)
  } catch {
    return `USD ${value || 0}`
  }
}

function formatPercent(value: number) {
  return `${((value || 0) * 100).toFixed(1)}%`
}

function labelItemCode(itemCode: string) {
  const value = String(itemCode || "").trim().toLowerCase()

  const labels: Record<string, string> = {
    core: "Operaly Core",
    pro: "Operaly Pro",
    pro_plus: "Operaly Pro+",
    addon_storage_5gb: "+5 GB almacenamiento",
    addon_storage_20gb: "+20 GB almacenamiento",
    addon_conv_2000: "+2,000 conversaciones",
    addon_audio_60: "+60 min de audio",
  }

  return labels[value] || value || "Item"
}

function labelProvider(provider: string) {
  const value = String(provider || "").trim().toLowerCase()

  if (value === "mercadopago") return "Mercado Pago"
  if (value === "stripe") return "Stripe"

  return provider || "N/D"
}

function maxOf(values: number[]) {
  return Math.max(1, ...values)
}

export default function OwnerPaymentsMetricsPanel() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<FunnelResponse | null>(null)

  const fetchMetrics = async (isRefresh = false, nextDays?: number) => {
    const targetDays = nextDays ?? days

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError("")

    try {
      const res = await fetch(`/owner/metrics/payments-funnel?days=${targetDays}`, {
        method: "GET",
        cache: "no-store",
      })

      const payload = await res.json()

      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.detail || payload?.error || "metrics_failed")
      }

      setData(payload)
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las métricas.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMetrics(false, days)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const topItem = useMemo(() => {
    if (!data?.by_item?.length) return null
    return data.by_item[0]
  }, [data])

  const topProvider = useMemo(() => {
    if (!data?.by_provider?.length) return null
    return data.by_provider[0]
  }, [data])

  const pieData = useMemo(() => {
    const confirmed = data?.health?.confirmed_total ?? 0
    const pending = data?.health?.pending_total ?? 0
    const rejected = data?.health?.rejected_total ?? 0
    const total = confirmed + pending + rejected

    return {
      confirmed,
      pending,
      rejected,
      total,
      confirmedPct: total > 0 ? (confirmed / total) * 100 : 0,
      pendingPct: total > 0 ? (pending / total) * 100 : 0,
      rejectedPct: total > 0 ? (rejected / total) * 100 : 0,
    }
  }, [data])

  const dailyMax = useMemo(() => {
    return maxOf(
      (data?.daily || []).map(
        (row) =>
          row.payment_confirmed +
          row.subscription_authorized +
          row.payment_pending +
          row.subscription_pending +
          row.error
      )
    )
  }, [data])

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Payments Analytics
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Métricas de pagos
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Este módulo complementa el owner dashboard actual con funnel, salud
              operativa, revenue confirmado y rendimiento por item/provider.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {[7, 30, 90].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDays(value)}
                className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                  days === value
                    ? "border-[#0F1F63] bg-[#0F1F63] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {value} días
              </button>
            ))}

            <Button
              onClick={() => fetchMetrics(true)}
              disabled={refreshing}
              variant="outline"
              className="h-11 rounded-2xl border-slate-300"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-700" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  No se pudieron cargar las métricas
                </p>
                <p className="mt-1 text-sm leading-6 text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">Cargando métricas del funnel...</p>
          </div>
        ) : null}

        {!loading && data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Intentos</p>
                </div>
                <p className="text-3xl font-semibold text-slate-950">
                  {data.totals.initiated}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Inicios de checkout registrados.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Checkout creados</p>
                </div>
                <p className="text-3xl font-semibold text-slate-950">
                  {data.totals.checkout_created}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Sesiones generadas correctamente.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Confirmados</p>
                </div>
                <p className="text-3xl font-semibold text-slate-950">
                  {data.health.confirmed_total}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Pagos o suscripciones confirmados.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Revenue confirmado</p>
                </div>
                <p className="text-3xl font-semibold text-slate-950">
                  {formatMoney(data.totals.revenue_confirmed_usd)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Confirmado por webhook / estados finales.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-950">
                    Funnel y conversiones
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Initiated → Checkout
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {formatPercent(data.conversion.initiated_to_checkout)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Checkout → Confirmed
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {formatPercent(data.conversion.checkout_to_confirmed)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Initiated → Confirmed
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {formatPercent(data.conversion.initiated_to_confirmed)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Error rate
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {formatPercent(data.conversion.error_rate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-950">
                    Salud operativa
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      <span className="text-sm font-medium text-emerald-900">
                        Confirmados
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-emerald-900">
                      {data.health.confirmed_total}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-amber-700" />
                      <span className="text-sm font-medium text-amber-900">
                        Pendientes
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-amber-900">
                      {data.health.pending_total}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-700" />
                      <span className="text-sm font-medium text-red-900">
                        Rechazados
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-red-900">
                      {data.health.rejected_total}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-slate-900">
                    Distribución visual
                  </p>

                  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="flex h-full w-full">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${pieData.confirmedPct}%` }}
                      />
                      <div
                        className="bg-amber-400"
                        style={{ width: `${pieData.pendingPct}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${pieData.rejectedPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Confirmados</span>
                      <span className="font-medium">
                        {data.health.confirmed_total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pendientes</span>
                      <span className="font-medium">
                        {data.health.pending_total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rechazados</span>
                      <span className="font-medium">
                        {data.health.rejected_total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-950">
                    Rendimiento por item
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="px-3 py-3 font-medium">Item</th>
                        <th className="px-3 py-3 font-medium">Init</th>
                        <th className="px-3 py-3 font-medium">Checkouts</th>
                        <th className="px-3 py-3 font-medium">Confirmed</th>
                        <th className="px-3 py-3 font-medium">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.by_item.map((row) => (
                        <tr key={row.item_code} className="border-b border-slate-100">
                          <td className="px-3 py-3 text-slate-900">
                            {labelItemCode(row.item_code)}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{row.initiated}</td>
                          <td className="px-3 py-3 text-slate-700">{row.checkout_created}</td>
                          <td className="px-3 py-3 text-slate-700">
                            {row.payment_confirmed + row.subscription_authorized}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{row.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-950">
                    Rendimiento por provider
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="px-3 py-3 font-medium">Provider</th>
                        <th className="px-3 py-3 font-medium">Init</th>
                        <th className="px-3 py-3 font-medium">Pending</th>
                        <th className="px-3 py-3 font-medium">Confirmed</th>
                        <th className="px-3 py-3 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.by_provider.map((row) => (
                        <tr key={row.provider} className="border-b border-slate-100">
                          <td className="px-3 py-3 text-slate-900">
                            {labelProvider(row.provider)}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{row.initiated}</td>
                          <td className="px-3 py-3 text-slate-700">
                            {row.payment_pending + row.subscription_pending}
                          </td>
                          <td className="px-3 py-3 text-slate-700">
                            {row.payment_confirmed + row.subscription_authorized}
                          </td>
                          <td className="px-3 py-3 text-slate-700">
                            {formatMoney(row.revenue_confirmed_usd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-950">
                  Serie diaria
                </h3>
              </div>

              <div className="space-y-4">
                {(data.daily || []).map((row) => {
                  const value =
                    row.payment_confirmed +
                    row.subscription_authorized +
                    row.payment_pending +
                    row.subscription_pending +
                    row.error

                  const width = `${(value / dailyMax) * 100}%`

                  return (
                    <div key={row.date}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium text-slate-900">{row.date}</span>
                        <span className="text-slate-600">
                          Init {row.initiated} · Checkout {row.checkout_created} · Confirmed{" "}
                          {row.payment_confirmed + row.subscription_authorized} · Errors {row.error}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#0F1F63]"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Top item
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {topItem ? labelItemCode(topItem.item_code) : "Sin datos"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {topItem
                    ? `${topItem.initiated} intentos · ${topItem.payment_confirmed + topItem.subscription_authorized} confirmados`
                    : "Todavía no hay actividad suficiente."}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Provider principal
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {topProvider ? labelProvider(topProvider.provider) : "Sin datos"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {topProvider
                    ? `${topProvider.initiated} intentos · ${formatMoney(topProvider.revenue_confirmed_usd)} confirmados`
                    : "Todavía no hay actividad suficiente."}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
