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
import { labelForLanguage, localeFromLanguage } from "@/lib/runtime-locale"
import { getCurrentPeriodMonth, getEffectivePlanCode, type EffectiveLimitsRuntime } from "@/lib/effective-limits"
import { formatLimit, getDisplayPlanName } from "@/lib/plans"

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

type RuntimeSnapshot = {
  voice: Record<string, any> | null
  preferences: Record<string, string>
  welcome: Record<string, any> | null
  contextState: Record<string, any> | null
  recentEvents: Array<Record<string, any>>
  recentUnderstandingRuns: Array<Record<string, any>>
  phoneVerificationStatus: string
}

type DashboardRuntimePayload = {
  client?: Record<string, any> | null
  runtime?: Record<string, any> | null
  voice?: Record<string, any> | null
  preferences?: Record<string, string> | null
  welcome?: Record<string, any> | null
  contextState?: Record<string, any> | null
  recentEvents?: Array<Record<string, any>>
  recentUnderstandingRuns?: Array<Record<string, any>>
  plan?: Record<string, any> | null
  effective_plan_code?: string | null
  usage?: Record<string, any> | null
  limits?: Record<string, any> | null
  feature_access?: Record<string, any> | null
  offers?: Array<Record<string, any>>
  addon_offers?: Array<Record<string, any>>
  user_facing?: Record<string, any> | null
}

type DashboardAgendaPayload = {
  events?: Array<Record<string, any>>
  google_calendar_count?: number
  google_calendar_connected?: boolean
}

type DashboardDocumentsPayload = {
  imported_documents?: Array<Record<string, any>>
  remote_documents?: Array<Record<string, any>>
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
      title: "Todo en orden 🙂",
      message: "Su consumo se mantiene dentro de lo previsto.",
      toneClass: "border-[#D9E1EC] bg-white",
      badgeClass: "bg-[#E8F1FF] text-[#2563EB]",
    }
  }

  const percent = (used / limit) * 100

  if (percent >= 100) {
    return {
      level: "blocked",
      percent,
      title: "Límite alcanzado 🚨",
      message: "Este recurso ya llegó al tope del plan actual.",
      toneClass: "border-[#FCA5A5] bg-[#FEF2F2]",
      badgeClass: "bg-[#FEE2E2] text-[#DC2626]",
    }
  }

  if (percent >= 90) {
    return {
      level: "critical",
      percent,
      title: "Muy cerca del límite ⚠️",
      message: "Conviene sumar minutos, mensajes o subir de plan antes de frenarse.",
      toneClass: "border-[#FCD34D] bg-[#FFFBEB]",
      badgeClass: "bg-[#FEF3C7] text-[#D97706]",
    }
  }

  if (percent >= 75) {
    return {
      level: "warning",
      percent,
      title: "Va avanzando 👀",
      message: "Ya se usó una parte importante de este recurso.",
      toneClass: "border-[#BFDBFE] bg-[#EFF6FF]",
      badgeClass: "bg-[#DBEAFE] text-[#2563EB]",
    }
  }

  return {
    level: "normal",
    percent,
    title: "Todo en orden 🙂",
    message: "Su consumo se mantiene dentro de lo previsto.",
    toneClass: "border-[#D9E1EC] bg-white",
    badgeClass: "bg-[#E8F1FF] text-[#2563EB]",
  }
}

function normalizeOfferLabel(value: Record<string, any>) {
  return String(
    value.label ||
      value.title ||
      value.name ||
      value.addon_code ||
      value.offer_code ||
      "Extra disponible"
  )
    .replace(/_/g, " ")
    .trim()
}

function normalizeOfferDetail(value: Record<string, any>) {
  return String(
    value.description ||
      value.message ||
      value.reason ||
      value.summary ||
      "Puede activarlo si quiere seguir avanzando sin friccion."
  ).trim()
}

function describeThreshold(value: string) {
  const normalized = String(value || "").toLowerCase()
  if (normalized.includes("blocked") || normalized.includes("100")) {
    return "Este mes ya toco tope en al menos un frente."
  }
  if (normalized.includes("critical") || normalized.includes("90")) {
    return "Ya va muy cerca del tope y conviene ajustar antes de frenarse."
  }
  if (normalized.includes("warning") || normalized.includes("75")) {
    return "El uso ya pide mirarlo con calma para no apretarse despues."
  }
  return "Aquí ve lo que hoy tiene disponible en su cuenta."
}

function normalizeRuntimeStatus(value: string | null | undefined) {
  const normalized = String(value || "").toLowerCase()
  if (!normalized) return "Sin señal"
  if (normalized.includes("sent")) return "Enviado"
  if (normalized.includes("failed")) return "Falló"
  if (normalized.includes("pending")) return "Pendiente"
  if (normalized.includes("queued")) return "En cola"
  if (normalized.includes("connected")) return "Conectado"
  return normalized.replace(/_/g, " ")
}

function formatRuntimeDate(value: string | null | undefined, locale: string) {
  if (!value) return "Sin fecha"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Sin fecha"

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

function getRuntimeTone(status: string) {
  const normalized = String(status || "").toLowerCase()
  if (normalized.includes("enviado") || normalized.includes("conectado") || normalized.includes("verified") || normalized.includes("ok")) {
    return {
      card: "border-emerald-200 bg-emerald-50",
      pill: "bg-emerald-100 text-emerald-700",
    }
  }

  if (normalized.includes("pendiente") || normalized.includes("cola")) {
    return {
      card: "border-amber-200 bg-amber-50",
      pill: "bg-amber-100 text-amber-700",
    }
  }

  if (normalized.includes("fall")) {
    return {
      card: "border-red-200 bg-red-50",
      pill: "bg-red-100 text-red-700",
    }
  }

  return {
    card: "border-slate-200 bg-slate-50",
    pill: "bg-slate-200 text-slate-700",
  }
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function asArray<T = Record<string, any>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
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
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<RuntimeSnapshot>({
    voice: null,
    preferences: {},
    welcome: null,
    contextState: null,
    recentEvents: [],
    recentUnderstandingRuns: [],
    phoneVerificationStatus: "",
  })
  const [commercialSignals, setCommercialSignals] = useState({
    highestThreshold: "",
    offers: [] as Array<Record<string, any>>,
    googleCalendarCount: 0,
    remoteDocumentsCount: 0,
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
          const periodMonth = getCurrentPeriodMonth()
          const today = new Date().toISOString().slice(0, 10)
          const session = await supabase.auth.getSession()
          const accessToken = session.data.session?.access_token || ""
          let usedDashboardSnapshot = false
          let receivedAgendaSnapshot = false
          let receivedDocumentsSnapshot = false

          if (accessToken) {
            try {
              const [dashboardRuntimeResponse, legacyRuntimeResponse, dashboardAgendaResponse, dashboardDocumentsResponse] =
                await Promise.all([
                  fetch("/api/dashboard/runtime", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    cache: "no-store",
                  }),
                  fetch("/api/professional/runtime", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    cache: "no-store",
                  }),
                  fetch("/api/dashboard/agenda", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    cache: "no-store",
                  }),
                  fetch("/api/dashboard/documents", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    cache: "no-store",
                  }),
                ])

              const dashboardRuntimePayload = (await dashboardRuntimeResponse.json().catch(() => ({}))) as DashboardRuntimePayload
              const legacyRuntimePayload = await legacyRuntimeResponse.json().catch(() => ({}))
              const dashboardAgendaPayload = (await dashboardAgendaResponse.json().catch(() => ({}))) as DashboardAgendaPayload
              const dashboardDocumentsPayload = (await dashboardDocumentsResponse.json().catch(() => ({}))) as DashboardDocumentsPayload

              if (legacyRuntimeResponse.ok || dashboardRuntimeResponse.ok) {
                const mergedRuntime = dashboardRuntimeResponse.ok ? dashboardRuntimePayload : legacyRuntimePayload
                setRuntimeSnapshot({
                  voice: mergedRuntime?.voice || legacyRuntimePayload?.voice || null,
                  preferences: (mergedRuntime?.preferences || legacyRuntimePayload?.preferences || {}) as Record<string, string>,
                  welcome: mergedRuntime?.welcome || legacyRuntimePayload?.welcome || null,
                  contextState: mergedRuntime?.contextState || legacyRuntimePayload?.contextState || null,
                  recentEvents: asArray(mergedRuntime?.recentEvents || legacyRuntimePayload?.recentEvents),
                  recentUnderstandingRuns: asArray(
                    mergedRuntime?.recentUnderstandingRuns || legacyRuntimePayload?.recentUnderstandingRuns
                  ),
                  phoneVerificationStatus: String(
                    mergedRuntime?.client?.phone_verification_status ||
                      legacyRuntimePayload?.client?.phone_verification_status ||
                      client?.phone_verification_status ||
                      ""
                  ),
                })
              }

              if (dashboardRuntimeResponse.ok) {
                usedDashboardSnapshot = true
                const effectivePlanCode =
                  String(
                    dashboardRuntimePayload?.plan?.effective_plan_code ||
                      dashboardRuntimePayload?.effective_plan_code ||
                      dashboardRuntimePayload?.limits?.effective_plan_code ||
                      ""
                  ) || null

                const usage = dashboardRuntimePayload?.usage || {}
                const limits = dashboardRuntimePayload?.limits || {}
                const featureAccess = dashboardRuntimePayload?.feature_access || dashboardRuntimePayload?.limits || {}

                setUsageSummary({
                  messagesUsed: toNumber(
                    usage?.messages_used ?? usage?.messages?.used ?? usage?.messages?.current ?? usage?.messages
                  ),
                  messagesLimit: toNumber(
                    limits?.max_messages_month ?? usage?.messages_limit ?? usage?.messages?.limit
                  ),
                  audioUsed: toNumber(
                    usage?.audio_minutes_used ?? usage?.audio?.used ?? usage?.voice_minutes?.used ?? usage?.audio
                  ),
                  audioLimit: toNumber(
                    limits?.max_audio_minutes ?? usage?.audio_limit ?? usage?.audio?.limit ?? usage?.voice_minutes?.limit
                  ),
                  automationsUsed: toNumber(
                    usage?.automations_used ?? usage?.automations?.used ?? usage?.automations
                  ),
                  automationsLimit: toNumber(
                    limits?.max_automations ?? usage?.automations_limit ?? usage?.automations?.limit
                  ),
                })

                setFeatureAccess({
                  voiceEnabled: Boolean(featureAccess?.voice_enabled ?? false),
                  googleEnabled: Boolean(featureAccess?.google_enabled ?? false),
                  customAgentEnabled: Boolean(featureAccess?.custom_agent_enabled ?? false),
                })

                setProfile((current) =>
                  current
                    ? {
                        ...current,
                        planCode: effectivePlanCode || current.planCode,
                        preferredLanguage:
                          String(
                            dashboardRuntimePayload?.client?.preferred_language ||
                              dashboardRuntimePayload?.client?.default_language ||
                              current.preferredLanguage ||
                              "es"
                          ) || "es",
                      }
                    : current
                )

                const agendaEvents = asArray<Record<string, any>>(dashboardAgendaPayload?.events)
                const upcomingFromAgenda = agendaEvents
                  .map((event) => ({
                    id: String(event.id || event.external_id || event.google_event_id || Math.random()),
                    title: String(event.title || event.summary || event.name || "Evento"),
                    scheduledAt: String(
                      event.scheduled_at ||
                        event.start_at ||
                        event.starts_at ||
                        event.start_time ||
                        event.due_at ||
                        ""
                    ),
                    type: String(event.type || event.kind || event.source || "").toLowerCase().includes("automation")
                      ? ("automation" as const)
                      : ("task" as const),
                  }))
                  .filter((event) => Boolean(event.scheduledAt))
                  .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                  .slice(0, 5)

                if (upcomingFromAgenda.length > 0) {
                  receivedAgendaSnapshot = true
                  setUpcomingEvents(upcomingFromAgenda)
                }

                const importedDocuments = asArray<Record<string, any>>(dashboardDocumentsPayload?.imported_documents)
                if (importedDocuments.length > 0) {
                  receivedDocumentsSnapshot = true
                  setRecentDocuments(
                    importedDocuments.slice(0, 5).map((doc) => ({
                      id: String(doc.id || doc.document_id || Math.random()),
                      title: (doc.title as string | null) || null,
                      file_name: (doc.file_name as string | null) || (doc.name as string | null) || null,
                      created_at: (doc.created_at as string | null) || (doc.imported_at as string | null) || null,
                      status: (doc.status as string | null) || (doc.availability as string | null) || null,
                    }))
                  )
                }

                setCommercialSignals({
                  highestThreshold: String(
                    usage?.highest_threshold_crossed ||
                      dashboardRuntimePayload?.plan?.highest_threshold_crossed ||
                      ""
                  ),
                  offers: asArray(
                    dashboardRuntimePayload?.user_facing?.offers ||
                      dashboardRuntimePayload?.offers ||
                      dashboardRuntimePayload?.addon_offers
                  ),
                  googleCalendarCount: toNumber(
                    dashboardAgendaPayload?.google_calendar_count || usage?.google_calendar_count
                  ),
                  remoteDocumentsCount: asArray(dashboardDocumentsPayload?.remote_documents).length,
                })
              }
            } catch (runtimeError) {
              console.error("Error cargando runtime dashboard:", runtimeError)
            }
          }

          if (!usedDashboardSnapshot) {
            const limitsResp = await supabase.rpc("get_my_effective_limits")

            if (limitsResp.error) {
              console.error("Error cargando get_my_effective_limits:", limitsResp.error)
            }

            const effectiveLimits = (limitsResp.data || {}) as EffectiveLimitsRuntime
            const effectivePlanCode = getEffectivePlanCode(effectiveLimits)

            const usageResp = await supabase
              .from("usage_monthly")
              .select("messages_used, audio_minutes_used, automations_used")
              .eq("client_id", clientId)
              .eq("period_month", periodMonth)
              .maybeSingle()

            if (usageResp.error) {
              console.error("Error cargando usage_monthly:", usageResp.error)
            }

            setUsageSummary({
              messagesUsed: Number(usageResp.data?.messages_used ?? 0),
              messagesLimit: Number(effectiveLimits.max_messages_month ?? 0),
              audioUsed: Number(usageResp.data?.audio_minutes_used ?? 0),
              audioLimit: Number(effectiveLimits.max_audio_minutes ?? 0),
              automationsUsed: Number(usageResp.data?.automations_used ?? 0),
              automationsLimit: Number(effectiveLimits.max_automations ?? 0),
            })

            setFeatureAccess({
              voiceEnabled: Boolean(effectiveLimits.voice_enabled ?? false),
              googleEnabled: Boolean(effectiveLimits.google_enabled ?? false),
              customAgentEnabled: Boolean(effectiveLimits.custom_agent_enabled ?? false),
            })

            setProfile((current) =>
              current
                ? {
                    ...current,
                    planCode: effectivePlanCode,
                  }
                : current
            )
          }

          if (!receivedDocumentsSnapshot) {
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

          if (!receivedAgendaSnapshot) {
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
        label: "Plan activo",
        value: getDisplayPlanName(profile?.planCode),
        icon: Sparkles,
        color: "#3B82F6",
        change: "Aplicado hoy en su cuenta",
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
        value: labelForLanguage(profile?.preferredLanguage || "es"),
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

  const commercialHighlights = useMemo(() => {
    return [
      {
        label: "Plan aplicado",
        value: getDisplayPlanName(profile?.planCode || "trial"),
        detail: describeThreshold(commercialSignals.highestThreshold),
      },
      {
        label: "Agenda Google",
        value:
          commercialSignals.googleCalendarCount > 0
            ? `${commercialSignals.googleCalendarCount} visto${commercialSignals.googleCalendarCount === 1 ? "" : "s"}`
            : "Sin cambios recientes",
        detail:
          commercialSignals.googleCalendarCount > 0
            ? "Los cambios hechos en Google ya deben verse al entrar a agenda."
            : "Si agrega algo desde Google, aqui deberia reflejarse al volver a abrir la agenda.",
      },
      {
        label: "Drive visible",
        value:
          commercialSignals.remoteDocumentsCount > 0
            ? `${commercialSignals.remoteDocumentsCount} archivo${commercialSignals.remoteDocumentsCount === 1 ? "" : "s"}`
            : "Sin remotos",
        detail:
          commercialSignals.remoteDocumentsCount > 0
            ? "Tiene archivos visibles desde Drive sin bajarlos todavia."
            : "Cuando Drive este leyendo en vivo, aqui aparecera lo remoto sin ocupar espacio extra.",
      },
    ]
  }, [
    commercialSignals.googleCalendarCount,
    commercialSignals.highestThreshold,
    commercialSignals.remoteDocumentsCount,
    profile?.planCode,
  ])

  const quickLinks = useMemo(() => {
    const links = [
      {
        href: "/dashboard/professional/documentos",
        title: "Documentos",
        description: "Suba, revise y organice sus archivos",
        icon: FileText,
      },
      {
        href: "/dashboard/professional/agenda",
        title: "Agenda",
        description: "Vea sus citas y eventos programados",
        icon: Calendar,
      },
      {
        href: "/dashboard/professional/tareas",
        title: "Pendientes",
        description: "Trabaje sus tareas como tablero de control",
        icon: CheckSquare,
      },
      {
        href: "/dashboard/professional/automatizaciones",
        title: "Automatizaciones",
        description: "Programe acciones y seguimientos automáticos",
        icon: Zap,
      },
    ]

    if (featureAccess.customAgentEnabled) {
      links.unshift({
        href: "/dashboard/professional/asistente",
        title: "Asistente",
        description: "Personalice cómo debe hablarle y acompañarle",
        icon: Bot,
      })
    }

    if (featureAccess.voiceEnabled) {
      links.push({
        href: "/dashboard/professional/voz",
        title: "Voz",
        description: "Configure voz, tono y estilo de llamadas",
        icon: Mic,
      })
    }

    if (featureAccess.googleEnabled) {
      links.push({
        href: "/dashboard/professional/integraciones",
        title: "Integraciones",
        description: "Conecte Calendar, Drive, Gmail y más",
        icon: Plug,
      })
    }

    return links
  }, [featureAccess])

  const runtimeLocale = useMemo(() => localeFromLanguage(profile?.preferredLanguage), [profile?.preferredLanguage])
  const runtimeLanguageLabel = useMemo(
    () => labelForLanguage(profile?.preferredLanguage),
    [profile?.preferredLanguage]
  )

  const runtimeStatusCards = useMemo(() => {
    const voiceConfigured = Boolean(runtimeSnapshot.voice?.voice_id)
    const assistantConfigured = Boolean(
      runtimeSnapshot.preferences.assistant_tone ||
        runtimeSnapshot.preferences.assistant_style ||
        runtimeSnapshot.preferences.assistant_context
    )
    const welcomeStatus =
      runtimeSnapshot.preferences.welcome_initial_status ||
      runtimeSnapshot.welcome?.status ||
      runtimeSnapshot.welcome?.message_status ||
      "pending"
    const phoneStatus = runtimeSnapshot.phoneVerificationStatus || "pending"

    return [
      {
        label: "Voz runtime",
        value: voiceConfigured ? "Guardada" : "Pendiente",
        detail: voiceConfigured
          ? `${runtimeSnapshot.voice?.voice_name || runtimeSnapshot.voice?.voice_id || "Configurada"} para su cuenta`
          : "Todavía no ha dejado una voz lista",
      },
      {
        label: "Asistente",
        value: assistantConfigured ? "Guardado" : "Base",
        detail: assistantConfigured
          ? `${runtimeSnapshot.preferences.assistant_tone || "tono"} · ${runtimeSnapshot.preferences.assistant_style || "estilo"}`
          : "Todavía se apoya más en la configuración base",
      },
      {
        label: "Welcome WhatsApp",
        value: normalizeRuntimeStatus(welcomeStatus),
        detail: runtimeSnapshot.welcome?.provider_message_id
          ? "Meta aceptó el envío"
          : "Sin provider_message_id todavía",
      },
      {
        label: "Teléfono",
        value: normalizeRuntimeStatus(phoneStatus),
        detail:
          phoneStatus === "verified"
            ? "Línea lista para operar"
            : "La verificación aún no quedó cerrada",
      },
    ]
  }, [runtimeSnapshot])

  const recentRuntimeActivity = useMemo(() => {
    return runtimeSnapshot.recentEvents.slice(0, 5).map((event) => ({
      id: String(event.id || Math.random()),
      title: String(event.event_type || event.action || "Evento operativo"),
      createdAt: String(event.created_at || event.updated_at || ""),
      detail:
        String(event.channel || event.module || "") ||
        String(event.payload?.reason || event.payload?.status || ""),
    }))
  }, [runtimeSnapshot.recentEvents])

  const lastUnderstanding = useMemo(() => {
    return runtimeSnapshot.recentUnderstandingRuns[0] || null
  }, [runtimeSnapshot.recentUnderstandingRuns])

  const operationalSignals = useMemo(() => {
    const welcomeStatus = normalizeRuntimeStatus(
      runtimeSnapshot.preferences.welcome_initial_status ||
        runtimeSnapshot.welcome?.status ||
        runtimeSnapshot.welcome?.message_status ||
        "pending"
    )
    const phoneStatus = normalizeRuntimeStatus(runtimeSnapshot.phoneVerificationStatus || "pending")
    const runtimeVoiceApplied = runtimeSnapshot.recentEvents.some((event) =>
      String(event.event_type || event.action || "").toLowerCase().includes("voice")
    )
    const runtimeAssistantApplied = runtimeSnapshot.recentUnderstandingRuns.length > 0

    return {
      welcomeStatus,
      phoneStatus,
      runtimeVoiceApplied,
      runtimeAssistantApplied,
    }
  }, [runtimeSnapshot])

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
          <p className="text-sm font-medium text-muted-foreground">Plan y consumo</p>
          <h3 className="text-lg font-semibold text-[#0F1F63]">Cómo va su cuenta este mes</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Mensajes</span>
              <span>
                {usageSummary.messagesUsed} / {formatLimit(usageSummary.messagesLimit)}
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
                {usageSummary.audioUsed} / {formatLimit(usageSummary.audioLimit, featureAccess.voiceEnabled)}
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
                {usageSummary.automationsUsed} / {formatLimit(usageSummary.automationsLimit)}
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

      <div className="grid gap-4 lg:grid-cols-3">
        {commercialHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#D9E1EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{item.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>

      {commercialSignals.offers.length > 0 && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0F1F63]">Ideas para seguir creciendo 💡</p>
              <p className="mt-1 text-sm text-slate-600">
                Aquí verá opciones útiles para seguir sin frenarse.
              </p>
            </div>
            <Link href="/precios" className="text-sm font-semibold text-[#2563EB] hover:underline">
              Ver planes y extras
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {commercialSignals.offers.slice(0, 4).map((offer, index) => (
              <div
                key={`${normalizeOfferLabel(offer)}-${index}`}
                className="rounded-xl border border-white/70 bg-white/80 p-4"
              >
                <p className="text-sm font-semibold text-[#0F1F63]">{normalizeOfferLabel(offer)}</p>
                <p className="mt-1 text-sm text-slate-600">{normalizeOfferDetail(offer)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  Consumo actual: {item.used} / {formatLimit(
                    item.limit,
                    item.label !== "Audio" || featureAccess.voiceEnabled
                  )}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/70 px-3 py-2">
                  <p className="text-xs text-slate-600">
                    {item.state.level === "critical" || item.state.level === "blocked"
                      ? "Puede sumar minutos, mensajes o subir de plan para no frenarse."
                      : "Todavía hay margen, pero ya conviene mirar cómo viene el mes."}
                  </p>
                  <Link href="/precios" className="shrink-0 text-xs font-semibold text-[#2563EB] hover:underline">
                    Ver planes
                  </Link>
                </div>
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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#0F1F63]">Puesta a punto</h3>
              <p className="text-sm text-muted-foreground">
                Revise rápido si su cuenta ya está lista para trabajar como usted espera.
              </p>
            </div>
            <Link href="/dashboard/professional/configuracion">
              <Button variant="ghost" size="sm" className="text-[#3B82F6]">
                Ajustar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {runtimeStatusCards.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${
                  getRuntimeTone(item.value).card
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xl font-semibold text-[#0F1F63]">{item.value}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      getRuntimeTone(item.value).pill
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Idioma</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{runtimeLanguageLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">Así debería hablarle Operaly por defecto.</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">En qué va</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {String(runtimeSnapshot.contextState?.module_context || runtimeSnapshot.contextState?.current_module || "Sin módulo")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {runtimeSnapshot.contextState?.pending_confirmation ? "Tiene algo por confirmar" : "No hay nada pendiente por confirmar"}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Última respuesta</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {lastUnderstanding
                  ? normalizeRuntimeStatus(
                      lastUnderstanding.decision || lastUnderstanding.confirmation_decision || lastUnderstanding.status
                    )
                  : "Sin señal"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lastUnderstanding?.confidence != null
                  ? `Confianza ${(Number(lastUnderstanding.confidence) * 100).toFixed(0)}%`
                  : "Todavía no hay movimiento reciente"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-[#D9E1EC] bg-white p-4">
              <p className="text-sm font-semibold text-[#0F1F63]">Lo que ya dejó listo</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Voz</p>
                  <p className="mt-2 text-sm font-semibold text-[#0F1F63]">
                    {runtimeSnapshot.voice?.voice_id ? "Guardada en Supabase" : "Sin guardar todavía"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {operationalSignals.runtimeVoiceApplied
                    ? "Ya se ve movimiento reciente relacionado con su voz."
                    : "Todavía no se ve uso reciente de la voz en WhatsApp o llamadas."}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Asistente</p>
                  <p className="mt-2 text-sm font-semibold text-[#0F1F63]">
                    {runtimeSnapshot.preferences.assistant_tone || runtimeSnapshot.preferences.assistant_style
                    ? "Guardado en Supabase"
                    : "Sin personalización guardada"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {operationalSignals.runtimeAssistantApplied
                    ? "Ya hay respuestas recientes para revisar si Operaly se parece más a usted."
                    : "Todavía falta ver más actividad para confirmarlo."}
                  </p>
                </div>
              </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0F1F63]">WhatsApp reciente</h3>
            <p className="text-sm text-muted-foreground">
              Aquí ve lo último que Operaly estuvo haciendo o entendiendo.
            </p>
          </div>

          {recentRuntimeActivity.length > 0 ? (
            <div className="space-y-3">
              {recentRuntimeActivity.map((event) => (
                <div key={event.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#0F1F63]">{event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.detail || "Movimiento reciente"} · {formatRuntimeDate(event.createdAt, runtimeLocale)}
                      </p>
                    </div>
                    <Bell className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-8 text-center">
              <p className="font-medium text-[#0F1F63]">Todavía no hay actividad reciente visible.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cuando use WhatsApp, aquí verá lo último que hizo Operaly.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`rounded-2xl border p-6 ${getRuntimeTone(operationalSignals.welcomeStatus).card}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#0F1F63]">Primer saludo</h3>
              <p className="text-sm text-muted-foreground">
                Le muestra si el primer mensaje quedó bien enviado.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getRuntimeTone(operationalSignals.welcomeStatus).pill}`}>
              {operationalSignals.welcomeStatus}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/60 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">provider message id</p>
              <p className="mt-2 text-sm font-medium text-[#0F1F63] break-all">
                {runtimeSnapshot.welcome?.provider_message_id || "Todavía no visible"}
              </p>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">último envío</p>
              <p className="mt-2 text-sm font-medium text-[#0F1F63]">
                {formatRuntimeDate(
                  runtimeSnapshot.welcome?.sent_at ||
                    runtimeSnapshot.welcome?.updated_at ||
                    runtimeSnapshot.preferences.welcome_initial_sent_at,
                  runtimeLocale
                )}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-6 ${getRuntimeTone(operationalSignals.phoneStatus).card}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#0F1F63]">Línea de WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Revise si el número quedó listo para trabajar.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getRuntimeTone(operationalSignals.phoneStatus).pill}`}>
              {operationalSignals.phoneStatus}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/60 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">número registrado</p>
              <p className="mt-2 text-sm font-medium text-[#0F1F63]">{profile?.phone || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">número normalizado</p>
              <p className="mt-2 text-sm font-medium text-[#0F1F63]">{profile?.phoneNormalized || "-"}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Plan aplicado</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{getDisplayPlanName(profile?.planCode)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Este es el plan que hoy define sus límites y beneficios.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Avisos</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {messagesUsageState.level !== "normal" || audioUsageState.level !== "normal" || automationsUsageState.level !== "normal"
                ? "Revise consumo 👀"
                : "Todo al día 🙂"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Aquí debería sentirse cuando su cuenta ya se acerca a un límite importante.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Crecimiento</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {featureAccess.googleEnabled || featureAccess.voiceEnabled || featureAccess.customAgentEnabled ? "Con extras ✨" : "Base"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Si llega al límite, aquí verá cuándo conviene sumar capacidad o subir de plan.</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F1F63]">Lo que viene</h3>
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
              No tiene nada próximo programado.
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
          <h3 className="text-lg font-semibold text-[#0F1F63]">Pendientes de hoy</h3>
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
                Cree algo aquí o por WhatsApp y aparecerá en esta vista.
              </p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Ir rápido a</h3>
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
              Aún no tiene documentos recientes.
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
