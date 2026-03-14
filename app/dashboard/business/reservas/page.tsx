"use client"

import { useState } from "react"
import { Calendar, Clock, User, Phone, MapPin, Check, X, MoreHorizontal, Plus, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const reservations = [
  {
    id: 1,
    customer: "María García",
    phone: "+51 999 888 777",
    service: "Corte de cabello",
    date: "Hoy",
    time: "14:00",
    status: "confirmed",
    channel: "whatsapp",
  },
  {
    id: 2,
    customer: "Carlos López",
    phone: "+51 999 777 666",
    service: "Mesa para 4",
    date: "Hoy",
    time: "20:00",
    status: "pending",
    channel: "instagram",
  },
  {
    id: 3,
    customer: "Ana Martínez",
    phone: "+51 999 666 555",
    service: "Consulta médica",
    date: "Mañana",
    time: "10:30",
    status: "confirmed",
    channel: "whatsapp",
  },
  {
    id: 4,
    customer: "Luis Rodríguez",
    phone: "+51 999 555 444",
    service: "Clase de yoga",
    date: "Mañana",
    time: "08:00",
    status: "confirmed",
    channel: "messenger",
  },
]

const statusColors = {
  confirmed: { bg: "bg-[#34D399]/10", text: "text-[#047857]", label: "Confirmada" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pendiente" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelada" },
}

const channelIcons = {
  whatsapp: (
    <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      </svg>
    </div>
  ),
  instagram: (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E4405F] to-[#C13584] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
      </svg>
    </div>
  ),
  messenger: (
    <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0z"/>
      </svg>
    </div>
  ),
}

export default function ReservasPage() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Reservas</h1>
          <p className="text-muted-foreground">Gestiona las reservas de tus clientes</p>
        </div>
        <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva reserva
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar reservas..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Todas" },
            { value: "today", label: "Hoy" },
            { value: "tomorrow", label: "Mañana" },
            { value: "pending", label: "Pendientes" },
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

      {/* Reservations list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Servicio</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha y hora</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Canal</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => {
                const status = statusColors[reservation.status as keyof typeof statusColors]
                const channel = channelIcons[reservation.channel as keyof typeof channelIcons]
                return (
                  <tr key={reservation.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-medium">
                          {reservation.customer.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{reservation.customer}</p>
                          <p className="text-sm text-muted-foreground">{reservation.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-foreground">{reservation.service}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{reservation.date}</span>
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                        <span className="text-foreground">{reservation.time}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {channel}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#34D399] hover:text-[#047857]">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sofia tip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 border border-[#7C3AED]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F1F63]">Sofía gestiona tus reservas automáticamente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Los clientes pueden reservar por WhatsApp, Instagram o Messenger. Sofía confirma y te notifica.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
