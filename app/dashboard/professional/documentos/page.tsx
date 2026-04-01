"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  FileText, Upload, Trash2, RefreshCw, X, Search,
  File, FileImage, FileSpreadsheet, Archive, Eye,
  HardDrive, Clock, CheckCircle2, AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type DocumentRow = {
  id: string; client_id: string; title: string | null; file_name: string | null
  mime_type: string | null; file_size_bytes: number | null; page_count: number | null
  chunk_count: number | null; status: string | null; source: string | null
  channel: string | null; storage_path: string | null; created_at: string | null
}

function fmtSize(bytes: number | null) {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(2)} MB`
}

function fmtDate(v: string | null) {
  if (!v) return "—"
  const d = new Date(v)
  if (isNaN(d.getTime())) return "—"
  const now = Date.now(), diff = now - d.getTime()
  if (diff < 86400000) return "Hoy"
  if (diff < 172800000) return "Ayer"
  return d.toLocaleDateString("es-PE", { day:"numeric", month:"short", year:"numeric" })
}

function FileIcon({ mime }: { mime: string | null }) {
  const m = (mime || "").toLowerCase()
  if (m.includes("pdf"))   return <FileText className="w-6 h-6 text-[#EF4444]" />
  if (m.includes("image")) return <FileImage className="w-6 h-6 text-[#8B5CF6]" />
  if (m.includes("sheet") || m.includes("excel") || m.includes("csv")) return <FileSpreadsheet className="w-6 h-6 text-[#10B981]" />
  if (m.includes("zip") || m.includes("rar"))  return <Archive className="w-6 h-6 text-[#F59E0B]" />
  if (m.includes("word") || m.includes("document")) return <FileText className="w-6 h-6 text-[#3B82F6]" />
  return <File className="w-6 h-6 text-muted-foreground" />
}

function FileTypeBg({ mime }: { mime: string | null }) {
  const m = (mime || "").toLowerCase()
  if (m.includes("pdf"))   return "bg-[#EF4444]/10"
  if (m.includes("image")) return "bg-[#8B5CF6]/10"
  if (m.includes("sheet") || m.includes("excel") || m.includes("csv")) return "bg-[#10B981]/10"
  if (m.includes("zip"))   return "bg-[#F59E0B]/10"
  if (m.includes("word"))  return "bg-[#3B82F6]/10"
  return "bg-secondary"
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase()
  if (s === "processed" || s === "ready") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
      <CheckCircle2 className="w-3 h-3" /> Procesado
    </span>
  )
  if (s === "processing" || s === "pending") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
      <Clock className="w-3 h-3" /> Procesando
    </span>
  )
  if (s === "error" || s === "failed") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700">
      <AlertCircle className="w-3 h-3" /> Error
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
      {status || "—"}
    </span>
  )
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ doc, onClose, onDelete }: {
  doc: DocumentRow; onClose: () => void; onDelete: () => void
}) {
  const name = doc.title || doc.file_name || "Documento"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-border flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${FileTypeBg({ mime: doc.mime_type })}`}>
            <FileIcon mime={doc.mime_type} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[#0F1F63] leading-snug break-words">{name}</h2>
            <StatusBadge status={doc.status} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Tamaño", fmtSize(doc.file_size_bytes)],
              ["Tipo", (doc.mime_type || "—").split("/").pop()?.toUpperCase()],
              ["Páginas", doc.page_count ? `${doc.page_count} pág.` : "—"],
              ["Chunks IA", doc.chunk_count ? `${doc.chunk_count}` : "—"],
              ["Fuente", doc.source || doc.channel || "—"],
              ["Subido", fmtDate(doc.created_at)],
            ].map(([l, v]) => (
              <div key={l} className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{l}</p>
                <p className="text-sm font-semibold text-[#0F1F63] mt-0.5 truncate">{v}</p>
              </div>
            ))}
          </div>
          {doc.status === "processed" || doc.status === "ready" ? (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3">
              <p className="text-xs font-semibold text-[#1D4ED8]">✅ Documento procesado</p>
              <p className="text-xs text-[#3B82F6] mt-0.5">Operaly ya puede analizar y responder preguntas sobre este archivo.</p>
            </div>
          ) : null}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">Cerrar</button>
          <button onClick={() => { onDelete(); onClose() }}
            className="h-10 px-4 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors text-sm font-semibold flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DocumentosPage() {
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocs]      = useState<DocumentRow[]>([])
  const [search, setSearch]       = useState("")
  const [detail, setDetail]       = useState<DocumentRow | null>(null)
  const [dragOver, setDragOver]   = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const clientId = await getCurrentClientId()
      const { data, error } = await supabase.from("documents")
        .select("id,client_id,title,file_name,mime_type,file_size_bytes,page_count,chunk_count,status,source,channel,storage_path,created_at")
        .eq("client_id", clientId).order("created_at", { ascending: false })
      if (error) throw error
      setDocs((data || []) as DocumentRow[])
    } catch (err: any) { alert(err.message || "Error al cargar.") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => documents.filter(d => {
    const q = search.toLowerCase()
    return !q || (d.title || d.file_name || "").toLowerCase().includes(q)
  }), [documents, search])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const clientId = await getCurrentClientId()
      for (const file of Array.from(files)) {
        const path = `${clientId}/${Date.now()}_${file.name}`
        const { error: uploadErr } = await supabase.storage.from("operaly-documents").upload(path, file)
        if (uploadErr) throw uploadErr
        const { error: insertErr } = await supabase.from("documents").insert({
          client_id: clientId, title: file.name, file_name: file.name,
          mime_type: file.type, file_size_bytes: file.size,
          status: "pending", source: "dashboard", channel: "dashboard",
          storage_path: path, created_at: new Date().toISOString(),
        })
        if (insertErr) throw insertErr
      }
      await load()
    } catch (err: any) { alert(err.message || "Error al subir.") }
    finally { setUploading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este documento?")) return
    const { error } = await supabase.from("documents").delete().eq("id", id)
    if (error) { alert(error.message); return }
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const totalMB = documents.reduce((a, d) => a + (d.file_size_bytes || 0), 0) / 1048576
  const processed = documents.filter(d => d.status === "processed" || d.status === "ready").length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {documents.length} archivos · {totalMB.toFixed(2)} MB · {processed} procesados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-1.5">
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Subiendo..." : "Subir archivo"}
          </button>
          <input ref={inputRef} type="file" multiple className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.zip"
            onChange={e => handleUpload(e.target.files)} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documentos..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${dragOver ? "border-[#3B82F6] bg-[#EFF6FF]" : "border-border hover:border-[#3B82F6]/40 hover:bg-secondary/30"}`}
        onClick={() => inputRef.current?.click()}>
        <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragOver ? "text-[#3B82F6]" : "text-muted-foreground/40"}`} />
        <p className={`text-sm font-semibold transition-colors ${dragOver ? "text-[#3B82F6]" : "text-muted-foreground"}`}>
          {dragOver ? "Suelta para subir" : "Arrastra archivos o haz clic para seleccionar"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, imágenes — máx. 50MB por archivo</p>
      </div>

      {/* Documents grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Cargando documentos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="font-semibold text-[#0F1F63]">{search ? "Sin resultados" : "Sin documentos"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {!search ? "Sube tu primer archivo o envíaselo a Operaly por WhatsApp" : "Prueba con otro nombre"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
          {filtered.map(doc => {
            const name = doc.title || doc.file_name || "Documento"
            return (
              <div key={doc.id} onClick={() => setDetail(doc)}
                className="group bg-card rounded-2xl border border-border p-4 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${FileTypeBg({ mime: doc.mime_type })}`}>
                    <FileIcon mime={doc.mime_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0F1F63] line-clamp-2 leading-snug">{name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={doc.status} />
                      <span className="text-[10px] text-muted-foreground">{fmtSize(doc.file_size_bytes)}</span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(doc.id) }}
                    className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444] flex-shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {fmtDate(doc.created_at)}
                  </span>
                  {doc.page_count && <span>{doc.page_count} pág.</span>}
                  {doc.source && <span className="capitalize">{doc.source}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail && (
        <DetailModal doc={detail} onClose={() => setDetail(null)} onDelete={() => handleDelete(detail.id)} />
      )}
    </div>
  )
}
