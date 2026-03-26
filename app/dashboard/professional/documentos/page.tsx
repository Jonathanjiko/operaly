"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FileText, Upload, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type DocumentRow = {
  id: string
  client_id: string
  title: string | null
  file_name: string | null
  mime_type: string | null
  file_size_bytes: number | null
  page_count: number | null
  chunk_count: number | null
  status: string | null
  source: string | null
  channel: string | null
  storage_path: string | null
  created_at: string | null
}

export default function ProfessionalDocumentsPage() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const loadDocuments = async () => {
    setLoading(true)

    try {
      const clientId = await getCurrentClientId()

      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, client_id, title, file_name, mime_type, file_size_bytes, page_count, chunk_count, status, source, channel, storage_path, created_at"
        )
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setDocuments((data || []) as DocumentRow[])
    } catch (err: any) {
      alert(err.message || "No se pudieron cargar los documentos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleOpenUpload = () => {
    inputRef.current?.click()
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    setUploading(true)

    try {
      const clientId = await getCurrentClientId()
      const ext = file.name.split(".").pop() || "bin"
      const path = `dashboard/${clientId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

      const { error: uploadError } = await supabase.storage
        .from("client-docs")
        .upload(path, file, {
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const { error: insertError } = await supabase.from("documents").insert({
        client_id: clientId,
        title: file.name,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        file_size_bytes: file.size,
        page_count: null,
        chunk_count: null,
        status: "uploaded",
        source: "dashboard_upload",
        channel: "web",
        storage_path: path,
      })

      if (insertError) {
        throw insertError
      }

      await loadDocuments()
    } catch (err: any) {
      alert(err.message || "No se pudo subir el documento.")
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (row: DocumentRow) => {
    const ok = window.confirm(`¿Eliminar "${row.file_name || row.title}"?`)

    if (!ok) {
      return
    }

    try {
      if (row.storage_path) {
        await supabase.storage.from("client-docs").remove([row.storage_path])
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", row.id)

      if (error) {
        throw error
      }

      await loadDocuments()
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar el documento.")
    }
  }

  const totalSizeMb = useMemo(() => {
    return (
      documents.reduce((acc, item) => acc + (item.file_size_bytes || 0), 0) /
      1024 /
      1024
    ).toFixed(2)
  }, [documents])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Sube, organiza y elimina tus archivos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={loadDocuments}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>

          <Button
            className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
            onClick={handleOpenUpload}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Subiendo..." : "Subir documento"}
          </Button>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Total archivos</p>
          <p className="text-3xl font-bold text-[#0F1F63]">
            {documents.length}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Tamaño total</p>
          <p className="text-3xl font-bold text-[#0F1F63]">
            {totalSizeMb} MB
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Con estado uploaded</p>
          <p className="text-3xl font-bold text-[#0F1F63]">
            {documents.filter((d) => d.status === "uploaded").length}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0F1F63]">
            Archivos del cliente
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-muted-foreground">Cargando documentos...</div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-muted-foreground">
            Todavía no tienes documentos cargados.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#3B82F6]" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-[#0F1F63] truncate">
                      {doc.title || doc.file_name || "Documento"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.file_name || "Sin nombre"} · {doc.mime_type || "archivo"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estado: {doc.status || "—"} · Fuente: {doc.source || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{doc.file_size_bytes ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB` : "—"}</p>
                    <p>{doc.created_at ? new Date(doc.created_at).toLocaleString() : "—"}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
