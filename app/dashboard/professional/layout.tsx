"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import NotificationBell from "@/components/dashboard/NotificationBell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getClientContext } from "@/lib/client-context"
import { labelForLanguage } from "@/lib/runtime-locale"

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
  { href: "/dashboard/professional/analiticas", label: "Analiticas", icon: BarChart3 },
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
    title: "Analiticas",
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
}: {
  profile: SidebarProfile
  onLogout: () => Promise<void>
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
              Configuracion
            </Link>
          </DropdownMenuItem>
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
          Cerrar sesion
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
      } catch (err) {
        console.error(err)
        router.replace("/login")
      } finally {
        setCheckingAccess(false)
      }
    }

    void loadProfile()
  }, [router])

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

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_40%),linear-gradient(180deg,#F8FAFC_0%,#EEF2FF_100%)]">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-[#0F1F63]">Validando tu acceso...</p>
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
            <UserMenu profile={profile} onLogout={handleLogout} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <Link
            href="/dashboard/professional/asistente"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 text-xs font-semibold text-white shadow-sm"
          >
            <MessageCircleMore className="h-4 w-4" />
            Probar Operaly
          </Link>
          <Link
            href="/dashboard/professional/voz"
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-[#0F1F63]"
          >
            Ajustar voz
          </Link>
          <Link
            href="/dashboard/professional/integraciones"
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-[#0F1F63]"
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
        className={`fixed top-0 left-0 z-50 h-full border-r border-white/70 bg-white/88 shadow-xl backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-[92px]" : "w-[290px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
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

        {!collapsed ? (
          <div className="px-4 pb-2">
            <div className="rounded-3xl border border-[#DCE7F5] bg-white/90 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">Use Operaly hoy</p>
              <p className="mt-2 text-sm font-semibold text-[#0F1F63]">
                Si necesita más capacidad, súbala desde aquí en segundos.
              </p>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/professional/configuracion"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 text-sm font-semibold text-white"
                >
                  Subir de plan
                </Link>
                <Link
                  href="/dashboard/professional/configuracion"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-[#0F1F63]"
                >
                  Revisar perfil y plan
                </Link>
              </div>
            </div>
          </div>
        ) : null}

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
              Configuracion
            </p>
          ) : null}
          <nav className="space-y-1.5">
            {settingsItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C3AED]/10 to-[#3B82F6]/10 text-[#0F1F63] shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isActive ? "bg-white text-[#7C3AED] shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-white"
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
                  href="/dashboard/professional/configuracion"
                  className="rounded-2xl bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Subir de plan
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
              <UserMenu profile={profile} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <main className="px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto mb-5 max-w-[1500px]">
            <div className="flex flex-col gap-3 rounded-[28px] border border-[#DCE7F5] bg-white/85 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">Operaly activo</p>
                <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
                  Su panel está hecho para moverse rápido y ver lo importante sin vueltas.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Revise uso, suba de plan si hace falta y entre rápido a lo que más usa.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/dashboard/professional/configuracion"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-5 text-sm font-semibold text-white"
                >
                  Subir de plan
                </Link>
                <Link
                  href="/dashboard/professional/integraciones"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-[#0F1F63]"
                >
                  Conectar herramientas
                </Link>
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
