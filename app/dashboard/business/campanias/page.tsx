"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Plus, Search, Send, Clock, CheckCircle2, 
  Users, MessageSquare, BarChart3, MoreHorizontal,
  Play, Pause, Calendar
} from "lucide-react"
import { Input } from "@/components/ui/input"

const campaigns = [
  { 
    id: 1, 
    name: "Promoción Día de la Madre",
    status: "active",
    type: "promotional",
    recipients: 1250,
    sent: 1180,
    opened: 890,
    clicked: 234,
    scheduledDate: null,
    createdAt: "10 Mar 2026"
  },
  { 
    id: 2, 
    name: "Recordatorio de Citas",
    status: "active",
    type: "reminder",
    recipients: 45,
    sent: 45,
    opened: 42,
    clicked: 38,
    scheduledDate: null,
    createdAt: "8 Mar 2026"
  },
  { 
    id: 3, 
    name: "Oferta de Temporada",
    status: "scheduled",
    type: "promotional",
    recipients: 2500,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledDate: "20 Mar 2026, 10:00 AM",
    createdAt: "12 Mar 2026"
  },
  { 
    id: 4, 
    name: "Bienvenida Nuevos Clientes",
    status: "completed",
    type: "welcome",
    recipients: 320,
    sent: 320,
    opened: 285,
    clicked: 156,
    scheduledDate: null,
    createdAt: "1 Mar 2026"
  },
]

const statusConfig = {
  active: { label: "Activa", color: "#34D399", icon: Play },
  scheduled: { label: "Programada", color: "#3B82F6", icon: Clock },
  completed: { label: "Completada", color: "#7C3AED", icon: CheckCircle2 },
  paused: { label: "Pausada", color: "#F59E0B", icon: Pause },
}

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredCampaigns = campaigns.filter(c => {
    if (filter !== "all" && c.status !== filter) return false
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0)
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Campañas</h1>
          <p className="text-muted-foreground">Crea y gestiona campañas de mensajes</p>
        </div>
        <Button className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Nueva campaña
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Campañas activas", value: "2", icon: Play, color: "#34D399" },
          { label: "Mensajes enviados", value: totalSent.toLocaleString(), icon: Send, color: "#3B82F6" },
          { label: "Tasa de apertura", value: `${avgOpenRate}%`, icon: MessageSquare, color: "#7C3AED" },
          { label: "Total clics", value: campaigns.reduce((sum, c) => sum + c.clicked, 0).toLocaleString(), icon: BarChart3, color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1F63]">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar campañas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "scheduled", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f 
                  ? "bg-[#34D399] text-white" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {f === "all" ? "Todas" : statusConfig[f as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns list */}
      <div className="grid gap-4">
        {filteredCampaigns.map((campaign) => {
          const status = statusConfig[campaign.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0
          const clickRate = campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0

          return (
            <div 
              key={campaign.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-[#34D399]/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Main info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#0F1F63]">{campaign.name}</h3>
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${status.color}15`, color: status.color }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {campaign.recipients.toLocaleString()} destinatarios
                    </span>
                    {campaign.scheduledDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {campaign.scheduledDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  {campaign.sent > 0 && (
                    <>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#0F1F63]">{campaign.sent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Enviados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#34D399]">{openRate}%</p>
                        <p className="text-xs text-muted-foreground">Apertura</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#3B82F6]">{clickRate}%</p>
                        <p className="text-xs text-muted-foreground">Clics</p>
                      </div>
                    </>
                  )}
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
