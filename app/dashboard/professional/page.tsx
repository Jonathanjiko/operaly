"use client"

import { useState } from "react"
import { 
  FileText, 
  Users, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"

const recentContacts = [
  { id: 1, name: "María García", lastMessage: "Gracias por el documento", time: "Hace 2h", avatar: "MG" },
  { id: 2, name: "Carlos López", lastMessage: "¿Cuándo es la cita?", time: "Hace 4h", avatar: "CL" },
  { id: 3, name: "Ana Martínez", lastMessage: "Perfecto, lo reviso", time: "Ayer", avatar: "AM" },
]

const upcomingTasks = [
  { id: 1, title: "Revisar contrato de Carlos", due: "Hoy, 2:00 PM", priority: "high", client: "Carlos López" },
  { id: 2, title: "Llamar a María García", due: "Hoy, 4:30 PM", priority: "medium", client: "María García" },
  { id: 3, title: "Preparar informe mensual", due: "Mañana", priority: "low", client: null },
]

const recentDocuments = [
  { id: 1, name: "Contrato-2024-001.pdf", type: "PDF", size: "2.4 MB", date: "Hace 1 día" },
  { id: 2, name: "Análisis-financiero.xlsx", type: "Excel", size: "1.8 MB", date: "Hace 2 días" },
  { id: 3, name: "Propuesta-cliente.docx", type: "Word", size: "540 KB", date: "Hace 3 días" },
]

const sofiaInsights = [
  { id: 1, message: "Tienes 3 contactos sin seguimiento en los últimos 7 días", action: "Ver contactos" },
  { id: 2, message: "María García cumple años el próximo viernes", action: "Programar mensaje" },
]

export default function ProfessionalDashboardPage() {
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
            {greeting}, Juan
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí está el resumen de tu día
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo contacto
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
            <FileText className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Contactos", value: "47", icon: Users, color: "#3B82F6", change: "+3 esta semana" },
          { label: "Documentos", value: "128", icon: FileText, color: "#06B6D4", change: "+12 este mes" },
          { label: "Pendientes", value: "8", icon: CheckSquare, color: "#F59E0B", change: "3 para hoy" },
          { label: "Conversaciones", value: "23", icon: MessageSquare, color: "#7C3AED", change: "5 activas" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
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

      {/* Sofia insights */}
      <div className="bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 rounded-2xl border border-[#7C3AED]/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0F1F63]">Sugerencias de Sofía</h3>
            <p className="text-sm text-muted-foreground">Basadas en tu actividad reciente</p>
          </div>
        </div>
        <div className="space-y-3">
          {sofiaInsights.map((insight) => (
            <div key={insight.id} className="flex items-center justify-between bg-white/60 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#7C3AED]" />
                <p className="text-sm text-foreground">{insight.message}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#3B82F6]">
                {insight.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending tasks */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Pendientes para hoy</h3>
            <Button variant="ghost" size="sm" className="text-[#3B82F6]">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === "high" ? "bg-[#EF4444]" : 
                  task.priority === "medium" ? "bg-[#F59E0B]" : "bg-[#34D399]"
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  {task.client && <p className="text-sm text-muted-foreground">{task.client}</p>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {task.due}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Contactos recientes</h3>
            <Button variant="ghost" size="sm" className="text-[#3B82F6]">
              Ver todos
            </Button>
          </div>
          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white text-sm font-semibold">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{contact.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
                <span className="text-xs text-muted-foreground">{contact.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F1F63]">Documentos recientes</h3>
          <Button variant="ghost" size="sm" className="text-[#3B82F6]">
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="pb-4 font-medium">Nombre</th>
                <th className="pb-4 font-medium">Tipo</th>
                <th className="pb-4 font-medium">Tamaño</th>
                <th className="pb-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentDocuments.map((doc) => (
                <tr key={doc.id} className="border-t border-border">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <span className="font-medium text-foreground">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{doc.type}</td>
                  <td className="py-4 text-sm text-muted-foreground">{doc.size}</td>
                  <td className="py-4 text-sm text-muted-foreground">{doc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
