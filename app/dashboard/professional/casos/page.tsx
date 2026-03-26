"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

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
      alert(err.message || "No se pudieron cargar los casos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || !personName.trim()) {
      alert("Ingresa el título y la persona del caso.")
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

      setTitle("")
      setPersonName("")
      setSummary("")
      await loadCases()
    } catch (err: any) {
      alert(err.message || "No se pudo crear el caso.")
    } finally {
      setSaving(false)
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
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar el caso.")
    }
  }

  return (
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
        ) : cases.length === 0 ? (
          <div className="p-8 text-muted-foreground">
            Todavía no tienes casos.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {cases.map((row) => (
              <div
                key={row.id}
                className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
              >
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

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
