"use client"

import { useEffect, useMemo, useState } from "react"
import {
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  Bell,
  Bot,
  Mic,
  Plug,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getClientContext } from "@/lib/client-context"

type DashboardProfile = {
  fullName: string
  profession: string
  planCode: string
  countryCode: string
  city: string
  phone: string
  phoneNormalized: string
  preferredLanguage: string
}

type RecentDocument = {
  id: string
  title: string | null
  file_name: string | null
  created_at: string | null
  status: string | null
}

type TodayTask = {
  id: string
  title: string | null
  due_at: string | null
  status: string | null
  priority: string | null
}

type UpcomingEvent = {
  id: string
  title: string
  scheduledAt: string
  type: "task" | "automation"
}

type FeatureAccess = {
  voiceEnabled: boolean
  googleEnabled: boolean
  customAgentEnabled: boolean
}

function getUsagePercent(used: number, limit: number) {
  if (!limit || limit <= 0) return 0
  return Math.min((used / limit) * 100, 100)
}

function getUsageLevel(used: number, limit: number) {
  if (!limit || limit <= 0) {
    return {
      level: "normal",
      percent: 0,
      title: "Uso dentro del plan",
      message: "Tu consumo está bajo control.",
      toneClass: "border-[#D9E1EC] bg-white",
      badgeClass: "bg-[#E8F1FF] text-[#2563EB]",
    }
  }

  const percent = (used / limit) * 100

  if (percent >= 100) {
    return {
      level: "blocked",
      percent,
      title: "Límite alcanzado",
      message: "Ya consumiste el 100% de este recurso.",
      toneClass: "border-[#FCA5A5] bg-[#FEF2F2]",
      badgeClass: "bg-[#FEE2E2] text-[#DC2626]",
    }
  }

  if (percent >= 90) {
    return {
      level: "critical",
      percent,
      title: "Uso crítico",
      message: "Estás por llegar al límite de tu plan.",
      toneClass: "border-[#FCD34D] bg-[#FFFBEB]",
      badgeClass: "bg-[#FEF3C7] text-[#D97706]",
    }
  }

  if (percent >= 70) {
    return {
      level: "warning",
      percent,
      title: "Atención",
      message: "Ya consumiste una parte importante de tu plan.",
      toneClass: "border-[#BFDBFE] bg-[#EFF6FF]",
      badgeClass: "bg-[#DBEAFE] text-[#2563EB]",
    }
  }

  return {
    level: "normal",
    percent,
    title: "Uso dentro del plan",
    message: "Tu consumo está bajo control.",
    toneClass: "border-[#D9E1EC] bg-white",
    badgeClass: "bg-[#E8F1FF] text-[#2563EB]",
  }
}

export default function ProfessionalDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<DashboardProfile | null>(null)
  const [usageSummary, setUsageSummary] = useState({
    messagesUsed: 0,
    messagesLimit: 0,
    audioUsed: 0,
    audioLimit: 0,
    automationsUsed: 0,
    automationsLimit: 0,
  })
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([])
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess>({
    voiceEnabled: false,
    googleEnabled: false,
    customAgentEnabled: false,
  })

  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error

        const user = data.user
        if (!user) return

        const meta = user.user_metadata || {}
        let clientId = ""

        try {
          const ctx = await getClientContext()
          clientId = ctx.clientId
        } catch (ctxError) {
          console.error("Error resolviendo client context:", ctxError)
        }

        let client: any = null

        if (clientId) {
          const { data: clientData, error: clientError } = await supabase
            .from("clients")
            .select(
              "id, name, phone, phone_normalized, profession_code, country_code, city, preferred_language, plan_code"
            )
            .eq("id", clientId)
            .single()

          if (clientError) {
            console.error("Error cargando client:", clientError)
          } else {
            client = clientData
          }
        }

        setProfile({
          fullName: client?.name || meta.full_name || "Tu cuenta",
          profession: client?.profession_code || meta.profession_code || "No definido",
          planCode: client?.plan_code || meta.selected_plan || "trial",
          countryCode: client?.country_code || meta.country_code || "No definido",
          city: client?.city || meta.city || "No definida",
          phone: client?.phone || meta.phone || "No definido",
          phoneNormalized: client?.phone_normalized || meta.phone_normalized || "No definido",
          preferredLanguage:
            client?.preferred_language || meta.preferred_language || "es",
        })

        if (clientId) {
          const periodYYYYMM = new Date().toISOString().slice(0, 7).replace("-", "")
          const today = new Date().toISOString().slice(0, 10)

          const usageResp = await supabase
            .from("usage_monthly")
            .select("messages_used, audio_minutes_used, automations_used")
            .eq("client_id", clientId)
            .eq("period_yyyymm", periodYYYYMM)
            .maybeSingle()

          const limitsResp = await supabase
            .from("tenant_effective_limits")
            .select(
              "max_messages_month, max_audio_minutes, max_automations, voice_enabled, google_enabled, custom_agent_enabled"
            )
            .eq("client_id", clientId)
            .maybeSingle()

          if (usageResp.error) {
            console.error("Error cargando usage_monthly:", usageResp.error)
          }

          if (limitsResp.error) {
            console.error("Error cargando tenant_effective_limits:", limitsResp.error)
          }

          setUsageSummary({
            messagesUsed: Number(usageResp.data?.messages_used ?? 0),
            messagesLimit: Number(limitsResp.data?.max_messages_month ?? 0),
            audioUsed: Number(usageResp.data?.audio_minutes_used ?? 0),
            audioLimit: Number(limitsResp.data?.max_audio_minutes ?? 0),
            automationsUsed: Number(usageResp.data?.automations_used ?? 0),
            automationsLimit: Number(limitsResp.data?.max_automations ?? 0),
          })

          setFeatureAccess({
            voiceEnabled: Boolean(limitsResp.data?.voice_enabled ?? false),
            googleEnabled: Boolean(limitsResp.data?.google_enabled ?? false),
            customAgentEnabled: Boolean(limitsResp.data?.custom_agent_enabled ?? false),
          })

          const documentsResp = await supabase
            .from("documents")
            .select("id, title, file_name, created_at, status")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false })
            .limit(5)

          if (documentsResp.error) {
            console.error("Error cargando documents:", documentsResp.error)
          } else {
            setRecentDocuments((documentsResp.data || []) as RecentDocument[])
          }

          const tasksResp = await supabase
            .from("tasks")
            .select("id, title, due_at, status, priority")
            .eq("client_id", clientId)
            .in("status", ["pending", "in_progress"])
            .order("due_at", { ascending: true })
            .limit(5)

          if (tasksResp.error) {
            console.error("Error cargando tasks:", tasksResp.error)
          } else {
            const filteredTasks = ((tasksResp.data || []) as TodayTask[]).filter((task) => {
              if (!task.due_at) return true
              return String(task.due_at).slice(0, 10) <= today
            })

            setTodayTasks(filteredTasks)
          }

          const recurringResp = await supabase
            .from("recurring_tasks")
            .select("id, title, next_run, status")
            .eq("client_id", clientId)
            .eq("status", "active")
            .order("next_run", { ascending: true })
            .limit(5)

          if (recurringResp.error) {
            console.error("Error cargando recurring_tasks:", recurringResp.error)
          } else {
            const mappedTaskEvents: UpcomingEvent[] = ((tasksResp.data || []) as any[])
              .filter((task) => task.due_at)
              .map((task) => ({
                id: task.id,
                title: task.title || "Tarea",
                scheduledAt: String(task.due_at),
                type: "task" as const,
              }))

            const mappedRecurringEvents: UpcomingEvent[] = ((recurringResp.data || []) as any[])
              .filter((item) => item.next_run)
              .map((item) => ({
                id: item.id,
                title: item.title || "Automatización",
                scheduledAt: String(item.next_run),
                type: "automation" as const,
              }))

            const merged = [...mappedTaskEvents, ...mappedRecurringEvents]
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .slice(0, 5)

            setUpcomingEvents(merged)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const statCards = useMemo(() => {
    return [
      {
        label: "Plan",
        value: profile?.planCode || "-",
        icon: Sparkles,
        color: "#3B82F6",
        change: "Cuenta activa",
      },
      {
        label: "Profesión",
        value: profile?.profession || "-",
        icon: Users,
        color: "#06B6D4",
        change: "Perfil configurado",
      },
      {
        label: "Ubicación",
        value: profile?.countryCode || "-",
        icon: Calendar,
        color: "#F59E0B",
        change: profile?.city || "Sin ciudad",
      },
      {
        label: "Idioma",
        value: profile?.preferredLanguage || "-",
        icon: FileText,
        color: "#7C3AED",
        change: "Idioma por defecto",
      },
    ]
  }, [profile])

  const messagesUsageState = useMemo(() => {
    return getUsageLevel(usageSummary.messagesUsed, usageSummary.messagesLimit)
  }, [usageSummary.messagesUsed, usageSummary.messagesLimit])

  const audioUsageState = useMemo(() => {
    return getUsageLevel(usageSummary.audioUsed, usageSummary.audioLimit)
  }, [usageSummary.audioUsed, usageSummary.audioLimit])

  const automationsUsageState = useMemo(() => {
    return getUsageLevel(usageSummary.automationsUsed, usageSummary.automationsLimit)
  }, [usageSummary.automationsUsed, usageSummary.automationsLimit])

  const quickLinks = useMemo(() => {
    const links = [
      {
        href: "/dashboard/professional/documentos",
        title: "Documentos",
        description: "Sube, revisa y organiza tus archivos",
        icon: FileText,
      },
      {
        href: "/dashboard/professional/agenda",
        title: "Agenda",
        description: "Visualiza tus citas y eventos programados",
        icon: Calendar,
      },
      {
        href: "/dashboard/professional/tareas",
        title: "Pendientes",
        description: "Trabaja tus tareas como tablero de control",
        icon: CheckSquare,
      },
      {
        href: "/dashboard/professional/automatizaciones",
        title: "Automatizaciones",
        description: "Programa acciones y seguimientos automáticos",
        icon: Zap,
      },
    ]

    if (featureAccess.customAgentEnabled) {
      links.unshift({
        href: "/dashboard/professional/asistente",
        title: "Asistente",
        description: "Personaliza el comportamiento de tu agente",
        icon: Bot,
      })
    }

    if (featureAccess.voiceEnabled) {
      links.push({
        href: "/dashboard/professional/voz",
        title: "Voz",
        description: "Configura voz, tonos y estilo de llamadas",
        icon: Mic,
      })
    }

    if (featureAccess.googleEnabled) {
      links.push({
        href: "/dashboard/professional/integraciones",
        title: "Integraciones",
        description: "Conecta Google Calendar, Drive y más",
        icon: Plug,
      })
    }

    return links
  }, [featureAccess])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">
            {greeting}, {profile?.fullName || "Tu cuenta"}
          </h1>

          <p className="text-muted-foreground mt-1">
            Aquí está el resumen de tu cuenta Assistant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/professional/agenda">
            <Button variant="outline" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Nueva cita
            </Button>
          </Link>

          <Link href="/dashboard/professional/documentos">
            <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90">
              <FileText className="w-4 h-4 mr-2" />
              Subir documento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>

              <TrendingUp className="w-4 h-4 text-[#34D399]" />
            </div>

            <p className="text-3xl font-bold text-[#0F1F63]">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-[#34D399] mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground">Uso del plan</p>
          <h3 className="text-lg font-semibold text-[#0F1F63]">Consumo mensual</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Mensajes</span>
              <span>
                {usageSummary.messagesUsed} / {usageSummary.messagesLimit || "∞"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary/40">
              <div
                className="h-2 rounded-full bg-[#3B82F6] transition-all"
                style={{
                  width: `${getUsagePercent(
                    usageSummary.messagesUsed,
                    usageSummary.messagesLimit
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Audio</span>
              <span>
                {usageSummary.audioUsed} / {usageSummary.audioLimit || "∞"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary/40">
              <div
                className="h-2 rounded-full bg-[#06B6D4] transition-all"
                style={{
                  width: `${getUsagePercent(
                    usageSummary.audioUsed,
                    usageSummary.audioLimit
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Automatizaciones</span>
              <span>
                {usageSummary.automationsUsed} / {usageSummary.automationsLimit || "∞"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary/40">
              <div
                className="h-2 rounded-full bg-[#7C3AED] transition-all"
                style={{
                  width: `${getUsagePercent(
                    usageSummary.automationsUsed,
                    usageSummary.automationsLimit
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {(messagesUsageState.level !== "normal" ||
        audioUsageState.level !== "normal" ||
        automationsUsageState.level !== "normal") && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "Mensajes",
              state: messagesUsageState,
              used: usageSummary.messagesUsed,
              limit: usageSummary.messagesLimit,
            },
            {
              label: "Audio",
              state: audioUsageState,
              used: usageSummary.audioUsed,
              limit: usageSummary.audioLimit,
            },
            {
              label: "Automatizaciones",
              state: automationsUsageState,
              used: usageSummary.automationsUsed,
              limit: usageSummary.automationsLimit,
            },
          ]
            .filter((item) => item.state.level !== "normal")
            .map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-5 shadow-sm ${item.state.toneClass}`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#0F1F63]">{item.label}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.state.badgeClass}`}
                  >
                    {Math.min(Math.round(item.state.percent), 999)}%
                  </span>
                </div>

                <p className="text-sm font-medium text-[#0F1F63]">{item.state.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.state.message}</p>

                <p className="mt-3 text-xs text-muted-foreground">
                  Consumo actual: {item.used} / {item.limit || "∞"}
                </p>
              </div>
            ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 rounded-2xl border border-[#7C3AED]/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <h3 className="font-semibold text-[#0F1F63]">Resumen de tu perfil</h3>
            <p className="text-sm text-muted-foreground">Datos conectados desde tu registro real</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-foreground">
                Número registrado: {profile?.phone || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-foreground">
                Número normalizado: {profile?.phoneNormalized || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-foreground">
                Ubicación: {profile?.countryCode || "-"} · {profile?.city || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F1F63]">Próximos eventos</h3>
          <Link href="/dashboard/professional/agenda">
            <Button variant="ghost" size="sm" className="text-[#3B82F6]">
              Ver agenda
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={`${event.type}-${event.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      event.type === "automation"
                        ? "bg-[#7C3AED]/10"
                        : "bg-[#3B82F6]/10"
                    }`}
                  >
                    {event.type === "automation" ? (
                      <Zap className="w-4 h-4 text-[#7C3AED]" />
                    ) : (
                      <CheckSquare className="w-4 h-4 text-[#3B82F6]" />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-[#0F1F63]">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.type === "automation" ? "Automatización" : "Tarea"} ·{" "}
                      {new Date(event.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-8 text-center">
            <p className="text-[#0F1F63] font-medium">
              No tienes próximos eventos programados.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tus tareas con fecha y automatizaciones activas aparecerán aquí.
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Pendientes para hoy</h3>
            <Link href="/dashboard/professional/tareas">
              <Button variant="ghost" size="sm" className="text-[#3B82F6]">
                Ver tablero
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => {
                const priorityColor =
                  task.priority === "high"
                    ? "#EF4444"
                    : task.priority === "medium"
                    ? "#F59E0B"
                    : "#34D399"

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: priorityColor }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {task.title || "Tarea sin título"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {task.status === "in_progress" ? "En progreso" : "Pendiente"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {task.due_at
                        ? new Date(task.due_at).toLocaleDateString()
                        : "Sin fecha"}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-8 text-center">
              <p className="text-[#0F1F63] font-medium">
                No tienes pendientes activos para hoy.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Crea tareas desde tu dashboard o desde WhatsApp y aparecerán aquí.
              </p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Accesos rápidos</h3>
          </div>

          <div className="space-y-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="block">
                <div className="p-4 rounded-xl border border-border hover:bg-secondary/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F1F63]">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F1F63]">Documentos recientes</h3>
          <Link href="/dashboard/professional/documentos">
            <Button variant="ghost" size="sm" className="text-[#3B82F6]">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-medium text-[#0F1F63]">
                    {doc.title || doc.file_name || "Documento sin nombre"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {doc.status || "Procesado"} ·{" "}
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString()
                      : "Sin fecha"}
                  </p>
                </div>

                <Link href="/dashboard/professional/documentos">
                  <Button variant="ghost" size="sm" className="text-[#3B82F6]">
                    Ver
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-10 text-center">
            <p className="text-[#0F1F63] font-medium">
              Aún no tienes documentos recientes.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sube tu primer archivo para empezar a analizar información con Operaly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
