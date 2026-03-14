"use client"

import { useState } from "react"
import { 
  Zap, 
  Plus, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Bell,
  FileText,
  Users,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const automations = [
  {
    id: 1,
    name: "Recordatorio de citas",
    description: "Envía recordatorio automático 24h antes de cada cita",
    trigger: "24 horas antes de cita",
    action: "Enviar WhatsApp",
    enabled: true,
    icon: Calendar,
    color: "text-[#3B82F6]",
    bgColor: "bg-[#3B82F6]/10",
  },
  {
    id: 2,
    name: "Seguimiento post-consulta",
    description: "Mensaje de seguimiento 3 días después de consulta",
    trigger: "3 días después de consulta",
    action: "Enviar WhatsApp",
    enabled: true,
    icon: MessageSquare,
    color: "text-[#7C3AED]",
    bgColor: "bg-[#7C3AED]/10",
  },
  {
    id: 3,
    name: "Documentos pendientes",
    description: "Notificar cuando hay documentos por revisar",
    trigger: "Documento recibido",
    action: "Notificación interna",
    enabled: false,
    icon: FileText,
    color: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10",
  },
  {
    id: 4,
    name: "Cumpleaños de clientes",
    description: "Felicitación automática en cumpleaños",
    trigger: "Día de cumpleaños",
    action: "Enviar WhatsApp",
    enabled: true,
    icon: Users,
    color: "text-[#34D399]",
    bgColor: "bg-[#34D399]/10",
  },
]

const templates = [
  {
    name: "Recordatorio de pago",
    description: "Envía recordatorio cuando un pago está pendiente",
    icon: Bell,
  },
  {
    name: "Resumen semanal",
    description: "Envía resumen de actividad cada lunes",
    icon: Clock,
  },
  {
    name: "Bienvenida a nuevos clientes",
    description: "Mensaje de bienvenida automático",
    icon: Users,
  },
]

export default function AutomationsPage() {
  const [automationStates, setAutomationStates] = useState<Record<number, boolean>>(
    automations.reduce((acc, a) => ({ ...acc, [a.id]: a.enabled }), {})
  )

  const toggleAutomation = (id: number) => {
    setAutomationStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Automatizaciones</h1>
          <p className="text-muted-foreground">Configura acciones automáticas con Sofía</p>
        </div>
        <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva automatización
        </Button>
      </div>

      {/* Sofia tip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 via-[#3B82F6]/10 to-[#06B6D4]/10 border border-[#7C3AED]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-[#0F1F63]">Sofía puede automatizar tareas por ti</p>
            <p className="text-sm text-muted-foreground mt-1">
              Configura reglas y deja que Sofía ejecute acciones automáticamente según los eventos que definas.
            </p>
          </div>
        </div>
      </div>

      {/* Active Automations */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Automatizaciones activas</h2>
        <div className="grid gap-4">
          {automations.map((automation) => (
            <Card key={automation.id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${automation.bgColor}`}>
                      <automation.icon className={`w-6 h-6 ${automation.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0F1F63]">{automation.name}</h3>
                      <p className="text-sm text-muted-foreground">{automation.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {automation.trigger}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {automation.action}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className="focus:outline-none"
                    >
                      {automationStates[automation.id] ? (
                        <ToggleRight className="w-10 h-10 text-[#34D399]" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                      )}
                    </button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Plantillas sugeridas</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.name} className="border-border/50 hover:border-[#3B82F6]/50 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#3B82F6]/10 group-hover:bg-[#3B82F6]/20 transition-colors">
                    <template.icon className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-[#3B82F6] transition-colors" />
                </div>
                <h3 className="font-medium text-[#0F1F63]">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
