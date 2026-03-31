"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3, FileText, Users, FolderOpen, CheckSquare,
  Zap, TrendingUp, RefreshCw, Mic, Brain, HardDrive,
  MessageSquare, ShoppingBag, Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type EffectiveLimits = {
  plan: Record<string, any>
  addons: Record<string, any>
  usage: Record<string, any>
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

// Progress bar component
function UsageBar({
  label, icon: Icon, iconColor,
  used, total, unit, warningAt = 75,
}: {
  label: string; icon: any; iconColor: string;
  used: number; total: number; unit: string; warningAt?: number;
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0
  const barColor = pct >= 90 ? "#EF4444" : pct >= warningAt ? "#F59E0B" : "#3B82F6"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          <span className="text-sm font-medium text-[#0F1F63]">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {used.toLocaleString()} / {total > 0 ? total.toLocaleString() : "∞"} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {pct >= warningAt && total > 0 && (
        <p className="text-xs font-medium" style={{ color: barColor }}>
          {pct >= 90
            ? "⚠️ Crítico — considera comprar un paquete extra"
            : `📊 ${Math.round(pct)}% usado`}
        </p>
      )}
    </div>
  )
}

// Stat card
function StatCard({ label, value, helper, icon: Icon, color }: {
  label: string; value: string | number; helper: string; icon: any; color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4 text-[#34D399]" />
      </div>
      <p className="text-3xl font-bold text-[#0F1F63] break-words">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      <p className="text-xs text-[#34D399] mt-2">{helper}</p>
    </div>
  )
}

export default function ProfessionalAnalyticsPage() {
  const [loading, setLoading]         = useState(true)
  const [clientId, setClientId]       = useState("")
  const [limits, setLimits]           = useState<EffectiveLimits | null>(null)
  const [addons, setAddons]           = useState<AddOnRow[]>([])
  const [documentsCount, setDocumentsCount] = useState(0)
  const [contactsCount, setContactsCount]   = useState(0)
  const [casesCount, setCasesCount]         = useState(0)
  const [tasksCount, setTasksCount]         = useState(0)
  const [activeRecurringCount, setActiveRecurringCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications]   = useState(0)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      // Effective limits (plan + add-ons + usage via RPC)
      const { data: limitsData } = await supabase
        .rpc("get_client_effective_limits", { p_client_id: cid })
      if (limitsData) setLimits(limitsData as EffectiveLimits)

      // Active add-ons
      const { data: addonsData } = await supabase
        .from("add_on_purchases")
        .select("*")
        .eq("client_id", cid)
        .eq("status", "active")
        .order("created_at", { ascending: false })
      setAddons((addonsData || []) as AddOnRow[])

      // Entity counts
      const [docsRes, contactsRes, casesRes, tasksRes, recurringRes, notifRes] =
        await Promise.all([
          supabase.from("documents").select("id", { count: "exact", head: true }).eq("client_id", cid),
          supabase.from("contacts").select("id", { count: "exact", head: true }).eq("client_id", cid),
          supabase.from("cases").select("id", { count: "exact", head: true }).eq("client_id", cid),
          supabase.from("tasks").select("id", { count: "exact", head: true }).eq("client_id", cid).eq("status", "pending"),
          supabase.from("recurring_tasks").select("id", { count: "exact", head: true }).eq("client_id", cid).eq("status", "active"),
          supabase.from("notifications").select("id", { count: "exact", head: true }).eq("client_id", cid).eq("is_read", false),
        ])

      setDocumentsCount(docsRes.count || 0)
      setContactsCount(contactsRes.count || 0)
      setCasesCount(casesRes.count || 0)
      setTasksCount(tasksRes.count || 0)
      setActiveRecurringCount(recurringRes.count || 0)
      setUnreadNotifications(notifRes.count || 0)

    } catch (err: any) {
      alert(err.message || "No se pudieron cargar las analíticas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAnalytics() }, [])

  const usage   = limits?.usage   || {}
  const lim     = limits?.limits  || {}
  const plan    = limits?.plan    || {}
  const period  = limits?.period  || ""

  const statsCards = useMemo(() => [
    { label: "Mensajes IA este mes", value: usage.messages_used ?? 0,       helper: "conversaciones con Operaly",   icon: MessageSquare, color: "#3B82F6" },
    { label: "Minutos de voz",       value: `${(usage.audio_minutes_used ?? 0).toFixed(1)} min`, helper: "audios y llamadas",          icon: Mic,          color: "#7C3AED" },
    { label: "Documentos cargados",  value: documentsCount,                  helper: "archivos en tu drive",         icon: FileText,     color: "#06B6D4" },
    { label: "Contactos",            value: contactsCount,                   helper: "registrados",                  icon: Users,        color: "#22C55E" },
    { label: "Tareas pendientes",    value: tasksCount,                      helper: "activas ahora",                icon: CheckSquare,  color: "#F59E0B" },
    { label: "Casos",                value: casesCount,                      helper: "activos e históricos",         icon: FolderOpen,   color: "#EF4444" },
    { label: "Automatizaciones",     value: activeRecurringCount,            helper: "tareas recurrentes activas",   icon: Zap,          color: "#8B5CF6" },
    { label: "Notificaciones",       value: unreadNotifications,             helper: "sin leer",                     icon: Bell,         color: "#14B8A6" },
  ], [usage, documentsCount, contactsCount, casesCount, tasksCount, activeRecurringCount, unreadNotifications])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando analíticas...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Analíticas y consumo</h1>
          <p className="text-muted-foreground mt-1">
            Plan <strong>{(plan.plan_type || "trial").toUpperCase()}</strong> · Período {period.slice(0, 4)}/{period.slice(4)}
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={loadAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Usage bars — límites reales */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Consumo vs límite de tu plan</h2>
        </div>

        <div className="space-y-5">
          <UsageBar
            label="Mensajes IA"
            icon={MessageSquare}
            iconColor="#3B82F6"
            used={usage.messages_used ?? 0}
            total={lim.ia_limit_total ?? 0}
            unit="msgs"
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
            used={Math.round((usage.storage_used_mb ?? 0) / 1024 * 100) / 100}
            total={lim.storage_gb_total ?? 0}
            unit="GB"
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

      {/* Add-ons activos */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Add-ons activos</h2>
        </div>

        {addons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No tienes add-ons activos este período.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Puedes comprar minutos extra, storage o integraciones desde WhatsApp o el panel de plan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
                <div>
                  <p className="font-medium text-sm text-[#0F1F63]">{addon.addon_type || addon.code}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    {addon.calls_minutes_extra ? <span>+{addon.calls_minutes_extra} min voz</span> : null}
                    {addon.storage_gb_extra    ? <span>+{addon.storage_gb_extra} GB</span>         : null}
                    {addon.enables_voice       ? <span>🎙️ Voz habilitada</span>                   : null}
                    {addon.enables_google      ? <span>📁 Google habilitado</span>                 : null}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 rounded-lg text-xs font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                    Activo
                  </span>
                  {addon.expires_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vence {new Date(addon.expires_at).toLocaleDateString("es-PE")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detalle técnico */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Uso técnico detallado</h2>
          <div className="space-y-3">
            {[
              ["Tokens usados",         usage.tokens_used        ?? 0, "tokens"],
              ["Storage usado",         `${usage.storage_used_mb ?? 0} MB`, ""],
              ["Investigaciones",       usage.research_used      ?? 0, "búsquedas"],
              ["Páginas procesadas",    usage.file_pages_used    ?? 0, "páginas"],
              ["Chunks IA",             usage.chunks_used        ?? 0, "chunks"],
              ["Workflows activos",     usage.workflows_active   ?? 0, "activos"],
            ].map(([label, value, unit]) => (
              <div key={String(label)} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-sm text-[#0F1F63]">{value} {unit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Tu plan</h2>
          <div className="space-y-3">
            {[
              ["Plan activo",         (plan.plan_type || "trial").toUpperCase()],
              ["Límite IA",           plan.ia_limit ? `${plan.ia_limit} msgs` : "Ilimitado"],
              ["Minutos de voz",      `${plan.calls_minutes ?? 0} min/mes`],
              ["Almacenamiento",      `${plan.storage_gb ?? 0.5} GB`],
              ["Contactos",           plan.contacts_limit ? `hasta ${plan.contacts_limit}` : "—"],
              ["Automatizaciones",    plan.automations_limit ? `hasta ${plan.automations_limit}` : "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-sm text-[#0F1F63]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
