"use client"

import { useState } from "react"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"

const events = [
  { 
    id: 1, 
    title: "Llamada con María García", 
    time: "09:00 - 09:30",
    type: "call",
    client: "María García",
    color: "#3B82F6"
  },
  { 
    id: 2, 
    title: "Reunión de revisión de contrato", 
    time: "10:00 - 11:00",
    type: "meeting",
    client: "Carlos López",
    location: "Oficina central",
    color: "#34D399"
  },
  { 
    id: 3, 
    title: "Videollamada - Propuesta comercial", 
    time: "14:00 - 14:45",
    type: "video",
    client: "Ana Martínez",
    color: "#7C3AED"
  },
  { 
    id: 4, 
    title: "Seguimiento caso Pedro", 
    time: "16:00 - 16:30",
    type: "call",
    client: "Pedro Sánchez",
    color: "#F59E0B"
  },
]

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("day")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add empty days for the start of the week
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="w-4 h-4" />
      case "video": return <Video className="w-4 h-4" />
      case "meeting": return <Users className="w-4 h-4" />
      default: return <CalendarIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Organiza tus citas y reuniones
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva cita
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[#0F1F63]">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((date, index) => (
              <button
                key={index}
                onClick={() => date && setSelectedDate(date)}
                disabled={!date}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                  !date ? "" :
                  isSelected(date) ? "bg-[#3B82F6] text-white" :
                  isToday(date) ? "bg-[#3B82F6]/10 text-[#3B82F6] font-semibold" :
                  "hover:bg-secondary text-foreground"
                }`}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>

          {/* Mini calendar legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                <span className="text-muted-foreground">Hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#34D399]" />
                <span className="text-muted-foreground">Con citas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day view */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          {/* View switcher */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[#0F1F63]">
                {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <p className="text-sm text-muted-foreground">{events.length} eventos programados</p>
            </div>
            <div className="flex items-center bg-secondary/50 rounded-xl p-1">
              {["day", "week", "month"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as typeof view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === v ? "bg-white shadow-sm text-[#0F1F63]" : "text-muted-foreground"
                  }`}
                >
                  {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
                </button>
              ))}
            </div>
          </div>

          {/* Events list */}
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/30 transition-colors group"
              >
                <div 
                  className="w-1 h-full min-h-[60px] rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${event.color}15`, color: event.color }}
                      >
                        {getEventIcon(event.type)}
                      </div>
                      <button className="p-2 rounded-lg hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">
                      Cliente: <span className="text-foreground font-medium">{event.client}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {events.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-[#0F1F63] mb-2">Sin eventos</h3>
              <p className="text-muted-foreground">No tienes eventos programados para este día</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
