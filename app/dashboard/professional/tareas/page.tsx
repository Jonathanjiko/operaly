"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle,
  Calendar, User, MoreHorizontal, Flag
} from "lucide-react"

const tasks = [
  { 
    id: 1, 
    title: "Revisar contrato López vs López",
    description: "Revisar cláusulas de custodia compartida",
    client: "María López",
    case: "Divorcio López",
    priority: "high",
    dueDate: "Hoy",
    dueTime: "5:00 PM",
    completed: false,
    category: "revision"
  },
  { 
    id: 2, 
    title: "Llamar a Carlos Mendoza",
    description: "Confirmar reunión de mañana",
    client: "Carlos Mendoza",
    case: "Tech Solutions",
    priority: "medium",
    dueDate: "Hoy",
    dueTime: "3:00 PM",
    completed: true,
    category: "llamada"
  },
  { 
    id: 3, 
    title: "Preparar documentos tributarios",
    description: "Declaración anual 2025",
    client: "Ana García",
    case: "Planificación Tributaria",
    priority: "high",
    dueDate: "Mañana",
    dueTime: "10:00 AM",
    completed: false,
    category: "documentos"
  },
  { 
    id: 4, 
    title: "Enviar propuesta a nuevo cliente",
    description: "Propuesta de servicios legales",
    client: "Pedro Ruiz",
    case: null,
    priority: "low",
    dueDate: "15 Abr",
    dueTime: "12:00 PM",
    completed: false,
    category: "propuesta"
  },
]

const priorityConfig = {
  high: { label: "Alta", color: "#EF4444", bgColor: "bg-red-50" },
  medium: { label: "Media", color: "#F59E0B", bgColor: "bg-amber-50" },
  low: { label: "Baja", color: "#22C55E", bgColor: "bg-green-50" },
}

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [completedTasks, setCompletedTasks] = useState<number[]>([2])
  const [filter, setFilter] = useState("all")

  const toggleTask = (taskId: number) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed" && !completedTasks.includes(task.id)) return false
    if (filter === "pending" && completedTasks.includes(task.id)) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const pendingCount = tasks.filter(t => !completedTasks.includes(t.id)).length
  const completedCount = completedTasks.length
  const todayTasks = tasks.filter(t => t.dueDate === "Hoy" && !completedTasks.includes(t.id)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Tareas</h1>
          <p className="text-muted-foreground">Organiza tu trabajo diario</p>
        </div>
        <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Nueva tarea
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F1F63]">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F1F63]">{todayTasks}</p>
              <p className="text-sm text-muted-foreground">Para hoy</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F1F63]">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: "all", label: "Todas" },
            { id: "pending", label: "Pendientes" },
            { id: "completed", label: "Completadas" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.id 
                  ? "bg-[#3B82F6] text-white" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks list */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isCompleted = completedTasks.includes(task.id)
          const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
          
          return (
            <div 
              key={task.id}
              className={`bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all ${
                isCompleted ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground hover:text-[#3B82F6] transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-semibold text-[#0F1F63] ${isCompleted ? "line-through" : ""}`}>
                      {task.title}
                    </h3>
                    <Flag className="w-4 h-4" style={{ color: priority.color }} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {task.client && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {task.client}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.dueDate}, {task.dueTime}
                    </span>
                  </div>
                </div>

                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
