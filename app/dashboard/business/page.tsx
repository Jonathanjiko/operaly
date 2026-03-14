"use client"

import { useState } from "react"
import { 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Clock,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"

const recentOrders = [
  { id: "ORD-001", customer: "Juan Pérez", product: "Hamburguesa Clásica x2", total: 45.00, status: "pending", time: "Hace 5 min" },
  { id: "ORD-002", customer: "María López", product: "Pizza Familiar", total: 65.00, status: "preparing", time: "Hace 12 min" },
  { id: "ORD-003", customer: "Carlos García", product: "Combo Familiar", total: 120.00, status: "ready", time: "Hace 20 min" },
]

const recentConversations = [
  { id: 1, customer: "Ana Torres", message: "Hola, quisiera hacer un pedido", time: "Ahora", unread: true, channel: "whatsapp" },
  { id: 2, customer: "Pedro Sánchez", message: "¿Tienen disponible la mesa para 6?", time: "Hace 3 min", unread: true, channel: "instagram" },
  { id: 3, customer: "Laura Martínez", message: "Gracias, ya recibí mi pedido", time: "Hace 15 min", unread: false, channel: "whatsapp" },
]

const sofiaStats = {
  conversationsHandled: 47,
  ordersProcessed: 23,
  questionsAnswered: 89,
}

const statusColors = {
  pending: { bg: "#F59E0B", label: "Pendiente" },
  preparing: { bg: "#3B82F6", label: "Preparando" },
  ready: { bg: "#34D399", label: "Listo" },
  delivered: { bg: "#9CA3AF", label: "Entregado" },
}

const channelIcons: Record<string, JSX.Element> = {
  whatsapp: (
    <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </div>
  ),
  instagram: (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E4405F] to-[#C13584] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  ),
}

export default function BusinessDashboardPage() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">
            {greeting}, Restaurante El Buen Sabor
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí está el resumen de hoy
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-to-r from-[#34D399] to-[#06B6D4] text-white">
          <Eye className="w-4 h-4 mr-2" />
          Ver conversaciones
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ventas hoy", value: "$1,250", icon: DollarSign, color: "#34D399", change: "+12%", up: true },
          { label: "Pedidos", value: "23", icon: ShoppingCart, color: "#3B82F6", change: "+8", up: true },
          { label: "Clientes nuevos", value: "7", icon: Users, color: "#7C3AED", change: "+3", up: true },
          { label: "Conversaciones", value: "45", icon: MessageSquare, color: "#06B6D4", change: "12 activas", up: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              {stat.up !== null && (
                stat.up ? (
                  <ArrowUp className="w-4 h-4 text-[#34D399]" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-[#EF4444]" />
                )
              )}
            </div>
            <p className="text-3xl font-bold text-[#0F1F63]">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            <p className={`text-xs mt-2 ${stat.up === true ? "text-[#34D399]" : stat.up === false ? "text-[#EF4444]" : "text-muted-foreground"}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Sofia performance */}
      <div className="bg-gradient-to-r from-[#34D399]/5 via-[#06B6D4]/5 to-[#3B82F6]/5 rounded-2xl border border-[#34D399]/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0F1F63]">Rendimiento de Sofía hoy</h3>
            <p className="text-sm text-muted-foreground">Tu agente de ventas IA</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#34D399]">{sofiaStats.conversationsHandled}</p>
            <p className="text-sm text-muted-foreground mt-1">Conversaciones atendidas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#06B6D4]">{sofiaStats.ordersProcessed}</p>
            <p className="text-sm text-muted-foreground mt-1">Pedidos procesados</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#3B82F6]">{sofiaStats.questionsAnswered}</p>
            <p className="text-sm text-muted-foreground mt-1">Preguntas respondidas</p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Pedidos recientes</h3>
            <Button variant="ghost" size="sm" className="text-[#34D399]">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{order.customer}</span>
                    <span className="text-xs text-muted-foreground">{order.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#0F1F63]">${order.total.toFixed(2)}</p>
                  <span 
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1"
                    style={{ backgroundColor: statusColors[order.status as keyof typeof statusColors].bg }}
                  >
                    {statusColors[order.status as keyof typeof statusColors].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active conversations */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Conversaciones activas</h3>
            <Button variant="ghost" size="sm" className="text-[#34D399]">
              Ver todas
            </Button>
          </div>
          <div className="space-y-4">
            {recentConversations.map((conv) => (
              <div key={conv.id} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center text-white text-sm font-semibold">
                    {conv.customer.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {channelIcons[conv.channel]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{conv.customer}</p>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{conv.message}</p>
                </div>
                {conv.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
