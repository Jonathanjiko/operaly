"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Plus, Calendar, Clock, User, Video, MapPin, 
  CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react"

const reservations = [
  { 
    id: 1, 
    client: "María López",
    type: "Consulta presencial",
    date: "14 Mar 2026",
    time: "10:00 AM",
    duration: "1 hora",
    status: "confirmed",
    location: "Oficina principal",
    notes: "Primera consulta - caso de divorcio"
  },
  { 
    id: 2, 
    client: "Carlos Mendoza",
    type: "Videollamada",
    date: "14 Mar 2026",
    time: "2:00 PM",
    duration: "30 min",
    status: "confirmed",
    location: "Google Meet",
    notes: "Seguimiento proyecto Tech Solutions"
  },
  { 
    id: 3, 
    client: "Ana García",
    type: "Consulta telefónica",
    date: "15 Mar 2026",
    time: "11:00 AM",
    duration: "30 min",
    status: "pending",
    location: "Llamada",
    notes: "Revisión documentos tributarios"
  },
  { 
    id: 4, 
    client: "Roberto Sánchez",
    type: "Consulta presencial",
    date: "16 Mar 2026",
    time: "4:00 PM",
    duration: "1 hora",
    status: "cancelled",
    location: "Oficina principal",
    notes: "Cancelado por el cliente"
  },
]

const statusConfig = {
  confirmed: { label: "Confirmada", color: "#34D399", icon: CheckCircle2 },
  pending: { label: "Pendiente", color: "#F59E0B", icon: AlertCircle },
  cancelled: { label: "Cancelada", color: "#EF4444", icon: XCircle },
}

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const currentMonth = "Marzo 2026"

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(14)
  const [view, setView] = useState<"list" | "calendar">("list")

  const todayReservations = reservations.filter(r => r.date === "14 Mar 2026")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Reservas</h1>
          <p className="text-muted-foreground">Gestiona tus citas y consultas</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "list" ? "bg-white shadow-sm text-[#0F1F63]" : "text-muted-foreground"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "calendar" ? "bg-white shadow-sm text-[#0F1F63]" : "text-muted-foreground"
              }`}
            >
              Calendario
            </button>
          </div>
          <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Nueva reserva
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mini calendar */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[#0F1F63]">{currentMonth}</h3>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 5 // offset for starting day
              const isCurrentMonth = day > 0 && day <= 31
              const hasReservation = [14, 15, 16, 20, 22].includes(day)
              const isSelected = selectedDate === day
              const isToday = day === 14

              return (
                <button
                  key={i}
                  onClick={() => isCurrentMonth && setSelectedDate(day)}
                  disabled={!isCurrentMonth}
                  className={`
                    relative aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                    ${!isCurrentMonth ? "text-muted-foreground/30" : "text-foreground hover:bg-secondary"}
                    ${isSelected ? "bg-[#3B82F6] text-white hover:bg-[#3B82F6]" : ""}
                    ${isToday && !isSelected ? "font-bold" : ""}
                  `}
                >
                  {isCurrentMonth ? day : ""}
                  {hasReservation && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#3B82F6]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Reservations list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-[#0F1F63]">
            Reservas del {selectedDate} Mar 2026
          </h3>

          {todayReservations.length > 0 ? (
            <div className="space-y-3">
              {todayReservations.map((reservation) => {
                const status = statusConfig[reservation.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <div 
                    key={reservation.id}
                    className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${status.color}15` }}
                      >
                        {reservation.type.includes("Video") ? (
                          <Video className="w-6 h-6" style={{ color: status.color }} />
                        ) : (
                          <User className="w-6 h-6" style={{ color: status.color }} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-[#0F1F63]">{reservation.client}</h4>
                          <span 
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${status.color}15`, color: status.color }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{reservation.type}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {reservation.time} ({reservation.duration})
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {reservation.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay reservas para esta fecha</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
