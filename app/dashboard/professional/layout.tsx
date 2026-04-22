"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import NotificationBell from "@/components/dashboard/NotificationBell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Bot,
  Calendar,
  CheckSquare,
  ChevronLeft,
  CreditCard,
  FileText,
  FolderOpen,
  FolderLock,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings,
  Sparkles,
  MessageCircleMore,
  UserRound,
  Users,
  Zap,
  Lock,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getClientContext } from "@/lib/client-context"
import { labelForLanguage } from "@/lib/runtime-locale"
import {
  fetchDashboardRuntime,
  isDashboardAccessRestricted,
  resolveDashboardPlanCode,
  resolveDashboardPlanStatus,
} from "@/lib/dashboard-runtime"
import { OPERLAY_PLANS, getDisplayPlanName } from "@/lib/plans"

const sidebarItems = [
  { href: "/dashboard/professional", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/professional/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/professional/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/dashboard/professional/listas", label: "Listas", icon: List },
  { href: "/dashboard/professional/casos", label: "Casos", icon: FolderOpen },
  { href: "/dashboard/professional/contactos", label: "Contactos", icon: Users },
  { href: "/dashboard/professional/documentos", label: "Documentos", icon: FileText },
  { href: "/dashboard/professional/baul-privado", label: "Baúl privado", icon: FolderLock },
  { href: "/dashboard/professional/automatizaciones", label: "Automatizaciones", icon: Zap },
  { href: "/dashboard/professional/analiticas", label: "Analíticas", icon: BarChart3 },
]

const settingsItems = [
  { href: "/dashboard/professional/configuracion", label: "Perfil y plan", icon: Settings },
  { href: "/dashboard/professional/asistente", label: "Asistente", icon: Bot },
  { href: "/dashboard/professional/voz", label: "Voz", icon: Mic },
  { href: "/dashboard/professional/integraciones", label: "Integraciones", icon: Plug },
]

type SidebarProfile = {
  fullName: string
  initials: string
  email: string
  preferredLanguage: string
}

function isPastDate(value: string | null | undefined) {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getTime() < Date.now()
}

function normalizePlanStatus(value: string | null | undefined, fallback = "") {
  return String(value || fallback).trim().toLowerCase()
}

function isTrialWindowElapsed(value: string | null | undefined) {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  const trialEndsAt = parsed.getTime() + 7 * 24 * 60 * 60 * 1000
  return trialEndsAt < Date.now()
}

function shouldRestrictByFallback(params: {
  clientPlanCode?: string | null
  clientPlanStatus?: string | null
  clientStatus?: string | null
  clientCreatedAt?: string | null
  subscriptionPlanCode?: string | null
  subscriptionStatus?: string | null
  subscriptionCurrentPeriodEnd?: string | null
  subscriptionCurrentPeriodStart?: string | null
  resolvedPlan?: string | null
  resolvedStatus?: string | null
  selectedPlan?: string | null
}) {
  const fallbackPlan = normalizePlanStatus(
    String(
      params.clientPlanCode ||
        params.subscriptionPlanCode ||
        params.resolvedPlan ||
        params.selectedPlan ||
        "trial"
    )
  )
  const fallbackStatus = normalizePlanStatus(
    params.subscriptionStatus ||
      params.clientPlanStatus ||
      params.clientStatus ||
      params.resolvedStatus ||
      "trialing"
  )
  const expiredByDate = isPastDate(params.subscriptionCurrentPeriodEnd)
  const expiredByTrialWindow =
    fallbackPlan === "trial" &&
    (isTrialWindowElapsed(params.subscriptionCurrentPeriodStart) ||
      isTrialWindowElapsed(params.clientCreatedAt))
  const expiredByStatus = [
    "expired",
    "trial_expired",
    "paid_expired",
    "inactive",
    "cancelled",
    "blocked",
    "restricted",
    "recovery_finished",
  ].includes(fallbackStatus)
  const restricted =
    (fallbackPlan === "trial" && (expiredByDate || expiredByTrialWindow)) || expiredByStatus

  return {
    restricted,
    plan: fallbackPlan,
    status:
      (expiredByDate || expiredByTrialWindow) && fallbackPlan === "trial"
        ? "trial_expired"
        : fallbackStatus,
  }
}

const restrictedSettingsRoutes = new Set([
  "/dashboard/professional/asistente",
  "/dashboard/professional/voz",
  "/dashboard/professional/integraciones",
])

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard/professional": {
    title: "Mi espacio",
    subtitle: "Todo lo importante de su día en un solo lugar.",
  },
  "/dashboard/professional/agenda": {
    title: "Agenda",
    subtitle: "Revise su día y ajuste compromisos en segundos.",
  },
  "/dashboard/professional/tareas": {
    title: "Tareas",
    subtitle: "Ordene lo pendiente y avance sin perder nada.",
  },
  "/dashboard/professional/listas": {
    title: "Listas",
    subtitle: "Anote rápido, ordene y marque lo que ya quedó.",
  },
  "/dashboard/professional/casos": {
    title: "Casos",
    subtitle: "Siga cada tema con sus personas y documentos clave.",
  },
  "/dashboard/professional/contactos": {
    title: "Contactos",
    subtitle: "Tenga a mano las personas y datos que más usa.",
  },
  "/dashboard/professional/documentos": {
    title: "Documentos",
    subtitle: "Encuentre, revise y use sus archivos sin vueltas.",
  },
  "/dashboard/professional/baul-privado": {
    title: "Baúl privado",
    subtitle: "Guarde lo sensible en un lugar aparte y fácil de revisar.",
  },
  "/dashboard/professional/automatizaciones": {
    title: "Automatizaciones",
    subtitle: "Deje listos recordatorios y seguimientos que se repiten.",
  },
  "/dashboard/professional/analiticas": {
    title: "Analíticas",
    subtitle: "Vea de forma simple cómo va el uso de su cuenta.",
  },
  "/dashboard/professional/configuracion": {
    title: "Perfil y plan",
    subtitle: "Cambie sus datos, su plan y preferencias principales.",
  },
  "/dashboard/professional/asistente": {
    title: "Asistente",
    subtitle: "Ajuste cómo quiere que Operaly le hable y le ayude.",
  },
  "/dashboard/professional/voz": {
    title: "Voz",
    subtitle: "Defina voz, llamadas y estilo hablado de Operaly.",
  },
  "/dashboard/professional/integraciones": {
    title: "Integraciones",
    subtitle: "Conecte sus herramientas y empiece a usarlas aquí y en WhatsApp.",
  },
}

function UserMenu({
  profile,
  onLogout,
  accessRestricted,
  onUpgradeRequest,
}: {
  profile: SidebarProfile
  onLogout: () => Promise<void>
  accessRestricted: boolean
  onUpgradeRequest: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-2.5 py-2 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <Avatar className="h-10 w-10 border border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-sm font-semibold text-white">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left md:block">
            <p className="truncate text-sm font-semibold text-[#0F1F63]">{profile.fullName}</p>
            <p className="truncate text-xs text-slate-500">{profile.email || "Cuenta de Operaly"}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border-slate-200 p-2 shadow-xl">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0F1F63]">{profile.fullName}</p>
            <p className="text-xs text-slate-500">{profile.email || "Cuenta activa"}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Idioma base: {labelForLanguage(profile.preferredLanguage || "es")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/professional/configuracion" className="rounded-xl px-3 py-2">
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
          {accessRestricted ? (
            <>
              <DropdownMenuItem className="rounded-xl px-3 py-2 text-slate-400" onClick={onUpgradeRequest}>
                <Bot className="h-4 w-4" />
                Asistente
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2 text-slate-400" onClick={onUpgradeRequest}>
                <Mic className="h-4 w-4" />
                Voz
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2 text-slate-400" onClick={onUpgradeRequest}>
                <Plug className="h-4 w-4" />
                Integraciones
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/professional/asistente" className="rounded-xl px-3 py-2">
                  <Bot className="h-4 w-4" />
                  Asistente
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/professional/voz" className="rounded-xl px-3 py-2">
                  <Mic className="h-4 w-4" />
                  Voz
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/professional/integraciones" className="rounded-xl px-3 py-2">
                  <Plug className="h-4 w-4" />
                  Integraciones
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/precios" className="rounded-xl px-3 py-2">
              <CreditCard className="h-4 w-4" />
              Planes y extras
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="rounded-xl px-3 py-2"
          onClick={() => {
            void onLogout()
          }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [planCode, setPlanCode] = useState("trial")
  const [planStatus, setPlanStatus] = useState("trialing")
  const [accessRestricted, setAccessRestricted] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [profile, setProfile] = useState<SidebarProfile>({
    fullName: "Tu cuenta",
    initials: "OP",
    email: "",
    preferredLanguage: "es",
  })

  const currentPage = useMemo(() => {
    return (
      pageTitles[pathname] ?? {
        title: "Panel profesional",
        subtitle: "Mueva su cuenta con rapidez y sin complicarse.",
      }
    )
  }, [pathname])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error

        const user = data.user
        if (!user) {
          router.replace("/login")
          return
        }

        const meta = user.user_metadata || {}

        let clientId = ""
        try {
          const ctx = await getClientContext()
          clientId = ctx.clientId
        } catch {
          const selectedPlan = meta.selected_plan || "trial"
          router.replace(`/register/setup?plan=${selectedPlan}`)
          return
        }

        if (!clientId) {
          const selectedPlan = meta.selected_plan || "trial"
          router.replace(`/register/setup?plan=${selectedPlan}`)
          return
        }

        const fullName = String(meta.full_name || user.email || "Tu cuenta")
        const parts = fullName.trim().split(/\s+/)
        const initials =
          parts
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "OP"

        setProfile({
          fullName,
          initials,
          email: String(user.email || ""),
          preferredLanguage: String(meta.preferred_language || meta.language || "es"),
        })

        let runtime = null

        try {
          runtime = await fetchDashboardRuntime()
        } catch (runtimeError) {
          console.error("Error validando estado del plan en dashboard:", runtimeError)
        }

        let resolvedPlan = resolveDashboardPlanCode(runtime, String(meta.selected_plan || "trial"))
        let resolvedStatus = resolveDashboardPlanStatus(runtime, "trialing")
        let restricted = isDashboardAccessRestricted(runtime)

        if (!restricted || !runtime) {
          const [{ data: clientRow }, { data: latestSubscription }] = await Promise.all([
            supabase
              .from("clients")
              .select("plan_code, plan_status, status, created_at")
              .eq("id", clientId)
              .maybeSingle(),
            supabase
              .from("subscriptions")
              .select("plan_code, status, current_period_end, current_period_start, created_at")
              .eq("client_id", clientId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ])

          const fallback = shouldRestrictByFallback({
            clientPlanCode: clientRow?.plan_code,
            clientPlanStatus: clientRow?.plan_status,
            clientStatus: clientRow?.status,
            clientCreatedAt: clientRow?.created_at,
            subscriptionPlanCode: latestSubscription?.plan_code,
            subscriptionStatus: latestSubscription?.status,
            subscriptionCurrentPeriodEnd: latestSubscription?.current_period_end,
            subscriptionCurrentPeriodStart: latestSubscription?.current_period_start,
            resolvedPlan,
            resolvedStatus,
            selectedPlan: String(meta.selected_plan || "trial"),
          })

          if (!runtime || fallback.restricted) {
            restricted = fallback.restricted
            resolvedPlan = fallback.plan
            resolvedStatus = fallback.status
          }
        }

        setPlanCode(resolvedPlan)
        setPlanStatus(resolvedStatus)
        setAccessRestricted(restricted)
        setUpgradeOpen(restricted)

        if (restricted && restrictedSettingsRoutes.has(pathname)) {
          router.replace("/dashboard/professional/configuracion")
          return
        }
      } catch (err) {
        console.error(err)
        router.replace("/login")
      } finally {
        setCheckingAccess(false)
      }
    }

    void loadProfile()
  }, [pathname, router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      router.replace("/login")
    }
  }

  const handleUpgradeCheckout = async (selectedPlanCode: string) => {
    setCheckoutLoading(selectedPlanCode)
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: selectedPlanCode, provider: "mercadopago" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || data?.detail || "No se pudo iniciar el cobro."))
      }
      const url = data.checkout_url || data.init_point || data.payment_url || ""
      if (!url) throw new Error("No se pudo generar el link de pago.")
      window.location.href = url
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "No se pudo iniciar el pago.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  const paidPlans = useMemo(() => OPERLAY_PLANS.filter((plan) => plan.code !== "trial"), [])
  const isExpiredTrial = accessRestricted && planCode === "trial"

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_40%),linear-gradient(180deg,#F8FAFC_0%,#EEF2FF_100%)]">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-[#0F1F63]">Validando su acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.10),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.10),_transparent_26%),linear-gradient(180deg,#F8FAFC_0%,#F1F5F9_100%)]">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0F1F63]">{currentPage.title}</p>
              <p className="truncate text-xs text-slate-500">{profile.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu
              profile={profile}
              onLogout={handleLogout}
              accessRestricted={accessRestricted}
              onUpgradeRequest={() => setUpgradeOpen(true)}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <Link
            href={accessRestricted ? "#" : "/dashboard/professional/asistente"}
            onClick={(event) => {
              if (accessRestricted) {
                event.preventDefault()
                setUpgradeOpen(true)
              }
            }}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 text-xs font-semibold text-white shadow-sm"
          >
            <MessageCircleMore className="h-4 w-4" />
            {accessRestricted ? "Activar plan" : "Subir de plan"}
          </Link>
          <Link
            href={accessRestricted ? "#" : "/dashboard/professional/voz"}
            onClick={(event) => {
              if (accessRestricted) {
                event.preventDefault()
                setUpgradeOpen(true)
              }
            }}
            className={`inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-xs font-semibold ${
              accessRestricted
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-200 bg-white text-[#0F1F63]"
            }`}
          >
            Ajustar voz
          </Link>
          <Link
            href={accessRestricted ? "#" : "/dashboard/professional/integraciones"}
            onClick={(event) => {
              if (accessRestricted) {
                event.preventDefault()
                setUpgradeOpen(true)
              }
            }}
            className={`inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-xs font-semibold ${
              accessRestricted
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-200 bg-white text-[#0F1F63]"
            }`}
          >
            Integraciones
          </Link>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] overflow-hidden border-r border-white/70 bg-white/88 shadow-xl backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-[92px]" : "w-[290px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          {!collapsed ? (
            <Link href="/dashboard/professional" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F1F63]">Operaly</p>
                <p className="text-xs text-slate-500">Panel profesional</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/dashboard/professional"
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-sm"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </Link>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 lg:inline-flex"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 [-webkit-overflow-scrolling:touch]">
        <div className={`px-4 py-4 ${collapsed ? "px-3" : ""}`}>
          <div
            className={`rounded-3xl border border-[#E9D5FF]/60 bg-[linear-gradient(135deg,rgba(124,58,237,0.10),rgba(59,130,246,0.10),rgba(6,182,212,0.08))] p-4 ${
              collapsed ? "flex justify-center" : ""
            }`}
          >
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="relative">
                <Avatar className="h-11 w-11 border border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-sm font-semibold text-white">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F1F63]">{profile.fullName}</p>
                  <p className="truncate text-xs text-slate-500">Su espacio de trabajo</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="px-4 py-2">
          <div className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#3B82F6]/12 to-[#06B6D4]/10 text-[#0F1F63] shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isActive ? "bg-white text-[#3B82F6] shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {!collapsed ? (
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.label}</p>
                    </div>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="mt-4 border-t border-slate-100 px-4 pt-4">
          {!collapsed ? (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Configuración
            </p>
          ) : null}
          <nav className="space-y-1.5">
            {settingsItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={accessRestricted ? "#" : item.href}
                  onClick={(event) => {
                    if (accessRestricted) {
                      event.preventDefault()
                      setUpgradeOpen(true)
                    }
                  }}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C3AED]/10 to-[#3B82F6]/10 text-[#0F1F63] shadow-sm"
                      : accessRestricted
                        ? "text-slate-400"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isActive
                        ? "bg-white text-[#7C3AED] shadow-sm"
                        : accessRestricted
                          ? "bg-slate-100 text-slate-400"
                          : "bg-slate-100 text-slate-500 group-hover:bg-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {!collapsed ? <span className="truncate font-medium">{item.label}</span> : null}
                </Link>
              )
            })}
          </nav>
        </div>
        </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[92px]" : "lg:pl-[290px]"}`}>
        <header className="sticky top-0 z-40 hidden border-b border-white/70 bg-white/78 backdrop-blur-xl lg:block">
          <div className="flex items-center justify-between gap-6 px-8 py-5">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                <UserRound className="h-3.5 w-3.5" />
                Dashboard profesional
              </div>
              <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-[#0F1F63]">{currentPage.title}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{currentPage.subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 xl:flex">
                <Link
                  href={accessRestricted ? "#" : "/dashboard/professional/configuracion"}
                  onClick={(event) => {
                    if (accessRestricted) {
                      event.preventDefault()
                      setUpgradeOpen(true)
                    }
                  }}
                  className="rounded-2xl bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  {accessRestricted ? "Activar plan" : "Subir de plan"}
                </Link>
                <Link
                  href="/dashboard/professional/contactos"
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  Contactos
                </Link>
                <Link
                  href="/dashboard/professional/documentos"
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  Documentos
                </Link>
              </div>
              <NotificationBell />
              <UserMenu
                profile={profile}
                onLogout={handleLogout}
                accessRestricted={accessRestricted}
                onUpgradeRequest={() => setUpgradeOpen(true)}
              />
            </div>
          </div>
        </header>

        <main className="relative px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-8">
          {accessRestricted ? (
            <div className="absolute inset-0 z-20 rounded-[32px] bg-white/55 backdrop-blur-[2px]">
              <div className="sticky top-24 mx-auto flex max-w-2xl justify-center px-4">
                <div className="pointer-events-auto w-full rounded-[28px] border border-white/80 bg-white/96 p-6 shadow-2xl shadow-slate-900/10">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F1F63] to-[#7C3AED] text-white shadow-sm">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C3AED]">
                        {isExpiredTrial ? "Prueba finalizada" : "Cuenta restringida"}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold leading-tight text-[#0F1F63]">
                        {isExpiredTrial
                          ? "Su trial ya terminó. Ahora su dashboard queda solo para consulta."
                          : "Su cuenta necesita un plan vigente para volver a operar."}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Puede revisar su información sin problema, pero crear, editar, eliminar, subir, descargar o
                        activar módulos como asistente, voz e integraciones queda bloqueado hasta completar su pago.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          className="h-11 rounded-xl bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#7C3AED] px-5 text-sm font-semibold text-white hover:opacity-95"
                          onClick={() => setUpgradeOpen(true)}
                        >
                          Ver planes y continuar
                        </Button>
                        <Link
                          href="/dashboard/professional/analiticas"
                          className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-[#0F1F63] transition hover:border-slate-300"
                        >
                          Ver mi consumo
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div
            className={`mx-auto w-full max-w-[1500px] ${
              accessRestricted ? "pointer-events-none select-none opacity-75" : ""
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      <Dialog
        open={upgradeOpen}
        onOpenChange={(nextOpen) => {
          if (accessRestricted && !nextOpen) return
          setUpgradeOpen(nextOpen)
        }}
      >
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl rounded-[28px] border-white/70 bg-white/95 p-0 shadow-2xl" showCloseButton={!accessRestricted}>
          <div className="overflow-y-auto rounded-[28px] [-webkit-overflow-scrolling:touch]">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(135deg,#0F1F63_0%,#1D4ED8_50%,#06B6D4_100%)] px-6 pb-7 pt-6 text-white md:px-8 md:pb-8 md:pt-7">
              <DialogHeader className="text-left">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                  <Lock className="h-3.5 w-3.5" />
                  {isExpiredTrial ? "Trial vencido" : "Acceso restringido"}
                </div>
                <p className="max-w-2xl text-sm font-medium text-cyan-100">
                  No pierda su memoria, su asistente ni el ritmo de su día.
                </p>
                <DialogTitle className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-[2.55rem]">
                  {isExpiredTrial
                    ? "Su prueba terminó. Active un plan para seguir usando Operaly."
                    : "Este módulo se activa cuando su plan ya está vigente."}
                </DialogTitle>
                <DialogDescription className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-[15px]">
                  Puede seguir mirando su información, pero para crear, editar, subir, borrar o volver a usar voz,
                  asistente e integraciones necesita activar un plan pago.
                </DialogDescription>
                <div className="mt-5 grid gap-3 text-sm text-white/90 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    Retome pendientes, contactos y documentos sin volver a empezar.
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    Mantenga su seguimiento, recordatorios y orden activo.
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    Active su plan y vaya directo a su pago sin salir de Operaly.
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-3 md:p-6">
              {paidPlans.map((plan) => (
                <div
                  key={plan.code}
                  className={`flex h-full flex-col rounded-[24px] border p-5 shadow-sm ${
                    plan.code === "pro"
                      ? "border-[#7C3AED]/30 bg-[linear-gradient(180deg,rgba(15,31,99,0.98),rgba(29,78,216,0.96))] text-white"
                      : "border-slate-200 bg-white text-[#0F1F63]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{getDisplayPlanName(plan.code)}</p>
                    {plan.popular ? (
                      <span className="rounded-full bg-[#EC4899] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Más elegido
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-[2.4rem] font-semibold leading-none">
                    {plan.price === 0 ? "Gratis" : `S/${plan.price}`}
                  </p>
                  <p className={`mt-1 text-sm ${plan.code === "pro" ? "text-white/80" : "text-slate-500"}`}>
                    {plan.billingPeriodLabel}
                  </p>
                  <p className={`mt-4 text-sm leading-6 ${plan.code === "pro" ? "text-white/85" : "text-slate-600"}`}>
                    {plan.description}
                  </p>
                  <ul className={`mt-4 space-y-2 text-sm ${plan.code === "pro" ? "text-white/90" : "text-slate-600"}`}>
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`h-11 w-full rounded-xl text-sm font-semibold ${
                      plan.code === "pro"
                        ? "bg-white text-[#0F1F63] hover:bg-white/90"
                        : "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white hover:opacity-95"
                    }`}
                    disabled={checkoutLoading === plan.code}
                    onClick={() => void handleUpgradeCheckout(plan.code)}
                  >
                    {checkoutLoading === plan.code ? "Redirigiendo..." : `Elegir ${getDisplayPlanName(plan.code)}`}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



