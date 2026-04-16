"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, Archive, CheckCircle2, Clock, File, FileImage, FileSpreadsheet, FileText, FolderLock, RefreshCw, Search, ShieldCheck, Trash2, Upload, X } from "lucide-react"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  fetchProfessionalRuntime,
  normalizeRuntimeStatus,
  type ProfessionalRuntimeSnapshot,
} from "@/lib/professional-runtime"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

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

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: { title: "Documentos", subtitle: "Tu base operativa de archivos para consultar, asociar y reutilizar desde WhatsApp.", sync: "Sincronizado con Supabase y WhatsApp", reminder: "Los archivos procesados quedan listos para análisis, continuidad por caso y envíos posteriores.", upload: "Subir archivo", uploading: "Subiendo...", search: "Buscar documentos...", drag: "Arrastra archivos o haz clic para seleccionar", dragActive: "Suelta para subir", dragHint: "PDF, Word, Excel, imágenes y comprimidos · máx. 50 MB", empty: "Sin documentos", emptyHint: "Sube tu primer archivo o envíaselo a Operaly por WhatsApp.", processed: "Procesado", processing: "Procesando", error: "Error", close: "Cerrar", delete: "Eliminar", deleteConfirm: "¿Eliminar este documento?", size: "Tamaño", type: "Tipo", pages: "Páginas", chunks: "Chunks IA", source: "Fuente", uploaded: "Subido", readyHint: "Operaly ya puede analizar y responder sobre este archivo.", total: "archivos", processedCount: "procesados", mb: "MB" },
  en: { title: "Documents", subtitle: "Your operational file base to query, associate, and reuse from WhatsApp.", sync: "Synced with Supabase and WhatsApp", reminder: "Processed files stay ready for analysis, case continuity, and later sending.", upload: "Upload file", uploading: "Uploading...", search: "Search documents...", drag: "Drag files here or click to select", dragActive: "Drop to upload", dragHint: "PDF, Word, Excel, images, archives · max 50 MB", empty: "No documents", emptyHint: "Upload your first file or send it to Operaly through WhatsApp.", processed: "Processed", processing: "Processing", error: "Error", close: "Close", delete: "Delete", deleteConfirm: "Delete this document?", size: "Size", type: "Type", pages: "Pages", chunks: "AI chunks", source: "Source", uploaded: "Uploaded", readyHint: "Operaly can already analyze and answer questions about this file.", total: "files", processedCount: "processed", mb: "MB" },
  pt: { title: "Documentos", subtitle: "Sua base operacional de arquivos para consultar, associar e reutilizar pelo WhatsApp.", sync: "Sincronizado com Supabase e WhatsApp", reminder: "Arquivos processados ficam prontos para análise, continuidade por caso e envios futuros.", upload: "Enviar arquivo", uploading: "Enviando...", search: "Buscar documentos...", drag: "Arraste arquivos ou clique para selecionar", dragActive: "Solte para enviar", dragHint: "PDF, Word, Excel, imagens e compactados · máx. 50 MB", empty: "Sem documentos", emptyHint: "Envie seu primeiro arquivo ou mande para a Operaly pelo WhatsApp.", processed: "Processado", processing: "Processando", error: "Erro", close: "Fechar", delete: "Excluir", deleteConfirm: "Excluir este documento?", size: "Tamanho", type: "Tipo", pages: "Páginas", chunks: "Chunks IA", source: "Origem", uploaded: "Enviado", readyHint: "A Operaly já pode analisar e responder sobre este arquivo.", total: "arquivos", processedCount: "processados", mb: "MB" },
  de: { title: "Dokumente", subtitle: "Deine operative Dateibasis zum Nachschlagen, Verknüpfen und Wiederverwenden über WhatsApp.", sync: "Mit Supabase und WhatsApp synchronisiert", reminder: "Verarbeitete Dateien bleiben bereit für Analyse, Fall-Kontinuität und späteres Senden.", upload: "Datei hochladen", uploading: "Lädt hoch...", search: "Dokumente suchen...", drag: "Dateien hierher ziehen oder klicken", dragActive: "Zum Hochladen loslassen", dragHint: "PDF, Word, Excel, Bilder, Archive · max. 50 MB", empty: "Keine Dokumente", emptyHint: "Lade deine erste Datei hoch oder sende sie an Operaly per WhatsApp.", processed: "Verarbeitet", processing: "In Verarbeitung", error: "Fehler", close: "Schließen", delete: "Löschen", deleteConfirm: "Dieses Dokument löschen?", size: "Größe", type: "Typ", pages: "Seiten", chunks: "KI-Chunks", source: "Quelle", uploaded: "Hochgeladen", readyHint: "Operaly kann diese Datei bereits analysieren und Fragen dazu beantworten.", total: "Dateien", processedCount: "verarbeitet", mb: "MB" },
  fr: { title: "Documents", subtitle: "Ta base opérationnelle de fichiers à consulter, associer et réutiliser depuis WhatsApp.", sync: "Synchronisé avec Supabase et WhatsApp", reminder: "Les fichiers traités restent prêts pour l’analyse, la continuité par cas et les envois ultérieurs.", upload: "Téléverser", uploading: "Téléversement...", search: "Rechercher des documents...", drag: "Glisse des fichiers ou clique pour choisir", dragActive: "Relâche pour téléverser", dragHint: "PDF, Word, Excel, images, archives · max 50 MB", empty: "Aucun document", emptyHint: "Téléverse ton premier fichier ou envoie-le à Operaly via WhatsApp.", processed: "Traité", processing: "Traitement", error: "Erreur", close: "Fermer", delete: "Supprimer", deleteConfirm: "Supprimer ce document ?", size: "Taille", type: "Type", pages: "Pages", chunks: "Chunks IA", source: "Source", uploaded: "Ajouté", readyHint: "Operaly peut déjà analyser ce fichier et répondre à son sujet.", total: "fichiers", processedCount: "traités", mb: "MB" },
  it: { title: "Documenti", subtitle: "La tua base operativa di file da consultare, associare e riutilizzare da WhatsApp.", sync: "Sincronizzato con Supabase e WhatsApp", reminder: "I file processati restano pronti per analisi, continuità per caso e invii successivi.", upload: "Carica file", uploading: "Caricamento...", search: "Cerca documenti...", drag: "Trascina file o fai clic per selezionare", dragActive: "Rilascia per caricare", dragHint: "PDF, Word, Excel, immagini, archivi · max 50 MB", empty: "Nessun documento", emptyHint: "Carica il tuo primo file o invialo a Operaly via WhatsApp.", processed: "Processato", processing: "In elaborazione", error: "Errore", close: "Chiudi", delete: "Elimina", deleteConfirm: "Eliminare questo documento?", size: "Dimensione", type: "Tipo", pages: "Pagine", chunks: "Chunk IA", source: "Origine", uploaded: "Caricato", readyHint: "Operaly può già analizzare questo file e rispondere su di esso.", total: "file", processedCount: "processati", mb: "MB" },
}

function isDocumentEvent(eventType: string | null | undefined) {
  const normalized = String(eventType || "").toLowerCase()
  return normalized.includes("document") || normalized.includes("file")
}

function looksSensitiveDocument(doc: DocumentRow) {
  const haystack = [doc.title, doc.file_name, doc.mime_type, doc.storage_path].join(" ").toLowerCase()
  return (
    haystack.includes("password") ||
    haystack.includes("secret") ||
    haystack.includes("credential") ||
    haystack.includes("credencial") ||
    haystack.includes("privado") ||
    haystack.includes("private")
  )
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

function FileIcon({ mime }: { mime: string | null }) {
  const normalized = (mime || "").toLowerCase()
  if (normalized.includes("pdf")) return <FileText className="w-6 h-6 text-[#EF4444]" />
  if (normalized.includes("image")) return <FileImage className="w-6 h-6 text-[#8B5CF6]" />
  if (normalized.includes("sheet") || normalized.includes("excel") || normalized.includes("csv")) return <FileSpreadsheet className="w-6 h-6 text-[#10B981]" />
  if (normalized.includes("zip") || normalized.includes("rar")) return <Archive className="w-6 h-6 text-[#F59E0B]" />
  if (normalized.includes("word") || normalized.includes("document")) return <FileText className="w-6 h-6 text-[#3B82F6]" />
  return <File className="w-6 h-6 text-muted-foreground" />
}

function FileBg({ mime }: { mime: string | null }) {
  const normalized = (mime || "").toLowerCase()
  if (normalized.includes("pdf")) return "bg-[#EF4444]/10"
  if (normalized.includes("image")) return "bg-[#8B5CF6]/10"
  if (normalized.includes("sheet") || normalized.includes("excel") || normalized.includes("csv")) return "bg-[#10B981]/10"
  if (normalized.includes("zip")) return "bg-[#F59E0B]/10"
  if (normalized.includes("word")) return "bg-[#3B82F6]/10"
  return "bg-secondary"
}

function StatusBadge({ status, copy }: { status: string | null; copy: Record<string, string> }) {
  const normalized = (status || "").toLowerCase()
  if (normalized === "processed" || normalized === "ready") {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700"><CheckCircle2 className="w-3 h-3" />{copy.processed}</span>
  }
  if (normalized === "processing" || normalized === "pending") {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700"><Clock className="w-3 h-3" />{copy.processing}</span>
  }
  if (normalized === "error" || normalized === "failed") {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700"><AlertCircle className="w-3 h-3" />{copy.error}</span>
  }
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">{status || "—"}</span>
}

function DetailModal({ doc, locale, copy, onClose, onDelete }: { doc: DocumentRow; locale: string; copy: Record<string, string>; onClose: () => void; onDelete: () => void }) {
  const name = doc.title || doc.file_name || "Documento"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-border flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${FileBg({ mime: doc.mime_type })}`}><FileIcon mime={doc.mime_type} /></div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[#0F1F63] leading-snug break-words">{name}</h2>
            <StatusBadge status={doc.status} copy={copy} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              [copy.size, formatSize(doc.file_size_bytes)],
              [copy.type, (doc.mime_type || "—").split("/").pop()?.toUpperCase() || "—"],
              [copy.pages, doc.page_count ? `${doc.page_count}` : "—"],
              [copy.chunks, doc.chunk_count ? `${doc.chunk_count}` : "—"],
              [copy.source, doc.source || doc.channel || "—"],
              [copy.uploaded, doc.created_at ? new Date(doc.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-[#0F1F63] mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
          {doc.status === "processed" || doc.status === "ready" ? (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3">
              <p className="text-xs font-semibold text-[#1D4ED8]">{copy.processed}</p>
              <p className="text-xs text-[#3B82F6] mt-0.5">{copy.readyHint}</p>
            </div>
          ) : null}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary">{copy.close}</button>
          <button onClick={() => { onDelete(); onClose() }} className="h-10 px-4 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white text-sm font-semibold flex items-center gap-2"><Trash2 className="w-4 h-4" />{copy.delete}</button>
        </div>
      </div>
    </div>
  )
}

export default function DocumentosPage() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [search, setSearch] = useState("")
  const [detail, setDetail] = useState<DocumentRow | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [locale, setLocale] = useState("es-PE")
  const [timezone, setTimezone] = useState("America/Lima")
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<ProfessionalRuntimeSnapshot | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const copy = COPY[language]

  async function load() {
    setLoading(true)
    try {
      const clientId = await getCurrentClientId()
      const [{ data: client }, { data, error }] = await Promise.all([
        supabase.from("clients").select("preferred_language,language,timezone,timezone_auto").eq("id", clientId).maybeSingle(),
        supabase.from("documents").select("id,client_id,title,file_name,mime_type,file_size_bytes,page_count,chunk_count,status,source,channel,storage_path,created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
      ])
      if (error) throw error
      const resolvedLanguage = resolveLanguageCode(client?.preferred_language || client?.language || "es")
      setLanguage(resolvedLanguage)
      setLocale(localeFromLanguage(resolvedLanguage))
      setTimezone(client?.timezone_auto || client?.timezone || "America/Lima")
      setDocuments((data || []) as DocumentRow[])
      try {
        setRuntimeSnapshot(await fetchProfessionalRuntime())
      } catch (runtimeError) {
        console.error("No se pudo cargar runtime documental:", runtimeError)
      }
    } catch (error: any) {
      alert(error.message || "Error al cargar.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return documents.filter((doc) => !query || (doc.title || doc.file_name || "").toLowerCase().includes(query))
  }, [documents, search])

  const recentDocumentEvents = useMemo(() => {
    return (runtimeSnapshot?.recentEvents || []).filter((event) => isDocumentEvent(event?.event_type)).slice(0, 4)
  }, [runtimeSnapshot])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const clientId = await getCurrentClientId()
      for (const file of Array.from(files)) {
        const path = `${clientId}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from("operaly-documents").upload(path, file)
        if (uploadError) throw uploadError
        const { error: insertError } = await supabase.from("documents").insert({
          client_id: clientId,
          title: file.name,
          file_name: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          status: "pending",
          source: "dashboard",
          channel: "dashboard",
          storage_path: path,
          created_at: new Date().toISOString(),
        })
        if (insertError) throw insertError
      }
      await load()
    } catch (error: any) {
      alert(error.message || "Error al subir.")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(copy.deleteConfirm)) return
    const { error } = await supabase.from("documents").delete().eq("id", id)
    if (error) {
      alert(error.message)
      return
    }
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const totalMb = documents.reduce((sum, doc) => sum + (doc.file_size_bytes || 0), 0) / 1048576
  const processed = documents.filter((doc) => doc.status === "processed" || doc.status === "ready").length
  const sensitiveCandidates = documents.filter((doc) => looksSensitiveDocument(doc)).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">{copy.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{documents.length} {copy.total} · {totalMb.toFixed(2)} {copy.mb} · {processed} {copy.processedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{copy.sync} · {labelForLanguage(language)} · {locale} · {timezone}</p>
          <p className="text-xs text-[#5F6B7A] mt-1">{copy.reminder}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5">
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? copy.uploading : copy.upload}
          </button>
          <input ref={inputRef} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.zip" onChange={(event) => handleUpload(event.target.files)} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0F1F63]" />
            <h2 className="text-lg font-semibold text-[#0F1F63]">Continuidad documental</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Este módulo ya separa lo que está visible en tu base documental de lo que el backend todavía debe cerrar para asociación automática con casos, contactos y memoria larga.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Base visible</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{documents.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Archivos ya ligados a tu `client_id`.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Listos para análisis</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{processed}</p>
              <p className="mt-1 text-xs text-muted-foreground">Documentos que ya muestran estado procesado o listo.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Backend documental</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {recentDocumentEvents.length > 0 ? "Con señal" : "Pendiente"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Asociación profunda con casos y envío todavía depende del backend.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F1F63]">Señales recientes</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aquí se reflejan eventos recientes ligados a documentos y uso desde WhatsApp cuando el backend los registra.
          </p>
          <div className="mt-4 space-y-3">
            {recentDocumentEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                Aún no hay eventos documentales recientes en runtime.
              </div>
            ) : (
              recentDocumentEvents.map((event) => (
                <div key={String(event.id || event.created_at)} className="rounded-2xl border border-border bg-secondary/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Runtime</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
                    {normalizeRuntimeStatus(String(event.event_type || "document_event"))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.created_at ? new Date(event.created_at).toLocaleString(locale) : "—"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#0F1F63]/10 bg-gradient-to-r from-[#0F1F63]/5 via-white to-[#0EA5E9]/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F1F63]">Puente con baúl privado</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              La base documental guarda tus archivos operativos generales. Cuando un archivo sea sensible o el backend lo clasifique como privado, debe terminar en el baúl privado con una trazabilidad separada.
            </p>
          </div>
          <Link
            href="/dashboard/professional/baul-privado"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0F1F63]/15 bg-white px-4 text-sm font-medium text-[#0F1F63] hover:bg-secondary"
          >
            <FolderLock className="h-4 w-4" />
            Ver baúl privado
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Documentos generales</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{documents.length - sensitiveCandidates}</p>
            <p className="mt-1 text-xs text-muted-foreground">Archivos operativos normales en tu base documental.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sensibles detectados</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{sensitiveCandidates}</p>
            <p className="mt-1 text-xs text-muted-foreground">Señales documentales que ya conviene separar del flujo general.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Clasificación runtime</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {recentDocumentEvents.length > 0 ? "Con señal" : "Pendiente"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">El backend nuevo debe decidir mejor qué queda en documentos y qué debe caer al vault.</p>
          </div>
        </div>
      </div>

      <div onDragOver={(event) => { event.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); handleUpload(event.dataTransfer.files) }} className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${dragOver ? "border-[#3B82F6] bg-[#EFF6FF]" : "border-border hover:border-[#3B82F6]/40 hover:bg-secondary/30"}`} onClick={() => inputRef.current?.click()}>
        <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? "text-[#3B82F6]" : "text-muted-foreground/40"}`} />
        <p className={`text-sm font-semibold ${dragOver ? "text-[#3B82F6]" : "text-muted-foreground"}`}>{dragOver ? copy.dragActive : copy.drag}</p>
        <p className="text-xs text-muted-foreground mt-1">{copy.dragHint}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2"><RefreshCw className="w-5 h-5 animate-spin" />{copy.processing}...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="font-semibold text-[#0F1F63]">{copy.empty}</p>
          <p className="text-sm text-muted-foreground mt-1">{copy.emptyHint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
          {filtered.map((doc) => {
            const name = doc.title || doc.file_name || "Documento"
            return (
              <div key={doc.id} onClick={() => setDetail(doc)} className="group bg-card rounded-2xl border border-border p-4 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${FileBg({ mime: doc.mime_type })}`}><FileIcon mime={doc.mime_type} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0F1F63] line-clamp-2 leading-snug">{name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={doc.status} copy={copy} />
                      <span className="text-[10px] text-muted-foreground">{formatSize(doc.file_size_bytes)}</span>
                    </div>
                  </div>
                  <button onClick={(event) => { event.stopPropagation(); handleDelete(doc.id) }} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  {doc.page_count ? <span>{doc.page_count} p.</span> : null}
                  {doc.source ? <span className="capitalize">{doc.source}</span> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail && <DetailModal doc={detail} locale={locale} copy={copy} onClose={() => setDetail(null)} onDelete={() => handleDelete(detail.id)} />}
    </div>
  )
}
