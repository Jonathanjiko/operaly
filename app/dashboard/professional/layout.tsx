"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  CheckSquare, 
  FolderOpen,
  BookOpen,
  MessageSquare, 
  Zap,
  BarChart3,
  Settings, 
  CreditCard, 
  Plug, 
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  Search,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SofiaChatWidget } from "@/components/dashboard/sofia-chat-widget"

const sidebarItems = [
  { href: "/dashboard/professional", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/professional/agenda", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/professional/tareas", icon: CheckSquare, label: "Tareas" },
  { href: "/dashboard/professional/casos", icon: FolderOpen, label: "Casos" },
  { href: "/dashboard/professional/reservas", icon: BookOpen, label: "Reservas" },
  { href: "/dashboard/professional/contactos", icon: Users, label: "Contactos" },
  { href: "/dashboard/professional/documentos", icon: FileText, label: "Documentos" },
  { href: "/dashboard/professional/conversaciones", icon: MessageSquare, label: "Conversaciones" },
  { href: "/dashboard/professional/automatizaciones", icon: Zap, label: "Automatizaciones" },
  { href: "/dashboard/professional/analiticas", icon: BarChart3, label: "Analíticas" },
]

const settingsItems = [
  { href: "/dashboard/professional/configuracion", icon: Settings, label: "Configuración" },
]

export default function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
        <Image src="/images/operaly-logo.png" alt="Operaly" width={100} height={100} className="h-8 w-auto" />
        <div className="w-10" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link href="/dashboard/professional">
              <Image src="/images/operaly-logo.png" alt="Operaly" width={120} height={120} className="h-9 w-auto" />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Sofia status */}
        <div className={`px-4 py-4 border-b border-border ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 via-[#3B82F6]/10 to-[#06B6D4]/10 ${
            collapsed ? "justify-center" : ""
          }`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#34D399] rounded-full border-2 border-card" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-[#0F1F63]">Sofía</p>
                <p className="text-xs text-[#34D399]">Activa</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#3B82F6]/10 to-[#06B6D4]/10 text-[#3B82F6] font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#3B82F6]" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Settings section */}
        <div className="px-4 mt-4">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Configuración
            </p>
          )}
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#3B82F6]/10 to-[#06B6D4]/10 text-[#3B82F6] font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-[#3B82F6]" : ""}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Top bar */}
        <header className="hidden lg:flex h-16 bg-card border-b border-border items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar contactos, documentos..."
                className="h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-semibold text-sm">
              JP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 pt-20 lg:pt-6">
          {children}
        </main>
      </div>

      {/* Sofia Chat Widget */}
      <SofiaChatWidget />
    </div>
  )
}
