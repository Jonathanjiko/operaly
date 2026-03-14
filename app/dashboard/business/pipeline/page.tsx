"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Plus, MoreHorizontal, User, DollarSign, 
  Calendar, MessageSquare, Phone, Mail
} from "lucide-react"

const stages = [
  { id: "lead", label: "Lead", color: "#6B7280" },
  { id: "interested", label: "Interesado", color: "#3B82F6" },
  { id: "quote", label: "Cotización", color: "#F59E0B" },
  { id: "reservation", label: "Reserva/Pedido", color: "#7C3AED" },
  { id: "paid", label: "Pagado", color: "#34D399" },
]

const initialDeals = [
  { id: 1, name: "María García", value: 1500, stage: "lead", source: "WhatsApp", lastContact: "Hace 2h", product: "Servicio premium" },
  { id: 2, name: "Carlos López", value: 2800, stage: "lead", source: "Instagram", lastContact: "Hace 5h", product: "Paquete completo" },
  { id: 3, name: "Ana Martínez", value: 950, stage: "interested", source: "WhatsApp", lastContact: "Hoy", product: "Consulta básica" },
  { id: 4, name: "Pedro Sánchez", value: 3200, stage: "interested", source: "Facebook", lastContact: "Ayer", product: "Servicio VIP" },
  { id: 5, name: "Laura Ruiz", value: 1200, stage: "quote", source: "WhatsApp", lastContact: "Hoy", product: "Pack mensual" },
  { id: 6, name: "Roberto Torres", value: 4500, stage: "quote", source: "WhatsApp", lastContact: "Hace 3h", product: "Contrato anual" },
  { id: 7, name: "Carmen Díaz", value: 800, stage: "reservation", source: "Instagram", lastContact: "Hace 1h", product: "Reserva spa" },
  { id: 8, name: "Miguel Fernández", value: 2100, stage: "paid", source: "WhatsApp", lastContact: "Hace 2d", product: "Tratamiento completo" },
]

const sourceIcons = {
  WhatsApp: <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white text-[10px] font-bold">W</div>,
  Instagram: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white text-[10px] font-bold">I</div>,
  Facebook: <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[10px] font-bold">F</div>,
}

export default function PipelinePage() {
  const [deals, setDeals] = useState(initialDeals)

  const getDealsForStage = (stageId: string) => deals.filter(d => d.stage === stageId)
  const getStageTotal = (stageId: string) => getDealsForStage(stageId).reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Pipeline de Ventas</h1>
          <p className="text-muted-foreground">Gestiona tus oportunidades de venta</p>
        </div>
        <Button className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const count = getDealsForStage(stage.id).length
          const total = getStageTotal(stage.id)
          return (
            <div key={stage.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-medium text-foreground">{stage.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#0F1F63]">{count}</p>
              <p className="text-sm text-muted-foreground">S/ {total.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageDeals = getDealsForStage(stage.id)
            
            return (
              <div key={stage.id} className="w-80 flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-semibold text-[#0F1F63]">{stage.label}</h3>
                    <span className="text-sm text-muted-foreground">({stageDeals.length})</span>
                  </div>
                  <button className="p-1 hover:bg-secondary rounded-lg">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div 
                      key={deal.id}
                      className="bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-[#34D399]/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center text-white text-xs font-semibold">
                            {deal.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-[#0F1F63] text-sm">{deal.name}</p>
                            <p className="text-xs text-muted-foreground">{deal.product}</p>
                          </div>
                        </div>
                        {sourceIcons[deal.source as keyof typeof sourceIcons]}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#047857]">
                          S/ {deal.value.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">{deal.lastContact}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="flex-1" />
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="bg-secondary/30 rounded-xl border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">Sin leads en esta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
