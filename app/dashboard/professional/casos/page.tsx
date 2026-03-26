"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, RefreshCw, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type CaseRow = {
  id: string
  client_id: string
  title: string | null
  person_key: string | null
  status: string | null
  person_name: string | null
  person_type: string | null
  case_title: string | null
  summary: string | null
  created_at: string | null
}

export default function ProfessionalCasesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cases, setCases] = useState<CaseRow[]>([])

  const [title, setTitle] = useState("")
  const [personName, setPersonName] = useState("")
  const [summary, setSummary] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPersonName, setEditPersonName] = useState("")
  const [editSummary, setEditSummary] = useState("")
  const [editStatus, setEditStatus] = useState("open")

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")
  const [toastMessage, setToastMessage] = useState("")

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message)
    setToastType(type)
    setToastOpen(true)
  }

  const closeToast = () => {
    setToastOpen(false)
    setToastMessage("")
  }

  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
      return bDate - aDate
    })
  }, [cases])

  const loadCases = async () => {
    setLoading(true)

    try {
      const clientId = await getCurrentClientId()

      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setCases((data || []) as CaseRow[])
    } catch (err: any) {
      showToast(err.message || "No se pudieron cargar los casos.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  const resetCreateForm = () => {
    setTitle("")
    setPersonName("")
    setSummary("")
  }

  const startEditing = (row: CaseRow) => {
    setEditingId(row.id)
    setEditTitle(row.title || row.case_title || "")
    setEditPersonName(row.person_name || "")
    setEditSummary(row.summary || "")
    setEditStatus(row.status || "open")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
    setEditPersonName("")
    setEditSummary("")
    setEditStatus("open")
  }

  const handleCreate = async () => {
    if (!title.trim() || !personName.trim()) {
      showToast("Ingresa el título y la persona del caso.", "error")
      return
    }

    setSaving(true)

    try {
      const clientId = await getCurrentClientId()
      const personKey = personName
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      const { error } = await supabase.from("cases").insert({
        client_id: clientId,
        title: title.trim(),
        case_title: title.trim(),
        person_name: personName.trim(),
        person_key: personKey,
        person_type: "person",
        status: "open",
        summary: summary.trim() || null,
        tags: [],
      })

      if (error) {
        throw error
      }

      resetCreateForm()
      await loadCases()
      showToast("Caso creado correctamente.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo crear el caso.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editPersonName.trim()) {
      showToast("Título y persona son obligatorios.", "error")
      return
    }

    const personKey = editPersonName
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    try {
      const { error } = await supabase
        .from("cases")
        .update({
          title: editTitle.trim(),
          case_title: editTitle.trim(),
          person_name: editPersonName.trim(),
          person_key: personKey,
          status: editStatus,
          summary: editSummary.trim() || null,
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      cancelEditing()
      await loadCases()
      showToast("Caso actualizado.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo actualizar el caso.", "error")
    }
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Eliminar este caso?")

    if (!ok) {
      return
    }

    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      await loadCases()
      showToast("Caso eliminado.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo eliminar el caso.", "error")
    }
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
            <h1 className="text-3xl font-bold text-[#0F1F63]">Casos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona casos y expedientes del cliente.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={loadCases}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#0F1F63] mb-5">
            Nuevo caso
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Título del caso"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />

            <Input
              placeholder="Persona"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="h-12 rounded-xl"
            />

            <div className="md:col-span-2">
              <Input
                placeholder="Resumen"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <Button
            className="mt-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
            onClick={handleCreate}
            disabled={saving}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Crear caso"}
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg font-semibold text-[#0F1F63]">
              Casos creados
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-muted-foreground">Cargando casos...</div>
          ) : sortedCases.length === 0 ? (
            <div className="p-8 text-muted-foreground">
              Todavía no tienes casos.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedCases.map((row) => (
                <div
                  key={row.id}
                  className="px-6 py-5 hover:bg-secondary/20 transition-colors"
                >
                  {editingId === row.id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-12 rounded-xl"
                        />

                        <Input
                          value={editPersonName}
                          onChange={(e) => setEditPersonName(e.target.value)}
                          className="h-12 rounded-xl"
                        />

                        <div className="md:col-span-2">
                          <Input
                            value={editSummary}
                            onChange={(e) => setEditSummary(e.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </div>

                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="h-12 rounded-xl border border-input bg-background px-3"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In progress</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
                          onClick={() => handleSaveEdit(row.id)}
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
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {row.title || row.case_title || "Caso"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {row.person_name || "Sin persona"} · {row.status || "open"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {row.summary || "Sin resumen"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => startEditing(row)}
                        >
                          <Pencil className="w-4 h-4" />
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
