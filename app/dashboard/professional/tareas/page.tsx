"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus, RefreshCw, Trash2, Pencil, Save, X,
  CalendarDays, CheckCircle2, Circle, GripVertical, Flag,
} from "lucide-react"
import {
  DndContext, PointerSensor, closestCenter,
  useSensor, useSensors, useDroppable, useDraggable, DragEndEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type TaskRow = {
  id: string; client_id: string; title: string | null
  description: string | null; due_at: string | null
  status: string | null; priority: string | null
  category: string | null; created_at: string | null
}
type Toast = { open: boolean; msg: string; type: "success" | "error" | "info" }

const S = { PENDING: "pending", IN_PROGRESS: "in_progress", COMPLETED: "completed" } as const

const COLS = [
  { key: S.PENDING,     label: "Pendientes",  color: "#F59E0B", light: "bg-amber-50",   dot: "bg-amber-400",   ring: "ring-amber-200"   },
  { key: S.IN_PROGRESS, label: "En progreso", color: "#3B82F6", light: "bg-blue-50",    dot: "bg-blue-400",    ring: "ring-blue-200"    },
  { key: S.COMPLETED,   label: "Completadas", color: "#10B981", light: "bg-emerald-50", dot: "bg-emerald-400", ring: "ring-emerald-200" },
]

const PRIOS = [
  { v: "high",   label: "Alta",  color: "#EF4444", emoji: "🔴" },
  { v: "medium", label: "Media", color: "#F59E0B", emoji: "🟡" },
  { v: "low",    label: "Baja",  color: "#10B981", emoji: "🟢" },
]

function norm(s: string | null) {
  const v = (s || "").toLowerCase()
  if (["in_progress","in-progress","doing","active","progress"].includes(v)) return S.IN_PROGRESS
  if (["completed","done","closed","finished"].includes(v)) return S.COMPLETED
  return S.PENDING
}

function toLocalDT(v: string | null) {
  if (!v) return ""
  const d = new Date(v)
  if (isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`
}

function toISO(v: string) {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function relDate(v: string | null) {
  if (!v) return null
  const d = new Date(v), now = Date.now(), diff = d.getTime() - now
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return { text: `Venció hace ${Math.abs(days)}d`, overdue: true }
  if (days === 0) return { text: "Hoy", overdue: false }
  if (days === 1) return { text: "Mañana", overdue: false }
  if (days < 7) return { text: `En ${days} días`, overdue: false }
  return { text: d.toLocaleDateString("es-PE", { day:"numeric", month:"short" }), overdue: false }
}

function fullDate(v: string | null) {
  if (!v) return "Sin fecha"
  const d = new Date(v)
  return isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleString("es-PE", { weekday:"long", day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" })
}

// ── Column ──────────────────────────────────────────────────────────────────
function Column({ id, label, color, light, dot, count, children }: {
  id: string; label: string; color: string; light: string; dot: string; count: number; children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`flex flex-col rounded-2xl border transition-all min-h-[300px] ${isOver ? "border-[#3B82F6]/40 shadow-md" : "border-border"} bg-secondary/10`}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${light} border-b border-border`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-sm font-bold" style={{ color }}>{label}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-white/50" style={{ color }}>{count}</span>
      </div>
      <div className="p-2.5 space-y-2 flex-1">
        {count === 0 ? (
          <div className="py-10 text-center">
            <Circle className="w-7 h-7 mx-auto mb-2 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground">Sin tareas</p>
          </div>
        ) : children}
      </div>
    </div>
  )
}

// ── Card ────────────────────────────────────────────────────────────────────
function Card({ task, onClick, onEdit, onDelete, onMove }: {
  task: TaskRow; onClick: () => void; onEdit: () => void
  onDelete: () => void; onMove: (s: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const rel = relDate(task.due_at)
  const prio = PRIOS.find(p => p.v === task.priority) || PRIOS[1]
  const done = norm(task.status) === S.COMPLETED

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`group bg-card rounded-xl border border-border p-3.5 transition-all select-none ${
        isDragging ? "opacity-50 shadow-2xl scale-105 rotate-1" : "hover:border-[#3B82F6]/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-2">
        <div {...listeners} {...attributes}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-30 transition-opacity flex-shrink-0 touch-none">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <p className={`text-sm font-semibold leading-snug ${done ? "line-through text-muted-foreground" : rel?.overdue ? "text-[#EF4444]" : "text-[#0F1F63]"}`}>
            {task.title || "Sin título"}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold" style={{ color: prio.color }}>{prio.emoji} {prio.label}</span>
            {rel && (
              <span className={`text-[10px] font-medium flex items-center gap-0.5 ${rel.overdue ? "text-[#EF4444]" : "text-muted-foreground"}`}>
                <CalendarDays className="w-3 h-3" />{rel.text}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Hover actions */}
      <div className="mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!done && (
          <button onClick={() => onMove(S.COMPLETED)}
            className="h-6 px-2 rounded-lg text-[10px] font-medium bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completar
          </button>
        )}
        <button onClick={onEdit}
          className="h-6 px-2 rounded-lg text-[10px] font-medium border border-border bg-background hover:bg-secondary transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={onDelete}
          className="h-6 px-2 rounded-lg text-[10px] font-medium border border-border bg-background hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444] transition-colors ml-auto">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ task, onClose, onEdit, onDelete, onMove }: {
  task: TaskRow; onClose: () => void; onEdit: () => void
  onDelete: () => void; onMove: (s: string) => void
}) {
  const status = norm(task.status)
  const col = COLS.find(c => c.key === status)!
  const rel = relDate(task.due_at)
  const prio = PRIOS.find(p => p.v === task.priority) || PRIOS[1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in">
        {/* Top accent */}
        <div className="h-1.5 w-full" style={{ backgroundColor: col.color }} />
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.label}</span>
              <span className="text-[10px] font-semibold ml-1" style={{ color: prio.color }}>{prio.emoji} {prio.label}</span>
            </div>
            <h2 className="text-lg font-bold text-[#0F1F63] leading-snug">{task.title || "Sin título"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 pb-5 space-y-4">
          {task.description && (
            <div className="bg-secondary/40 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción</p>
              <p className="text-sm text-[#0F1F63] leading-relaxed">{task.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/40 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Fecha límite</p>
              {rel ? (
                <>
                  <p className={`text-sm font-bold ${rel.overdue ? "text-[#EF4444]" : "text-[#0F1F63]"}`}>{rel.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{fullDate(task.due_at)}</p>
                </>
              ) : <p className="text-sm text-muted-foreground">Sin fecha</p>}
            </div>
            <div className="bg-secondary/40 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Creada</p>
              <p className="text-sm text-[#0F1F63]">
                {task.created_at ? new Date(task.created_at).toLocaleDateString("es-PE", { day:"numeric", month:"short", year:"numeric" }) : "—"}
              </p>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {status !== S.PENDING && (
              <button onClick={() => { onMove(S.PENDING); onClose() }}
                className="h-8 px-3 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-secondary transition-colors">
                ← Pendiente
              </button>
            )}
            {status !== S.IN_PROGRESS && (
              <button onClick={() => { onMove(S.IN_PROGRESS); onClose() }}
                className="h-8 px-3 rounded-xl text-xs font-semibold border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors">
                En progreso
              </button>
            )}
            {status !== S.COMPLETED && (
              <button onClick={() => { onMove(S.COMPLETED); onClose() }}
                className="h-8 px-3 rounded-xl text-xs font-semibold border border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] hover:bg-[#10B981]/10 transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onEdit(); onClose() }}
              className="flex-1 h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-semibold hover:bg-[#1a2f7a] transition-colors flex items-center justify-center gap-2">
              <Pencil className="w-4 h-4" /> Editar
            </button>
            <button onClick={() => { onDelete(); onClose() }}
              className="h-10 w-10 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ task, onClose, onSave }: {
  task?: TaskRow; onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [title, setTitle]       = useState(task?.title || "")
  const [desc, setDesc]         = useState(task?.description || "")
  const [dueAt, setDueAt]       = useState(toLocalDT(task?.due_at || null))
  const [priority, setPriority] = useState(task?.priority || "medium")
  const [status, setStatus]     = useState(norm(task?.status || null))
  const [saving, setSaving]     = useState(false)

  const handle = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), description: desc.trim() || null, due_at: toISO(dueAt), priority, status })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-bold text-[#0F1F63]">{task ? "Editar tarea" : "Nueva tarea"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
              placeholder="¿Qué tienes pendiente?"
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handle()}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] placeholder:font-normal" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="Detalles opcionales..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Fecha límite</label>
              <input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Prioridad</label>
              <div className="flex gap-1.5">
                {PRIOS.map(p => (
                  <button key={p.v} onClick={() => setPriority(p.v)}
                    className={`flex-1 h-10 rounded-xl text-sm transition-all border font-bold ${priority === p.v ? "text-white border-transparent shadow-sm" : "border-border bg-background"}`}
                    style={priority === p.v ? { backgroundColor: p.color } : {}}>
                    {p.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {task && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Estado</label>
              <div className="grid grid-cols-3 gap-1.5">
                {COLS.map(col => (
                  <button key={col.key} onClick={() => setStatus(col.key)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all border ${status === col.key ? "text-white border-transparent" : "border-border bg-background text-muted-foreground"}`}
                    style={status === col.key ? { backgroundColor: col.color } : {}}>
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handle} disabled={saving || !title.trim()}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : task ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {task ? "Guardar cambios" : "Crear tarea"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function TareasPage() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const [loading, setLoading]     = useState(true)
  const [tasks, setTasks]         = useState<TaskRow[]>([])
  const [clientId, setClientId]   = useState("")
  const [search, setSearch]       = useState("")
  const [filterPrio, setFilterPrio] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [detail, setDetail]       = useState<TaskRow | null>(null)
  const [editing, setEditing]     = useState<TaskRow | null>(null)
  const [toast, setToast]         = useState<Toast>({ open: false, msg: "", type: "info" })

  const show = (msg: string, type: Toast["type"] = "info") => setToast({ open: true, msg, type })

  const load = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)
      const { data, error } = await supabase.from("tasks")
        .select("id,client_id,title,description,due_at,status,priority,category,created_at")
        .eq("client_id", cid).order("created_at", { ascending: false })
      if (error) throw error
      setTasks((data || []).map((t: any) => ({ ...t, status: norm(t.status) })))
    } catch (err: any) { show(err.message || "Error al cargar.", "error") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase()
    return (!q || (t.title || "").toLowerCase().includes(q)) &&
           (!filterPrio || t.priority === filterPrio)
  }), [tasks, search, filterPrio])

  const grouped = useMemo(() => ({
    [S.PENDING]:     filtered.filter(t => norm(t.status) === S.PENDING),
    [S.IN_PROGRESS]: filtered.filter(t => norm(t.status) === S.IN_PROGRESS),
    [S.COMPLETED]:   filtered.filter(t => norm(t.status) === S.COMPLETED),
  }), [filtered])

  const handleCreate = async (data: any) => {
    const { error } = await supabase.from("tasks").insert({ client_id: clientId, ...data, status: S.PENDING, created_at: new Date().toISOString() })
    if (error) throw error
    show("Tarea creada.", "success"); await load()
  }

  const handleUpdate = async (data: any) => {
    if (!editing) return
    const { error } = await supabase.from("tasks").update({ ...data, updated_at: new Date().toISOString() }).eq("id", editing.id)
    if (error) throw error
    show("Tarea actualizada.", "success"); await load()
  }

  const handleMove = async (id: string, status: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    const { error } = await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) { await load() }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (error) { show("Error al eliminar.", "error"); return }
    show("Tarea eliminada.", "success"); setTasks(prev => prev.filter(t => t.id !== id))
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const cols = [S.PENDING, S.IN_PROGRESS, S.COMPLETED]
    if (cols.includes(over.id as string)) handleMove(String(active.id), String(over.id))
  }

  const overdue = tasks.filter(t => {
    if (!t.due_at) return false
    return new Date(t.due_at).getTime() < Date.now() && norm(t.status) !== S.COMPLETED
  }).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Tareas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {grouped[S.PENDING].length} pendientes · {tasks.length} total
            {overdue > 0 && <span className="ml-2 text-[#EF4444] font-medium">· {overdue} vencidas ⚠️</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tareas..."
          className="h-9 px-3 rounded-xl border border-border bg-background text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
        <div className="flex gap-1.5">
          {["", ...PRIOS.map(p => p.v)].map(v => {
            const p = PRIOS.find(x => x.v === v)
            return (
              <button key={v} onClick={() => setFilterPrio(v)}
                className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all border ${filterPrio === v ? "bg-[#0F1F63] text-white border-transparent" : "border-border bg-background text-muted-foreground hover:border-[#3B82F6]/30"}`}>
                {v === "" ? "Todas" : `${p?.emoji} ${p?.label}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Cargando...
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6">
            {COLS.map(col => (
              <Column key={col.key} id={col.key} label={col.label}
                color={col.color} light={col.light} dot={col.dot}
                count={(grouped[col.key] || []).length}>
                {(grouped[col.key] || []).map(task => (
                  <Card key={task.id} task={task}
                    onClick={() => setDetail(task)}
                    onEdit={() => setEditing(task)}
                    onDelete={() => handleDelete(task.id)}
                    onMove={(s) => handleMove(task.id, s)} />
                ))}
              </Column>
            ))}
          </div>
        </DndContext>
      )}

      {/* Modals */}
      {showCreate && <FormModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {detail && !editing && (
        <DetailModal task={detail} onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null) }}
          onDelete={() => { handleDelete(detail.id); setDetail(null) }}
          onMove={(s) => { handleMove(detail.id, s); setDetail(null) }} />
      )}
      {editing && <FormModal task={editing} onClose={() => setEditing(null)} onSave={handleUpdate} />}

      <AppToast open={toast.open} message={toast.msg} type={toast.type} onClose={() => setToast(p => ({...p, open: false}))} />
    </div>
  )
}
