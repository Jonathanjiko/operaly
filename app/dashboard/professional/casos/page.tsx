"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, Filter, FolderOpen, Clock, CheckCircle2, 
  AlertCircle, User, FileText, Calendar, MoreHorizontal,
  ChevronRight, Tag
} from "lucide-react"

const cases = [
  { 
    id: 1, 
    title: "Caso de Divorcio - López vs López",
    client: "María López",
    status: "active",
    priority: "high",
    documents: 12,
    notes: 8,
    lastUpdate: "Hoy, 10:30 AM",
    dueDate: "15 Abr 2026",
    category: "Familiar"
  },
  { 
    id: 2, 
    title: "Consultoría Empresarial - Tech Solutions",
    client: "Carlos Mendoza",
    status: "active",
    priority: "medium",
    documents: 5,
    notes: 3,
    lastUpdate: "Ayer, 4:15 PM",
    dueDate: "20 Abr 2026",
    category: "Empresarial"
  },
  { 
    id: 3, 
    title: "Planificación Tributaria 2026",
    client: "Ana García",
    status: "pending",
    priority: "low",
    documents: 8,
    notes: 5,
    lastUpdate: "12 Mar 2026",
    dueDate: "30 Abr 2026",
    category: "Tributario"
  },
  { 
    id: 4, 
    title: "Constitución de Empresa",
    client: "Roberto Sánchez",
    status: "completed",
    priority: "medium",
    documents: 15,
    notes: 10,
    lastUpdate: "10 Mar 2026",
    dueDate: "01 Mar 2026",
    category: "Societario"
  },
]

const statusConfig = {
  active: { label: "Activo", color: "#34D399", bgColor: "bg-[#34D399]/10" },
  pending: { label: "Pendiente", color: "#F59E0B", bgColor: "bg-[#F59E0B]/10" },
  completed: { label: "Completado", color: "#3B82F6", bgColor: "bg-[#3B82F6]/10" },
}

const priorityConfig = {
  high: { label: "Alta", color: "#EF4444" },
  medium: { label: "Media", color: "#F59E0B" },
  low: { label: "Baja", color: "#22C55E" },
}

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCase, setSelectedCase] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")

  const filteredCases = cases.filter(c => {
    if (filter !== "all" && c.status !== filter) return false
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !c.client.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Casos</h1>
          <p className="text-muted-foreground">Gestiona tus casos y expedientes</p>
        </div>
        <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo caso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total casos", value: "24", icon: FolderOpen, color: "#3B82F6" },
          { label: "Activos", value: "12", icon: Clock, color: "#34D399" },
          { label: "Pendientes", value: "8", icon: AlertCircle, color: "#F59E0B" },
          { label: "Completados", value: "4", icon: CheckCircle2, color: "#7C3AED" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
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
            placeholder="Buscar casos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f 
                  ? "bg-[#3B82F6] text-white" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {f === "all" ? "Todos" : statusConfig[f as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases list */}
      <div className="grid gap-4">
        {filteredCases.map((caseItem) => {
          const status = statusConfig[caseItem.status as keyof typeof statusConfig]
          const priority = priorityConfig[caseItem.priority as keyof typeof priorityConfig]
          
          return (
            <div 
              key={caseItem.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-[#3B82F6]/30 transition-all cursor-pointer"
              onClick={() => setSelectedCase(caseItem.id)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Main info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#0F1F63]">{caseItem.title}</h3>
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor}`}
                      style={{ color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {caseItem.client}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      {caseItem.category}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Vence: {caseItem.dueDate}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-[#3B82F6]" />
                    <span className="font-medium">{caseItem.documents}</span>
                    <span className="text-muted-foreground">docs</span>
                  </div>
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: priority.color }}
                    title={`Prioridad: ${priority.label}`}
                  />
                  <span className="text-xs text-muted-foreground">{caseItem.lastUpdate}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
