"use client"

import { useState } from "react"
import { Package, Clock, Truck, Check, Search, Filter, Plus, MoreHorizontal, DollarSign, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const orders = [
  {
    id: "ORD-001",
    customer: "María García",
    phone: "+51 999 888 777",
    items: ["Pizza Margherita x2", "Coca Cola x2"],
    total: 89.90,
    status: "preparing",
    paymentStatus: "paid",
    channel: "whatsapp",
    time: "Hace 15 min",
  },
  {
    id: "ORD-002",
    customer: "Carlos López",
    phone: "+51 999 777 666",
    items: ["Hamburguesa Clásica x1", "Papas fritas x1"],
    total: 45.00,
    status: "pending",
    paymentStatus: "pending",
    channel: "instagram",
    time: "Hace 25 min",
  },
  {
    id: "ORD-003",
    customer: "Ana Martínez",
    phone: "+51 999 666 555",
    items: ["Ensalada César x1", "Agua mineral x1"],
    total: 32.50,
    status: "delivered",
    paymentStatus: "paid",
    channel: "whatsapp",
    time: "Hace 1 hora",
  },
  {
    id: "ORD-004",
    customer: "Luis Rodríguez",
    phone: "+51 999 555 444",
    items: ["Combo Familiar"],
    total: 125.00,
    status: "in_transit",
    paymentStatus: "paid",
    channel: "messenger",
    time: "Hace 45 min",
  },
]

const statusConfig = {
  pending: { icon: Clock, bg: "bg-amber-100", text: "text-amber-700", label: "Pendiente" },
  preparing: { icon: Package, bg: "bg-blue-100", text: "text-blue-700", label: "Preparando" },
  in_transit: { icon: Truck, bg: "bg-purple-100", text: "text-purple-700", label: "En camino" },
  delivered: { icon: Check, bg: "bg-[#34D399]/10", text: "text-[#047857]", label: "Entregado" },
}

export default function PedidosPage() {
  const [filter, setFilter] = useState("all")

  const stats = [
    { label: "Pedidos hoy", value: "24", change: "+8%", icon: Package, color: "from-[#3B82F6] to-[#06B6D4]" },
    { label: "En preparación", value: "5", icon: Clock, color: "from-[#06B6D4] to-[#34D399]" },
    { label: "Ventas del día", value: "S/ 1,450", change: "+12%", icon: DollarSign, color: "from-[#34D399] to-[#06B6D4]" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tus clientes</p>
        </div>
        <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo pedido
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0F1F63] mt-1">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-[#34D399] mt-1">{stat.change} vs ayer</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar pedidos..." className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Todos" },
            { value: "pending", label: "Pendientes" },
            { value: "preparing", label: "Preparando" },
            { value: "in_transit", label: "En camino" },
            { value: "delivered", label: "Entregados" },
          ].map((item) => (
            <Button
              key={item.value}
              variant={filter === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(item.value)}
              className={filter === item.value ? "bg-[#0F1F63]" : ""}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          return (
            <div key={order.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-bold">
                    {order.customer.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0F1F63]">{order.id}</p>
                      <span className="text-xs text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{order.customer}</p>
                    <p className="text-sm text-muted-foreground mt-1">{order.items.join(", ")}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#0F1F63]">S/ {order.total.toFixed(2)}</p>
                    <span className={`text-xs ${order.paymentStatus === "paid" ? "text-[#34D399]" : "text-amber-600"}`}>
                      {order.paymentStatus === "paid" ? "Pagado" : "Pago pendiente"}
                    </span>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {order.paymentStatus === "pending" && (
                      <Button size="sm" variant="outline" className="text-[#3B82F6] border-[#3B82F6]/30">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Link de pago
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sofia tip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 border border-[#7C3AED]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F1F63]">Sofía procesa pedidos automáticamente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Los clientes ordenan por WhatsApp y Sofía genera el pedido, envía confirmación y link de pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
