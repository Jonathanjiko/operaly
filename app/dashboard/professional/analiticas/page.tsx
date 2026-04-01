"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3, FileText, Users, FolderOpen, CheckSquare,
  Zap, TrendingUp, RefreshCw, Mic, Brain, HardDrive,
  MessageSquare, ShoppingBag, Bell, Plus, Clock, Star,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

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
  const [addonLoading, setAddonLoading] = useState<string | null>(null)
  const { pricing } = usePricingCurrency()
  const [addonError, setAddonError]   = useState("")
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

      // Effective limits — RPC con fallback a tenant_effective_limits directo
      try {
        const { data: limitsData, error: limitsError } = await supabase
          .rpc("get_client_effective_limits", { p_client_id: cid })
        if (!limitsError && limitsData) {
          setLimits(limitsData as EffectiveLimits)
        } else {
          // Fallback via RPC segura (evita 403 en tenant_effective_limits)
          try {
            const { data: myLimits } = await supabase.rpc("get_my_effective_limits")
            if (myLimits) {
              const tel = myLimits as any
              setLimits({
                plan: { plan_type: tel.plan_code, calls_minutes: tel.max_audio_minutes || 0 },
                addons: {},
                usage: {},
                limits: {
                  calls_minutes_total: (tel.max_audio_minutes || 0),
                  storage_gb_total:    (tel.max_storage_mb || 0) / 1024,
                  ia_limit_total:      (tel.max_messages_month || 0),
                  voice_enabled:       tel.voice_enabled || false,
                  google_enabled:      tel.google_enabled || false,
                },
                period: new Date().toISOString().slice(0,7).replace("-",""),
              } as EffectiveLimits)
            }
          } catch (_) {}
        }
      } catch (limitsErr) {
        console.warn("Error cargando límites:", limitsErr)
      }

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

  const handleAddonCheckout = async (addonCode: string) => {
    if (!clientId) return
    setAddonLoading(addonCode)
    setAddonError("")
    try {
      // Get email from Supabase session for backend fallback
      let clientEmail = ""
      try {
        const { data: { user } } = await supabase.auth.getUser()
        clientEmail = user?.email || ""
      } catch {}

      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, planCode: addonCode, provider: "mercadopago", email: clientEmail || undefined }),
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

      {/* Add-ons activos + disponibles */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-semibold text-[#0F1F63]">Add-ons activos</h2>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
              {addons.length} activo{addons.length !== 1 ? "s" : ""}
            </span>
          </div>
          {addons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin add-ons activos este período</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-[#F0FDF4]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#0F1F63]">{addon.addon_type || addon.code}</p>
                      <div className="flex gap-2 mt-0.5 text-xs text-muted-foreground">
                        {addon.calls_minutes_extra ? <span>+{addon.calls_minutes_extra} min voz</span> : null}
                        {addon.storage_gb_extra    ? <span>+{addon.storage_gb_extra} GB</span>         : null}
                        {addon.enables_voice       ? <span>🎙️ Voz</span>                              : null}
                        {addon.enables_google      ? <span>📁 Google</span>                            : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Activo</span>
                    {addon.expires_at && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />Vence {new Date(addon.expires_at).toLocaleDateString("es-PE")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="font-semibold text-[#0F1F63]">Amplía tu plan</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { code: "addon_voice_100", icon: "🎙️", name: "Minutos de voz", desc: "+100 min para audios y llamadas", priceUSD: 10, pricePEN: 50, color: "#7C3AED" },
              { code: "addon_storage_5gb", icon: "💾", name: "Almacenamiento", desc: "+10 GB para documentos",         priceUSD: 5,  pricePEN: 25, color: "#3B82F6" },
              { code: "addon_google",      icon: "📁", name: "Google Suite",   desc: "Drive, Gmail y Calendar",        priceUSD: 8,  pricePEN: 40, color: "#34A853" },
            ].map(addon => {
              const displayPrice = pricing.currency === "PEN" ? addon.pricePEN : addon.priceUSD
              const displayLabel = pricing.fmt(displayPrice)
              const isLoading = addonLoading === addon.code
              return (
                <div key={addon.code} className="rounded-xl border border-border bg-background p-4 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all">
                  <div className="text-2xl mb-2">{addon.icon}</div>
                  <p className="font-semibold text-sm text-[#0F1F63]">{addon.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{addon.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-[#0F1F63]">{displayLabel}<span className="text-xs text-muted-foreground font-normal">/mes</span></span>
                    <button
                      onClick={() => handleAddonCheckout(addon.code)}
                      disabled={isLoading}
                      className="h-7 px-3 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
                      style={{ backgroundColor: addon.color }}
                    >
                      {isLoading && (
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {isLoading ? "Procesando..." : "Activar"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {addonError && (
            <div className="mt-3 flex items-center gap-2 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-3">
              <svg className="w-4 h-4 text-[#EF4444] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#EF4444]">{addonError}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            El pago se procesa de forma segura con Mercado Pago. Se activa inmediatamente al confirmar.
          </p>
        </div>
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
