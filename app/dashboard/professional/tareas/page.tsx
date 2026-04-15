"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, GripVertical, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react"
import { DndContext, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { AppToast } from "@/components/ui/app-toast"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

type TaskRow = { id: string; client_id: string; title: string | null; description: string | null; due_at: string | null; status: string | null; priority: string | null; created_at: string | null }
type Toast = { open: boolean; msg: string; type: "success" | "error" | "info" }
type TaskStatus = "pending" | "in_progress" | "completed"

const STATUS_LABELS: Record<TaskStatus, string> = { pending: "Pendientes", in_progress: "En progreso", completed: "Completadas" }
const PRIORITIES = [{ value: "high", label: "Alta" }, { value: "medium", label: "Media" }, { value: "low", label: "Baja" }]

function normalizeStatus(value: string | null): TaskStatus {
  const normalized = String(value || "").toLowerCase()
  if (["in_progress", "in-progress", "doing", "active", "progress"].includes(normalized)) return "in_progress"
  if (["completed", "done", "closed", "finished"].includes(normalized)) return "completed"
  return "pending"
}

function toLocalDateTime(value: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function toIso(value: string) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function Column({ id, label, count, children }: { id: TaskStatus; label: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return <div ref={setNodeRef} className={`flex flex-col rounded-2xl border min-h-[320px] ${isOver ? "border-[#3B82F6]/40 shadow-md" : "border-border"} bg-secondary/10`}><div className="flex items-center justify-between px-4 py-3 rounded-t-2xl border-b border-border"><span className="text-sm font-bold text-[#0F1F63]">{label}</span><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-white/50">{count}</span></div><div className="p-2.5 space-y-2 flex-1">{children}</div></div>
}

function TaskCard({ task, locale, onOpen, onEdit, onDelete, onMove }: { task: TaskRow; locale: string; onOpen: () => void; onEdit: () => void; onDelete: () => void; onMove: (status: TaskStatus) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const dueText = task.due_at ? new Date(task.due_at).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Sin fecha"
  const done = normalizeStatus(task.status) === "completed"
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} className={`group bg-card rounded-xl border border-border p-3.5 transition-all ${isDragging ? "opacity-50 shadow-2xl scale-105 rotate-1" : "hover:border-[#3B82F6]/30 hover:shadow-sm"}`}>
      <div className="flex items-start gap-2">
        <div {...listeners} {...attributes} className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-30 transition-opacity flex-shrink-0 touch-none"><GripVertical className="w-3.5 h-3.5 text-muted-foreground" /></div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
          <p className={`text-sm font-semibold leading-snug ${done ? "line-through text-muted-foreground" : "text-[#0F1F63]"}`}>{task.title || "Sin título"}</p>
          {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
          <p className="mt-2 text-[10px] text-muted-foreground">{dueText}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!done && <button onClick={() => onMove("completed")} className="h-6 px-2 rounded-lg text-[10px] font-medium bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />OK</button>}
        <button onClick={onEdit} className="h-6 px-2 rounded-lg text-[10px] font-medium border border-border bg-background hover:bg-secondary"><Pencil className="w-3 h-3" /></button>
        <button onClick={onDelete} className="h-6 px-2 rounded-lg text-[10px] font-medium border border-border bg-background hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444] ml-auto"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  )
}

function TaskForm({ task, onClose, onSave }: { task?: TaskRow; onClose: () => void; onSave: (payload: Partial<TaskRow> & { status?: TaskStatus }) => Promise<void> }) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [dueAt, setDueAt] = useState(toLocalDateTime(task?.due_at || null))
  const [priority, setPriority] = useState(task?.priority || "medium")
  const [status, setStatus] = useState<TaskStatus>(normalizeStatus(task?.status || null))
  const [saving, setSaving] = useState(false)
  async function submit() { if (!title.trim()) return; setSaving(true); await onSave({ title: title.trim(), description: description.trim() || null, due_at: toIso(dueAt), priority, status }); setSaving(false); onClose() }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border"><h3 className="font-bold text-[#0F1F63]">{task ? "Editar tarea" : "Nueva tarea"}</h3><button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><X className="w-4 h-4" /></button></div>
        <div className="p-6 space-y-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus placeholder="¿Qué tienes pendiente?" className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="Detalles opcionales..." className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]">{PRIORITIES.map((priorityRow) => <option key={priorityRow.value} value={priorityRow.value}>{priorityRow.label}</option>)}</select>
          </div>
          {task && <div className="grid grid-cols-3 gap-1.5">{(Object.keys(STATUS_LABELS) as TaskStatus[]).map((currentStatus) => <button key={currentStatus} onClick={() => setStatus(currentStatus)} className={`h-9 rounded-xl text-xs font-bold transition-all border ${status === currentStatus ? "text-white border-transparent bg-[#0F1F63]" : "border-border bg-background text-muted-foreground"}`}>{STATUS_LABELS[currentStatus]}</button>)}</div>}
        </div>
        <div className="px-6 pb-6 flex gap-2.5"><button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-secondary">Cancelar</button><button onClick={submit} disabled={saving || !title.trim()} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">{saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : task ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{task ? "Guardar cambios" : "Crear tarea"}</button></div>
      </div>
    </div>
  )
}

export default function TareasPage() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [clientId, setClientId] = useState("")
  const [search, setSearch] = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<TaskRow | null>(null)
  const [toast, setToast] = useState<Toast>({ open: false, msg: "", type: "info" })
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [locale, setLocale] = useState("es-PE")
  const [timezone, setTimezone] = useState("America/Lima")

  const showToast = (msg: string, type: Toast["type"] = "info") => setToast({ open: true, msg, type })

  async function load() {
    setLoading(true)
    try {
      const currentClientId = await getCurrentClientId()
      setClientId(currentClientId)
      const [{ data: profile }, { data, error }] = await Promise.all([
        supabase.from("clients").select("preferred_language,language,timezone,timezone_auto").eq("id", currentClientId).maybeSingle(),
        supabase.from("tasks").select("id,client_id,title,description,due_at,status,priority,created_at").eq("client_id", currentClientId).order("created_at", { ascending: false }),
      ])
      if (error) throw error
      const resolvedLanguage = resolveLanguageCode(profile?.preferred_language || profile?.language || "es")
      setLanguage(resolvedLanguage)
      setLocale(localeFromLanguage(resolvedLanguage))
      setTimezone(profile?.timezone_auto || profile?.timezone || "America/Lima")
      setTasks((data || []).map((task) => ({ ...task, status: normalizeStatus(task.status) })))
    } catch {
      showToast("Error al cargar.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (!clientId) return
    const ch = supabase.channel(`tasks-rt-${clientId}`).on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `client_id=eq.${clientId}` }, () => load()).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId])

  const filtered = useMemo(() => tasks.filter((task) => (!search || (task.title || "").toLowerCase().includes(search.toLowerCase())) && (!filterPriority || task.priority === filterPriority)), [tasks, search, filterPriority])
  const grouped = useMemo(() => ({ pending: filtered.filter((task) => normalizeStatus(task.status) === "pending"), in_progress: filtered.filter((task) => normalizeStatus(task.status) === "in_progress"), completed: filtered.filter((task) => normalizeStatus(task.status) === "completed") }), [filtered])

  async function createTask(payload: Partial<TaskRow>) { const { error } = await supabase.from("tasks").insert({ client_id: clientId, ...payload, status: "pending", created_at: new Date().toISOString() }); if (error) throw error; showToast("Tarea creada.", "success"); await load() }
  async function updateTask(payload: Partial<TaskRow> & { status?: TaskStatus }) { if (!editing) return; const { error } = await supabase.from("tasks").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id); if (error) throw error; showToast("Tarea actualizada.", "success"); await load() }
  async function moveTask(id: string, status: TaskStatus) { setTasks((prev) => prev.map((task) => task.id === id ? { ...task, status } : task)); const { error } = await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id); if (error) await load() }
  async function deleteTask(id: string) { if (!window.confirm("¿Eliminar esta tarea?")) return; const { error } = await supabase.from("tasks").delete().eq("id", id); if (error) { showToast("Error al eliminar.", "error"); return }; showToast("Tarea eliminada.", "success"); setTasks((prev) => prev.filter((task) => task.id !== id)) }

  function onDragEnd(event: DragEndEvent) {
    const status = String(event.over?.id || "") as TaskStatus
    if (!event.over || !["pending", "in_progress", "completed"].includes(status)) return
    moveTask(String(event.active.id), status)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Tareas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{grouped.pending.length} pendientes · {tasks.length} total</p>
          <p className="text-xs text-muted-foreground mt-1">Sincronizado con Supabase y WhatsApp · {labelForLanguage(language)} · {locale} · {timezone}</p>
          <p className="text-xs text-[#5F6B7A] mt-1">Las tareas con fecha alimentan agenda y usan recordatorio base de 10 min salvo ajuste explícito.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" />Nueva tarea</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tareas..." className="h-9 px-3 rounded-xl border border-border bg-background text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
        <div className="flex gap-1.5">{["", ...PRIORITIES.map((priority) => priority.value)].map((value) => <button key={value} onClick={() => setFilterPriority(value)} className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all border ${filterPriority === value ? "bg-[#0F1F63] text-white border-transparent" : "border-border bg-background text-muted-foreground hover:border-[#3B82F6]/30"}`}>{value === "" ? "Todas" : PRIORITIES.find((priority) => priority.value === value)?.label}</button>)}</div>
      </div>

      {loading ? <div className="flex items-center justify-center py-20 text-muted-foreground gap-2"><RefreshCw className="w-5 h-5 animate-spin" />Cargando...</div> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
              <Column key={status} id={status} label={STATUS_LABELS[status]} count={grouped[status].length}>
                {grouped[status].length === 0 ? <p className="text-xs text-center text-muted-foreground">Sin tareas</p> : grouped[status].map((task) => <TaskCard key={task.id} task={task} locale={locale} onOpen={() => setEditing(task)} onEdit={() => setEditing(task)} onDelete={() => deleteTask(task.id)} onMove={(nextStatus) => moveTask(task.id, nextStatus)} />)}
              </Column>
            ))}
          </div>
        </DndContext>
      )}

      {showCreate && <TaskForm onClose={() => setShowCreate(false)} onSave={createTask} />}
      {editing && <TaskForm task={editing} onClose={() => setEditing(null)} onSave={updateTask} />}
      <AppToast open={toast.open} message={toast.msg} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </div>
  )
}
