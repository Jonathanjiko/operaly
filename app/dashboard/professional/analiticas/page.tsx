"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Bell,
  CheckSquare,
  Clock,
  FileText,
  FolderOpen,
  HardDrive,
  MessageSquare,
  Mic,
  Plus,
  RefreshCw,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"
import {
  formatPeriodMonthLabel,
  getCurrentPeriodMonth,
  getEffectivePlanCode,
  type EffectiveLimitsRuntime,
} from "@/lib/effective-limits"
import { getDefaultOwnerCatalog, type OwnerCatalogAddon } from "@/lib/owner-catalog"
import {
  fetchDashboardRuntime,
  resolveDashboardPlanCode,
  resolveDashboardPlanLimits,
  type DashboardRuntimePayload,
  toNumber,
} from "@/lib/dashboard-runtime"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { formatLimit, getDisplayPlanName } from "@/lib/plans"

type EffectiveLimits = EffectiveLimitsRuntime & {
  plan: Record<string, any>
  addons: Record<string, any>
  usage: Record<string, any>
  usage_period_month?: string
  limits: {
    calls_minutes_total: number
    storage_gb_total: number
    ia_limit_total: number
    voice_enabled: boolean
    google_enabled: boolean
  }
  period: string
}

type AddOnRow = {
  id: string
  code: string
  addon_type: string
  status: string
  calls_minutes_extra: number | null
  storage_gb_extra: number | null
  enables_voice: boolean | null
  enables_google: boolean | null
  expires_at: string | null
  created_at: string
}

function UsageBar({
  label,
  icon: Icon,
  iconColor,
  used,
  total,
  unit,
  warningAt = 75,
  valueLabel,
}: {
  label: string
  icon: any
  iconColor: string
  used: number
  total: number
  unit: string
  warningAt?: number
  valueLabel?: string
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0
  const barColor = pct >= 90 ? "#EF4444" : pct >= warningAt ? "#F59E0B" : "#3B82F6"
  const formattedTotal = formatLimit(total)
  const usageLabel =
    valueLabel ||
    (formattedTotal === "No incluido"
      ? `${used.toLocaleString()} / ${formattedTotal}`
      : `${used.toLocaleString()} / ${formattedTotal} ${unit}`)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
          <span className="text-sm font-medium text-[#0F1F63]">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{usageLabel}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {pct >= warningAt && total > 0 ? (
        <p className="text-xs font-medium" style={{ color: barColor }}>
          {pct >= 90 ? "Esta cerca del limite. Le conviene activar un extra." : `${Math.round(pct)}% usado`}
        </p>
      ) : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  helper: string
  icon: any
  color: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <TrendingUp className="h-4 w-4 text-[#34D399]" />
      </div>
      <p className="break-words text-3xl font-bold text-[#0F1F63]">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xs text-[#34D399]">{helper}</p>
    </div>
  )
}

function getCommercialPriceHint(billingPeriodLabel: string | null | undefined) {
  const normalized = String(billingPeriodLabel || "").toLowerCase()
  if (normalized.includes("mensual")) return "Se suma a su plan cada mes"
  if (normalized.includes("vigencia") || normalized.includes("mes")) return "Pago unico con uso por 30 dias"
  return "Pago unico"
}

function getCommercialPriceBadge(addon: OwnerCatalogAddon) {
  return addon.category === "storage" ? "Cargo mensual adicional" : "Pago unico"
}

function extractStorageUsedMb(usage: Record<string, any>) {
  return toNumber(
    usage?.storage_used_mb ??
      usage?.storage?.used_mb ??
      usage?.storage?.mb ??
      usage?.storage_mb_used ??
      usage?.storage_usage_mb ??
      usage?.storage?.used
  )
}

function formatStorageUsed(usedMb: number) {
  const roundedMb = Math.max(0, Math.round(usedMb))
  const gbValue = roundedMb / 1024
  if (roundedMb < 1024) return `${roundedMb} MB · ${gbValue.toFixed(2)} GB`
  return `${gbValue.toFixed(2)} GB · ${roundedMb} MB`
}

function formatStorageCapacity(totalGb: number) {
  const gbValue = Math.max(0, Number(totalGb || 0))
  const mbValue = Math.round(gbValue * 1024)
  if (gbValue <= 0) return "No incluido"
  return `${gbValue.toFixed(1)} GB · ${mbValue} MB`
}

export default function ProfessionalAnalyticsPage() {
  const { pricing, isPeru } = usePricingCurrency()
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState("")
  const [limits, setLimits] = useState<EffectiveLimits | null>(null)
  const [addons, setAddons] = useState<AddOnRow[]>([])
  const [catalogAddons, setCatalogAddons] = useState<OwnerCatalogAddon[]>(
    getDefaultOwnerCatalog().addons.filter((addon) => addon.active !== false)
  )
  const [addonLoading, setAddonLoading] = useState<string | null>(null)
  const [addonError, setAddonError] = useState("")
  const [documentsCount, setDocumentsCount] = useState(0)
  const [contactsCount, setContactsCount] = useState(0)
  const [casesCount, setCasesCount] = useState(0)
  const [tasksCount, setTasksCount] = useState(0)
  const [activeRecurringCount, setActiveRecurringCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [storageUsedMb, setStorageUsedMb] = useState(0)
  const [resolvedPlanCode, setResolvedPlanCode] = useState("")

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)
      const { data: clientRow } = await supabase.from("clients").select("plan_code").eq("id", cid).maybeSingle()
      const fallbackPlanCode = String(clientRow?.plan_code || "").trim().toLowerCase() || "trial"

      try {
        const dashboardRuntime = (await fetchDashboardRuntime()) as DashboardRuntimePayload | null
        if (dashboardRuntime) {
          const usage = dashboardRuntime.usage || {}
          const runtimeLimits = resolveDashboardPlanLimits(dashboardRuntime)
          const plan = dashboardRuntime.plan || {}
          const featureAccess = dashboardRuntime.feature_access || runtimeLimits || {}
          const runtimePlanCode = resolveDashboardPlanCode(dashboardRuntime, fallbackPlanCode)
          const numericPlanLimits = dashboardRuntime.user_facing?.plan_limits_numeric || {}
          const resolvedStorageGb =
            toNumber(plan?.storage_gb ?? numericPlanLimits?.storage_gb ?? runtimeLimits?.storage_gb) ||
            toNumber(runtimeLimits?.max_storage_mb) / 1024
          setResolvedPlanCode(runtimePlanCode)

          setLimits({
            effective_plan_code: runtimePlanCode || null,
            plan: {
              ...plan,
              plan_type: runtimePlanCode,
              calls_minutes: toNumber(
                plan?.calls_minutes ?? numericPlanLimits?.audio_minutes ?? runtimeLimits?.max_audio_minutes
              ),
              storage_gb: resolvedStorageGb,
              ia_limit: toNumber(
                plan?.ia_limit ?? numericPlanLimits?.messages ?? runtimeLimits?.max_messages_month
              ),
              automations_limit: toNumber(
                plan?.automations_limit ?? numericPlanLimits?.automations ?? runtimeLimits?.max_automations
              ),
            },
            addons: {},
            usage,
            limits: {
              calls_minutes_total: toNumber(numericPlanLimits?.audio_minutes ?? runtimeLimits?.max_audio_minutes),
              storage_gb_total: resolvedStorageGb,
              ia_limit_total: toNumber(numericPlanLimits?.messages ?? runtimeLimits?.max_messages_month),
              voice_enabled: Boolean(featureAccess?.voice_enabled ?? false),
              google_enabled: Boolean(featureAccess?.google_enabled ?? false),
            },
            period: getCurrentPeriodMonth(),
          } as EffectiveLimits)
          setStorageUsedMb(extractStorageUsedMb(usage))
        } else {
          throw new Error("dashboard_runtime_unavailable")
        }
      } catch (dashboardRuntimeError) {
        console.warn("Error cargando dashboard runtime en analiticas:", dashboardRuntimeError)
        try {
          const { data: limitsData, error: limitsError } = await supabase.rpc("get_client_effective_limits", {
            p_client_id: cid,
          })
          if (!limitsError && limitsData) {
            const rpcLimits = limitsData as EffectiveLimits
            setResolvedPlanCode(
              String(
                rpcLimits?.effective_plan_code ||
                  rpcLimits?.plan?.plan_type ||
                  fallbackPlanCode
              )
                .trim()
                .toLowerCase() || fallbackPlanCode
            )
            setLimits(rpcLimits)
          } else {
            const { data: myLimits } = await supabase.rpc("get_my_effective_limits")
            if (myLimits) {
              const tel = myLimits as any
              const legacyPlanCode =
                String(tel.plan_code || tel.effective_plan_code || fallbackPlanCode).trim().toLowerCase() ||
                fallbackPlanCode
              setResolvedPlanCode(legacyPlanCode)
              setLimits({
                effective_plan_code: legacyPlanCode,
                plan: { plan_type: legacyPlanCode, calls_minutes: tel.max_audio_minutes || 0 },
                addons: {},
                usage: {},
                limits: {
                  calls_minutes_total: tel.max_audio_minutes || 0,
                  storage_gb_total: (tel.max_storage_mb || 0) / 1024,
                  ia_limit_total: tel.max_messages_month || 0,
                  voice_enabled: tel.voice_enabled || false,
                  google_enabled: tel.google_enabled || false,
                },
                usage_period_month: getCurrentPeriodMonth(),
                period: getCurrentPeriodMonth(),
              } as EffectiveLimits)
            }
          }
        } catch (limitsErr) {
          console.warn("Error cargando limites:", limitsErr)
        }
      }

      const { data: addonsData } = await supabase
        .from("add_on_purchases")
        .select("*")
        .eq("client_id", cid)
        .eq("status", "active")
        .order("created_at", { ascending: false })
      setAddons((addonsData || []) as AddOnRow[])

      try {
        const catalogResponse = await fetch("/api/product/catalog", {
          method: "GET",
          cache: "no-store",
        })
        const catalogPayload = await catalogResponse.json().catch(() => ({}))
        const commercialCatalog =
          catalogPayload?.user_facing?.catalog || catalogPayload?.user_facing || catalogPayload?.catalog
        if (catalogResponse.ok && commercialCatalog?.addons) {
          setCatalogAddons(
            ((commercialCatalog.addons || []) as OwnerCatalogAddon[]).filter((addon) => addon.active !== false)
          )
        }
      } catch (catalogError) {
        console.warn("Error cargando catalogo dinamico:", catalogError)
      }

      const [docsRes, contactsRes, casesRes, tasksRes, recurringRes, notifRes] = await Promise.all([
        supabase.from("documents").select("id,file_size_bytes").eq("client_id", cid),
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("client_id", cid),
        supabase.from("cases").select("id", { count: "exact", head: true }).eq("client_id", cid),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("client_id", cid).eq("status", "pending"),
        supabase
          .from("recurring_tasks")
          .select("id", { count: "exact", head: true })
          .eq("client_id", cid)
          .eq("status", "active"),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("client_id", cid)
          .eq("is_read", false),
      ])

      const documentsRows = docsRes.data || []
      const storageFromDocuments = documentsRows.reduce(
        (sum, doc) => sum + toNumber((doc as { file_size_bytes?: number | null }).file_size_bytes),
        0
      ) / 1048576

      setDocumentsCount(documentsRows.length)
      setContactsCount(contactsRes.count || 0)
      setCasesCount(casesRes.count || 0)
      setTasksCount(tasksRes.count || 0)
      setActiveRecurringCount(recurringRes.count || 0)
      setUnreadNotifications(notifRes.count || 0)
      setStorageUsedMb((current) => (current > 0 ? current : storageFromDocuments))
    } catch (err: any) {
      alert(err.message || "No se pudieron cargar las analiticas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAnalytics()
  }, [])

  const usage = limits?.usage || {}
  const lim = limits?.limits || {}
  const plan = limits?.plan || {}
  const periodMonth = String(limits?.usage_period_month || limits?.period || getCurrentPeriodMonth())
  const effectivePlanCode = String(resolvedPlanCode || limits?.effective_plan_code || getEffectivePlanCode(limits) || "trial")
    .trim()
    .toLowerCase() || "trial"
  const totalStorageGb = Number(plan.storage_gb ?? lim.storage_gb_total ?? 0)
  const storageValueLabel = `${formatStorageUsed(storageUsedMb)} / ${formatStorageCapacity(totalStorageGb)}`

  const statsCards = useMemo(
    () => [
      {
        label: "Mensajes IA este mes",
        value: usage.messages_used ?? 0,
        helper: "conversaciones con Operaly",
        icon: MessageSquare,
        color: "#3B82F6",
      },
      {
        label: "Minutos de voz",
        value: `${(usage.audio_minutes_used ?? 0).toFixed(1)} min`,
        helper: "audios y llamadas",
        icon: Mic,
        color: "#7C3AED",
      },
      {
        label: "Espacio ocupado",
        value: formatStorageUsed(storageUsedMb),
        helper: "uso real acumulado",
        icon: HardDrive,
        color: "#06B6D4",
      },
      {
        label: "Documentos cargados",
        value: documentsCount,
        helper: "archivos listos para usar",
        icon: FileText,
        color: "#06B6D4",
      },
      {
        label: "Contactos",
        value: contactsCount,
        helper: "registrados",
        icon: Users,
        color: "#22C55E",
      },
      {
        label: "Tareas pendientes",
        value: tasksCount,
        helper: "activas ahora",
        icon: CheckSquare,
        color: "#F59E0B",
      },
      {
        label: "Casos",
        value: casesCount,
        helper: "activos e historicos",
        icon: FolderOpen,
        color: "#EF4444",
      },
      {
        label: "Automatizaciones",
        value: activeRecurringCount,
        helper: "rutinas activas",
        icon: Zap,
        color: "#8B5CF6",
      },
    ],
    [usage, storageUsedMb, documentsCount, contactsCount, casesCount, tasksCount, activeRecurringCount]
  )

  const catalogAddonsMap = useMemo(() => new Map(catalogAddons.map((addon) => [addon.code, addon])), [catalogAddons])

  const formatAddonPrice = (addon: OwnerCatalogAddon) => pricing.formatCatalogMoney(addon.price, addon.currency)

  const handleAddonCheckout = async (addonCode: string) => {
    if (!clientId) return
    setAddonLoading(addonCode)
    setAddonError("")
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: addonCode, provider: "mercadopago" }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || data?.detail || "checkout_failed")
      const url = data.checkout_url || data.init_point || ""
      if (!url) throw new Error("No se pudo generar el link de pago.")
      window.location.href = url
    } catch (err: any) {
      setAddonError(err.message || "No se pudo iniciar el pago. Intenta nuevamente.")
    } finally {
      setAddonLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Cargando analiticas...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Analiticas y consumo</h1>
          <p className="mt-1 text-muted-foreground">
            Plan <strong>{getDisplayPlanName(effectivePlanCode)}</strong> · Periodo{" "}
            {formatPeriodMonthLabel(periodMonth)}
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={loadAnalytics}>
          <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Una sola lectura de uso</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta vista busca reflejar el mismo estado que usa Operaly en WhatsApp y en el resto del dashboard.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Lo importante primero</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui ve rapido cuanto lleva usado, que extras tiene activos y cuanto margen le queda.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Actualizacion simple</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Si acaba de hacer un cambio, actualice esta pantalla y revise el consumo de nuevo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#3B82F6]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Consumo frente a su plan</h2>
        </div>

        <div className="space-y-5">
          <UsageBar
            label="Mensajes IA"
            icon={MessageSquare}
            iconColor="#3B82F6"
            used={usage.messages_used ?? 0}
            total={lim.ia_limit_total ?? 0}
            unit="mensajes"
          />
          <UsageBar
            label="Minutos de voz"
            icon={Mic}
            iconColor="#7C3AED"
            used={Number((usage.audio_minutes_used ?? 0).toFixed(1))}
            total={lim.calls_minutes_total ?? 0}
            unit="min"
          />
          <UsageBar
            label="Almacenamiento"
            icon={HardDrive}
            iconColor="#06B6D4"
            used={storageUsedMb / 1024}
            total={totalStorageGb}
            unit="GB"
            valueLabel={storageValueLabel}
          />
          <UsageBar
            label="Automatizaciones"
            icon={Zap}
            iconColor="#8B5CF6"
            used={usage.automations_used ?? activeRecurringCount}
            total={plan.automations_limit ?? 0}
            unit="activas"
            warningAt={80}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />
              <h2 className="text-lg font-semibold text-[#0F1F63]">Extras activos</h2>
            </div>
            <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
              {addons.length} activo{addons.length !== 1 ? "s" : ""}
            </span>
          </div>
          {addons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Sin extras activos este periodo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((addon) => {
                const catalogAddon = catalogAddonsMap.get(addon.code)
                const addonName = catalogAddon?.name || addon.addon_type || addon.code
                return (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-[#F0FDF4]/50 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10">
                        <Star className="h-4 w-4 text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0F1F63]">{addonName}</p>
                        <div className="mt-0.5 flex gap-2 text-xs text-muted-foreground">
                          {addon.calls_minutes_extra ? <span>+{addon.calls_minutes_extra} min voz</span> : null}
                          {addon.storage_gb_extra ? <span>+{addon.storage_gb_extra} GB</span> : null}
                          {addon.enables_voice ? <span>Voz</span> : null}
                          {addon.enables_google ? <span>Google</span> : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 px-2 py-1 text-xs font-medium text-[#10B981]">
                        Activo
                      </span>
                      {addon.expires_at ? (
                        <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Vence {new Date(addon.expires_at).toLocaleDateString("es-PE")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#3B82F6]" />
            <h3 className="font-semibold text-[#0F1F63]">Amplie su plan</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {catalogAddons.map((addon) => {
              const displayLabel = formatAddonPrice(addon)
              const isLoading = addonLoading === addon.code
              const color = addon.enables_google
                ? "#34A853"
                : addon.enables_voice
                  ? "#7C3AED"
                  : addon.extra_storage_gb > 0
                    ? "#3B82F6"
                    : "#F59E0B"
              const accentLabel = addon.enables_google
                ? "Google"
                : addon.enables_voice
                  ? "Voz"
                  : addon.extra_storage_gb > 0
                    ? "Espacio"
                    : "Mensajes"

              return (
                <div
                  key={addon.code}
                  className="rounded-xl border border-border bg-background p-4 transition-all hover:border-[#3B82F6]/30 hover:shadow-sm"
                >
                  <div className="mb-2 inline-flex rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {accentLabel}
                  </div>
                  <p className="text-sm font-semibold text-[#0F1F63]">{addon.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{addon.description}</p>
                  <div className="mt-2 inline-flex rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {getCommercialPriceBadge(addon)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    {addon.extra_minutes > 0 ? <span>+{addon.extra_minutes} min</span> : null}
                    {addon.extra_storage_gb > 0 ? <span>+{addon.extra_storage_gb} GB</span> : null}
                    {addon.extra_messages > 0 ? <span>+{addon.extra_messages} mensajes</span> : null}
                    {addon.extra_automations > 0 ? <span>+{addon.extra_automations} auto</span> : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-right">
                      <span className="text-base font-bold text-[#0F1F63]">{displayLabel}</span>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {getCommercialPriceHint(addon.billingPeriodLabel)}
                      </p>
                      {!isPeru ? (
                        <p className="mt-1 text-[10px] text-muted-foreground">Cobro real {pricing.formatPen(addon.price)}</p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleAddonCheckout(addon.code)}
                      disabled={isLoading}
                      className="flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: color }}
                    >
                      {isLoading ? (
                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : null}
                      {isLoading ? "Procesando..." : "Activar"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {addonError ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] p-3">
              <svg className="h-4 w-4 flex-shrink-0 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-[#EF4444]">{addonError}</p>
            </div>
          ) : null}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Los extras de audio y mensajes se pagan una sola vez. El espacio adicional se suma a su plan mensual.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#0F1F63]">Lo que mas esta usando</h2>
          <div className="space-y-3">
            {[
              ["Mensajes con Operaly", usage.messages_used ?? 0, "mensajes"],
              ["Minutos de voz y llamadas", Number((usage.audio_minutes_used ?? 0).toFixed(1)), "min"],
              ["Espacio ocupado", formatStorageUsed(storageUsedMb), ""],
              ["Automatizaciones activas", usage.automations_used ?? activeRecurringCount, "activas"],
              ["Documentos cargados", documentsCount, "documentos"],
              ["Pendientes abiertos", tasksCount, "pendientes"],
            ].map(([label, value, unit]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-3"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-[#0F1F63]">
                  {value} {unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#0F1F63]">Lo que tiene hoy en su plan</h2>
          <div className="space-y-3">
            {[
              ["Plan activo", getDisplayPlanName(effectivePlanCode)],
              [
                "Mensajes incluidos",
                formatLimit(plan.ia_limit) === "No incluido" ? "No incluido" : `${formatLimit(plan.ia_limit)} mensajes`,
              ],
              ["Voz y llamadas", `${plan.calls_minutes ?? 0} min por periodo`],
              ["Almacenamiento", `${formatStorageCapacity(totalStorageGb)} disponibles`],
              [
                "Contactos",
                formatLimit(plan.contacts_limit) === "No incluido" ? "No incluido" : `hasta ${formatLimit(plan.contacts_limit)}`,
              ],
              [
                "Automatizaciones",
                formatLimit(plan.automations_limit) === "No incluido"
                  ? "No incluido"
                  : `hasta ${formatLimit(plan.automations_limit)}`,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-3"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-[#0F1F63]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#D9E1EC] bg-[#F8FAFC] p-4">
            <p className="text-sm font-semibold text-[#0F1F63]">Lectura alineada con su cuenta</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta vista usa el mismo estado que alimenta a Operaly en WhatsApp y al dashboard.
              Si acaba de hacer un cambio, actualice y vuelva a revisar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
