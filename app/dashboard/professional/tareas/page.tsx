"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  RefreshCw,
  Trash2,
  Pencil,
  Save,
  X,
  CalendarDays,
} from "lucide-react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragEndEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type TaskRow = {
  id: string
  client_id: string
  title: string | null
  description: string | null
  due_at: string | null
  status: string | null
  priority: string | null
  category: string | null
  created_at: string | null
}

const columns = [
  { key: "pending", label: "Pendientes" },
  { key: "in_progress", label: "En progreso" },
  { key: "completed", label: "Completadas" },
]

type ToastType = "success" | "error" | "info"

function DroppableColumn({
  id,
  label,
  count,
  children,
}: {
  id: string
  label: string
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-card rounded-2xl border border-border p-4 transition-colors ${
        isOver ? "ring-2 ring-[#3B82F6]/30 bg-[#3B82F6]/5" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#0F1F63]">{label}</h2>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

function DraggableTaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
}: {
  task: TaskRow
  onEdit: (task: TaskRow) => void
  onDelete: (id: string) => void
  onMove: (id: string, nextStatus: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-border p-4 bg-secondary/20 ${
        isDragging ? "opacity-70 shadow-xl" : ""
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <p className="font-medium text-[#0F1F63]">{task.title || "Tarea"}</p>

        <p className="text-sm text-muted-foreground mt-1">
          {task.description || "Sin descripción"}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <CalendarDays className="w-4 h-4" />
          <span>
            {task.due_at
              ? new Date(task.due_at).toLocaleString()
              : "Sin fecha"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Prioridad: {task.priority || "—"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => onMove(task.id, "pending")}
        >
          Pendiente
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => onMove(task.id, "in_progress")}
        >
          En progreso
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => onMove(task.id, "completed")}
        >
          Completar
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          onClick={() => onEdit(task)}
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function ProfessionalTasksPage() {
  const sensors = useSensors(useSensor(PointerSensor))

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tasks, setTasks] = useState<TaskRow[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [priority, setPriority] = useState("medium")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueAt, setEditDueAt] = useState("")
  const [editPriority, setEditPriority] = useState("medium")
  const [editStatus, setEditStatus] = useState("pending")

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<ToastType>("info")
  const [toastMessage, setToastMessage] = useState("")

  const showToast = (message: string, type: ToastType = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastOpen(true)
  }

  const closeToast = () => {
    setToastOpen(false)
    setToastMessage("")
  }

  const loadTasks = async () => {
    setLoading(true)

    try {
      const clientId = await getCurrentClientId()

      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, client_id, title, description, due_at, status, priority, category, created_at"
        )
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setTasks((data || []) as TaskRow[])
    } catch (err: any) {
      showToast(err.message || "No se pudieron cargar las tareas.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const grouped = useMemo(() => {
    return {
      pending: tasks.filter((t) => (t.status || "pending") === "pending"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      completed: tasks.filter((t) => t.status === "completed"),
    }
  }, [tasks])

  const resetCreateForm = () => {
    setTitle("")
    setDescription("")
    setDueAt("")
    setPriority("medium")
  }

  const startEditing = (task: TaskRow) => {
    setEditingId(task.id)
    setEditTitle(task.title || "")
    setEditDescription(task.description || "")
    setEditDueAt(task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : "")
    setEditPriority(task.priority || "medium")
    setEditStatus(task.status || "pending")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
    setEditDescription("")
    setEditDueAt("")
    setEditPriority("medium")
    setEditStatus("pending")
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast("Ingresa un título para la tarea.", "error")
      return
    }

    setSaving(true)

    try {
      const clientId = await getCurrentClientId()

      const { error } = await supabase.from("tasks").insert({
        client_id: clientId,
        title: title.trim(),
        description: description.trim() || null,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        status: "pending",
        priority,
        category: "general",
        source: "dashboard",
      })

      if (error) {
        throw error
      }

      resetCreateForm()
      await loadTasks()
      showToast("Tarea creada.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo crear la tarea.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      showToast("El título es obligatorio.", "error")
      return
    }

    try {
      const payload: any = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        due_at: editDueAt ? new Date(editDueAt).toISOString() : null,
        priority: editPriority,
        status: editStatus,
      }

      if (editStatus === "completed") {
        payload.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)

      if (error) {
        throw error
      }

      cancelEditing()
      await loadTasks()
      showToast("Tarea actualizada.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo actualizar la tarea.", "error")
    }
  }

  const moveTask = async (id: string, nextStatus: string) => {
    try {
      const payload: any = {
        status: nextStatus,
      }

      if (nextStatus === "completed") {
        payload.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)

      if (error) {
        throw error
      }

      await loadTasks()
      showToast("Estado actualizado.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo actualizar la tarea.", "error")
    }
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Eliminar esta tarea?")

    if (!ok) {
      return
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      await loadTasks()
      showToast("Tarea eliminada.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo eliminar la tarea.", "error")
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      return
    }

    const taskId = String(active.id)
    const newStatus = String(over.id)

    if (!["pending", "in_progress", "completed"].includes(newStatus)) {
      return
    }

    const currentTask = tasks.find((task) => task.id === taskId)

    if (!currentTask || currentTask.status === newStatus) {
      return
    }

    await moveTask(taskId, newStatus)
  }

  return (
    <>
      <AppToast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={closeToast}
      />

      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1F63]">Tareas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona pendientes en formato tablero.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={loadTasks}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#0F1F63] mb-5">
            Nueva tarea
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />

            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="h-12 rounded-xl"
            />

            <Input
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 rounded-xl"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-12 rounded-xl border border-input bg-background px-3"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <Button
            className="mt-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
            onClick={handleCreate}
            disabled={saving}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Crear tarea"}
          </Button>
        </div>

        {editingId && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-[#0F1F63] mb-5">
              Editar tarea
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-12 rounded-xl"
              />

              <Input
                type="datetime-local"
                value={editDueAt}
                onChange={(e) => setEditDueAt(e.target.value)}
                className="h-12 rounded-xl"
              />

              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="h-12 rounded-xl"
              />

              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="h-12 rounded-xl border border-input bg-background px-3"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>

              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="h-12 rounded-xl border border-input bg-background px-3"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
              </select>
            </div>

            <div className="flex gap-2 mt-5">
              <Button
                className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
                onClick={() => handleSaveEdit(editingId)}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={cancelEditing}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-muted-foreground">Cargando tareas...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid lg:grid-cols-3 gap-5">
              {columns.map((column) => {
                const columnTasks = grouped[column.key as keyof typeof grouped]

                return (
                  <DroppableColumn
                    key={column.key}
                    id={column.key}
                    label={column.label}
                    count={columnTasks.length}
                  >
                    {columnTasks.length > 0 ? (
                      columnTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          onEdit={startEditing}
                          onDelete={handleDelete}
                          onMove={moveTask}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No hay tareas en esta columna.
                      </div>
                    )}
                  </DroppableColumn>
                )
              })}
            </div>
          </DndContext>
        )}
      </div>
    </>
  )
}
