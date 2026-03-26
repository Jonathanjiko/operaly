"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  FileText,
  Users,
  FolderOpen,
  CheckSquare,
  Zap,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type UsageMonthlyRow = {
  id: string
  client_id: string
  period_yyyymm: string | null
  period_month: string | null
  messages_used: number | null
  tokens_used: number | null
  docs_count: number | null
  storage_used_mb: number | null
  audio_minutes_used: number | null
  research_used: number | null
  automations_used: number | null
  workflows_active: number | null
  chunks_used: number | null
  file_pages_used: number | null
  updated_at: string | null
}

type SubscriptionRow = {
  id: string
  status: string | null
  created_at: string | null
}

export default function ProfessionalAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState("")
  const [usage, setUsage] = useState<UsageMonthlyRow | null>(null)
  const [documentsCount, setDocumentsCount] = useState(0)
  const [contactsCount, setContactsCount] = useState(0)
  const [casesCount, setCasesCount] = useState(0)
  const [tasksCount, setTasksCount] = useState(0)
  const [activeRecurringCount, setActiveRecurringCount] = useState(0)
  const [subscriptionStatus, setSubscriptionStatus] = useState("—")

  const loadAnalytics = async () => {
    setLoading(true)

    try {
      const currentClientId = await getCurrentClientId()
      setClientId(currentClientId)

      const { data: usageRows, error: usageError } = await supabase
        .from("usage_monthly")
        .select("*")
        .eq("client_id", currentClientId)
        .order("updated_at", { ascending: false })
        .limit(1)

      if (usageError) {
        throw usageError
      }

      setUsage((usageRows?.[0] as UsageMonthlyRow) || null)

      const [
        documentsRes,
        contactsRes,
        casesRes,
        tasksRes,
        recurringRes,
        subscriptionsRes,
      ] = await Promise.all([
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("client_id", currentClientId),

        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("client_id", currentClientId),

        supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .eq("client_id", currentClientId),

        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("client_id", currentClientId),

        supabase
          .from("recurring_tasks")
          .select("id", { count: "exact", head: true })
          .eq("client_id", currentClientId)
          .eq("status", "active"),

        supabase
          .from("subscriptions")
          .select("id, status, created_at")
          .eq("client_id", currentClientId)
          .order("created_at", { ascending: false })
          .limit(1),
      ])

      if (documentsRes.error) throw documentsRes.error
      if (contactsRes.error) throw contactsRes.error
      if (casesRes.error) throw casesRes.error
      if (tasksRes.error) throw tasksRes.error
      if (recurringRes.error) throw recurringRes.error
      if (subscriptionsRes.error) throw subscriptionsRes.error

      setDocumentsCount(documentsRes.count || 0)
      setContactsCount(contactsRes.count || 0)
      setCasesCount(casesRes.count || 0)
      setTasksCount(tasksRes.count || 0)
      setActiveRecurringCount(recurringRes.count || 0)

      const lastSubscription = (subscriptionsRes.data?.[0] as SubscriptionRow) || null
      setSubscriptionStatus(lastSubscription?.status || "—")
    } catch (err: any) {
      alert(err.message || "No se pudieron cargar las analíticas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const cards = useMemo(() => {
    return [
      {
        label: "Mensajes usados",
        value: usage?.messages_used ?? 0,
        helper: "uso mensual",
        icon: TrendingUp,
        color: "#3B82F6",
      },
      {
        label: "Tokens usados",
        value: usage?.tokens_used ?? 0,
        helper: "uso mensual",
        icon: BarChart3,
        color: "#06B6D4",
      },
      {
        label: "Documentos",
        value: documentsCount,
        helper: "archivos cargados",
        icon: FileText,
        color: "#7C3AED",
      },
      {
        label: "Contactos",
        value: contactsCount,
        helper: "registrados",
        icon: Users,
        color: "#22C55E",
      },
      {
        label: "Casos",
        value: casesCount,
        helper: "activos e históricos",
        icon: FolderOpen,
        color: "#F59E0B",
      },
      {
        label: "Tareas",
        value: tasksCount,
        helper: "totales",
        icon: CheckSquare,
        color: "#EF4444",
      },
      {
        label: "Automatizaciones",
        value: usage?.automations_used ?? activeRecurringCount,
        helper: "uso o activas",
        icon: Zap,
        color: "#8B5CF6",
      },
      {
        label: "Estado del plan",
        value: subscriptionStatus,
        helper: "suscripción actual",
        icon: TrendingUp,
        color: "#14B8A6",
      },
    ]
  }, [
    usage,
    documentsCount,
    contactsCount,
    casesCount,
    tasksCount,
    activeRecurringCount,
    subscriptionStatus,
  ])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando analíticas...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Analíticas</h1>
          <p className="text-muted-foreground mt-1">
            Métricas reales de uso de tu cuenta Assistant
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-xl"
          onClick={loadAnalytics}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon
                  className="w-5 h-5"
                  style={{ color: card.color }}
                />
              </div>

              <TrendingUp className="w-4 h-4 text-[#34D399]" />
            </div>

            <p className="text-3xl font-bold text-[#0F1F63] break-words">
              {card.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            <p className="text-xs text-[#34D399] mt-2">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-[#0F1F63] mb-5">
            Uso mensual
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.period_yyyymm || usage?.period_month || "Sin registro"}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Storage usado</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.storage_used_mb ?? 0} MB
              </p>
            </div>

            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Páginas procesadas</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.file_pages_used ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Chunks procesados</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.chunks_used ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-[#0F1F63] mb-5">
            Estado de automatizaciones
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Automatizaciones usadas</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.automations_used ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Automatizaciones activas</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {activeRecurringCount}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Workflows activos</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.workflows_active ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/20 border border-border p-4">
              <p className="text-sm text-muted-foreground">Última actualización</p>
              <p className="font-medium text-[#0F1F63] mt-1">
                {usage?.updated_at
                  ? new Date(usage.updated_at).toLocaleString()
                  : "Sin datos"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
