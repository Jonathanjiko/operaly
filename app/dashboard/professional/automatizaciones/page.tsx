"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, RefreshCw, Trash2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type RecurringTaskRow = {
  id: string
  client_id: string
  title: string | null
  category: string | null
  repeat_type: string | null
  repeat_interval: number | null
  start_at: string | null
  next_run: string | null
  status: string | null
  notes: string | null
  created_at: string | null
}

type TaskReminderRow = {
  id: string
  client_id: string
  task_id: string | null
  remind_at: string | null
  sent: boolean | null
  channel: string | null
  sent_at: string | null
  created_at: string | null
}

export default function ProfessionalAutomationsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientId, setClientId] = useState("")

  const [recurringTasks, setRecurringTasks] = useState<RecurringTaskRow[]>([])
  const [reminders, setReminders] = useState<TaskReminderRow[]>([])

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("general")
  const [repeatType, setRepeatType] = useState("daily")
  const [repeatInterval, setRepeatInterval] = useState("1")
  const [startAt, setStartAt] = useState("")
  const [notes, setNotes] = useState("")

  const loadData = async () => {
    setLoading(true)

    try {
      const currentClientId = await getCurrentClientId()
      setClientId(currentClientId)

      const { data: recurringData, error: recurringError } = await supabase
        .from("recurring_tasks")
        .select("*")
        .eq("client_id", currentClientId)
        .order("created_at", { ascending: false })

      if (recurringError) {
        throw recurringError
      }

      const { data: remindersData, error: remindersError } = await supabase
        .from("task_reminders")
        .select("*")
        .eq("client_id", currentClientId)
        .order("created_at", { ascending: false })

      if (remindersError) {
        throw remindersError
      }

      setRecurringTasks((recurringData || []) as RecurringTaskRow[])
      setReminders((remindersData || []) as TaskReminderRow[])
    } catch (err: any) {
      alert(err.message || "No se pudieron cargar las automatizaciones.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const activeCount = useMemo(() => {
    return recurringTasks.filter((item) => item.status === "active").length
  }, [recurringTasks])

  const pendingReminders = useMemo(() => {
    return reminders.filter((item) => !item.sent).length
  }, [reminders])

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Ingresa un título para la automatización.")
      return
    }

    if (!startAt) {
      alert("Selecciona una fecha inicial.")
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase.from("recurring_tasks").insert({
        client_id: clientId,
        title: title.trim(),
        category: category.trim() || "general",
        repeat_type: repeatType,
        repeat_interval: Number(repeatInterval) || 1,
        start_at: new Date(startAt).toISOString(),
        next_run: new Date(startAt).toISOString(),
        status: "active",
        notes: notes.trim() || null,
      })

      if (error) {
        throw error
      }

      setTitle("")
      setCategory("general")
      setRepeatType("daily")
      setRepeatInterval("1")
      setStartAt("")
      setNotes("")

      await loadData()
    } catch (err: any) {
      alert(err.message || "No se pudo crear la automatización.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (row: RecurringTaskRow) => {
    try {
      const nextStatus = row.status === "active" ? "paused" : "active"

      const { error } = await supabase
        .from("recurring_tasks")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)

      if (error) {
        throw error
      }

      await loadData()
    } catch (err: any) {
      alert(err.message || "No se pudo actualizar el estado.")
    }
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Eliminar esta automatización?")

    if (!ok) {
      return
    }

    try {
      const { error } = await supabase
        .from("recurring_tasks")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      await loadData()
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar la automatización.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando automatizaciones...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">
            Automatizaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus procesos recurrentes y recordatorios reales
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-xl"
          onClick={loadData}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Automatizaciones activas</p>
          <p className="text-3xl font-bold text-[#0F1F63]">{activeCount}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Recordatorios pendientes</p>
          <p className="text-3xl font-bold text-[#0F1F63]">{pendingReminders}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Total automatizaciones</p>
          <p className="text-3xl font-bold text-[#0F1F63]">{recurringTasks.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">
            Nueva automatización
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 rounded-xl"
          />

          <Input
            placeholder="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 rounded-xl"
          />

          <select
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value)}
            className="h-12 rounded-xl border border-input bg-background px-3"
          >
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>

          <Input
            type="number"
            min="1"
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(e.target.value)}
            className="h-12 rounded-xl"
            placeholder="Intervalo"
          />

          <Input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="h-12 rounded-xl"
          />

          <Input
            placeholder="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        <Button
          className="mt-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
          onClick={handleCreate}
          disabled={saving}
        >
          <Plus className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Crear automatización"}
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0F1F63]">
            Automatizaciones recurrentes
          </h2>
        </div>

        {recurringTasks.length === 0 ? (
          <div className="p-8 text-muted-foreground">
            Todavía no tienes automatizaciones recurrentes.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recurringTasks.map((row) => (
              <div
                key={row.id}
                className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <p className="font-medium text-[#0F1F63]">
                    {row.title || "Automatización"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.repeat_type || "—"} cada {row.repeat_interval || 1}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Próxima ejecución:{" "}
                    {row.next_run ? new Date(row.next_run).toLocaleString() : "—"} · Estado:{" "}
                    {row.status || "—"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleToggleStatus(row)}
                  >
                    {row.status === "active" ? "Pausar" : "Activar"}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0F1F63]">
            Recordatorios
          </h2>
        </div>

        {reminders.length === 0 ? (
          <div className="p-8 text-muted-foreground">
            No hay recordatorios registrados.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reminders.map((row) => (
              <div
                key={row.id}
                className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <p className="font-medium text-[#0F1F63]">
                    Recordatorio {row.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Canal: {row.channel || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fecha: {row.remind_at ? new Date(row.remind_at).toLocaleString() : "—"} ·{" "}
                    {row.sent ? "Enviado" : "Pendiente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
