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
  embedding_status?: string | null
  embedding_provider?: string | null
  embedding_model?: string | null
  indexed_at?: string | null
  vision_status?: string | null
  extraction_source?: string | null
  contact_id?: string | null
  case_id?: string | null
}

type DashboardDocumentsPayload = {
  imported_documents?: Array<Record<string, any>>
  remote_documents?: Array<Record<string, any>>
}

type RemoteDocumentRow = {
  id: string
  title: string | null
  file_name: string | null
  mime_type: string | null
  modified_at: string | null
  availability: string | null
  source: string | null
}

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: { title: "Documentos", subtitle: "Vea sus archivos, traigalos cuando haga falta y trabaje con Operaly sin perder el orden.", sync: "Todo lo importante deberia sentirse aqui y tambien en WhatsApp", reminder: "Un archivo puede quedarse solo visible o entrar de lleno al analisis cuando usted lo pida.", upload: "Subir archivo", uploading: "Subiendo...", search: "Buscar documentos...", drag: "Arrastra archivos o haga clic para seleccionar", dragActive: "Suelte para subir", dragHint: "PDF, Word, Excel, imagenes y comprimidos · max. 50 MB", empty: "Sin documentos", emptyHint: "Suba su primer archivo o envieselo a Operaly por WhatsApp.", processed: "Procesado", processing: "Procesando", error: "Error", close: "Cerrar", delete: "Eliminar", deleteConfirm: "¿Eliminar este documento?", size: "Tamano", type: "Tipo", pages: "Paginas", chunks: "Chunks IA", source: "Fuente", uploaded: "Subido", readyHint: "Operaly ya puede analizar y responder sobre este archivo.", total: "archivos", processedCount: "procesados", mb: "MB" },
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

function isDriveDocument(doc: DocumentRow) {
  const source = String(doc.source || "").toLowerCase()
  return source.includes("drive")
}

function isImportedDocument(doc: DocumentRow) {
  const source = String(doc.source || "").toLowerCase()
  return source.includes("import")
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

function asArray<T = Record<string, any>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
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

function RuntimeTag({
  label,
  value,
  tone = "slate",
}: {
  label: string
  value: string
  tone?: "slate" | "blue" | "emerald" | "amber" | "purple"
}) {
  const tones = {
    slate: "bg-secondary text-muted-foreground border-border",
    blue: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>
      {label}: {value}
    </span>
  )
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              {doc.embedding_status ? (
                <RuntimeTag
                  label="Búsqueda"
                  value={normalizeRuntimeStatus(doc.embedding_status)}
                  tone={doc.embedding_status === "indexed" ? "emerald" : doc.embedding_status === "failed" ? "amber" : "blue"}
                />
              ) : null}
              {doc.vision_status ? (
                <RuntimeTag
                  label="Lectura"
                  value={normalizeRuntimeStatus(doc.vision_status)}
                  tone={doc.vision_status === "ready" || doc.vision_status === "processed" ? "purple" : "amber"}
                />
              ) : null}
            </div>
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
          {(doc.indexed_at || doc.extraction_source || doc.case_id || doc.contact_id) ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Listo para búsqueda</p>
                <p className="text-sm font-semibold text-[#0F1F63] mt-0.5">
                  {doc.indexed_at ? new Date(doc.indexed_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : "Pendiente"}
                </p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cómo se leyó</p>
                <p className="text-sm font-semibold text-[#0F1F63] mt-0.5">{doc.extraction_source || "Lectura base"}</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ligado a caso</p>
                <p className="text-sm font-semibold text-[#0F1F63] mt-0.5">{doc.case_id ? "Sí" : "No"}</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ligado a contacto</p>
                <p className="text-sm font-semibold text-[#0F1F63] mt-0.5">{doc.contact_id ? "Sí" : "No"}</p>
              </div>
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
  const [remoteDocuments, setRemoteDocuments] = useState<RemoteDocumentRow[]>([])
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
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token || ""
      const [{ data: client }, { data, error }] = await Promise.all([
        supabase.from("clients").select("preferred_language,language,timezone,timezone_auto").eq("id", clientId).maybeSingle(),
        supabase.from("documents").select("id,client_id,title,file_name,mime_type,file_size_bytes,page_count,chunk_count,status,source,channel,storage_path,created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
      ])
      if (error) throw error
      const resolvedLanguage = resolveLanguageCode(client?.preferred_language || client?.language || "es")
      setLanguage(resolvedLanguage)
      setLocale(localeFromLanguage(resolvedLanguage))
      setTimezone(client?.timezone_auto || client?.timezone || "America/Lima")
      let usedDashboardDocuments = false

      if (accessToken) {
        try {
          const dashboardDocumentsResponse = await fetch("/api/dashboard/documents", {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          })
          const dashboardDocumentsPayload = (await dashboardDocumentsResponse.json().catch(() => ({}))) as DashboardDocumentsPayload
          if (dashboardDocumentsResponse.ok) {
            const importedDocuments = asArray<Record<string, any>>(dashboardDocumentsPayload?.imported_documents)
            const remoteDocs = asArray<Record<string, any>>(dashboardDocumentsPayload?.remote_documents)

            if (importedDocuments.length > 0) {
              usedDashboardDocuments = true
              setDocuments(
                importedDocuments.map((doc) => ({
                  id: String(doc.id || doc.document_id || Math.random()),
                  client_id: String(doc.client_id || clientId),
                  title: (doc.title as string | null) || null,
                  file_name: (doc.file_name as string | null) || (doc.name as string | null) || null,
                  mime_type: (doc.mime_type as string | null) || null,
                  file_size_bytes: Number(doc.file_size_bytes ?? 0) || null,
                  page_count: Number(doc.page_count ?? 0) || null,
                  chunk_count: Number(doc.chunk_count ?? 0) || null,
                  status: (doc.status as string | null) || (doc.availability as string | null) || null,
                  source: (doc.source as string | null) || (doc.origin as string | null) || null,
                  channel: (doc.channel as string | null) || null,
                  storage_path: (doc.storage_path as string | null) || null,
                  created_at: (doc.created_at as string | null) || (doc.imported_at as string | null) || null,
                  embedding_status: (doc.embedding_status as string | null) || null,
                  vision_status: (doc.vision_status as string | null) || null,
                }))
              )
            } else {
              setDocuments((data || []) as DocumentRow[])
            }

            setRemoteDocuments(
              remoteDocs.map((doc) => ({
                id: String(doc.id || doc.remote_id || doc.file_id || Math.random()),
                title: (doc.title as string | null) || null,
                file_name: (doc.file_name as string | null) || (doc.name as string | null) || null,
                mime_type: (doc.mime_type as string | null) || null,
                modified_at: (doc.modified_at as string | null) || (doc.updated_at as string | null) || null,
                availability: (doc.availability as string | null) || "remote",
                source: (doc.source as string | null) || "google_drive",
              }))
            )
          }
        } catch (dashboardDocumentsError) {
          console.error("No se pudo leer documentos auth-bound:", dashboardDocumentsError)
        }
      }

      if (!usedDashboardDocuments) {
        setDocuments((data || []) as DocumentRow[])
      }
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
  const driveDocuments = remoteDocuments.length || documents.filter((doc) => isDriveDocument(doc)).length
  const importedDocuments = documents.filter((doc) => isImportedDocument(doc)).length
  const indexedDocuments = documents.filter((doc) => String(doc.embedding_status || "").toLowerCase() === "indexed").length
  const visionReady = documents.filter((doc) => {
    const status = String(doc.vision_status || "").toLowerCase()
    return status === "processed" || status === "ready"
  }).length

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
          <h2 className="text-lg font-semibold text-[#0F1F63]">Documentos listos para usar 📂</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Aqui deberia ver tanto lo que ya esta dentro de Operaly como lo que solo esta visible desde integraciones y puede traer cuando lo necesite.
        </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ya dentro de Operaly</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{documents.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Archivos que ya forman parte de su base documental.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Listos para revisar</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{processed}</p>
              <p className="mt-1 text-xs text-muted-foreground">Ya se pueden consultar mejor desde Operaly.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Actividad reciente</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {recentDocumentEvents.length > 0 ? "Con señal" : "Pendiente"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Le muestra si hubo movimiento reciente con archivos.</p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Con analisis listo</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{indexedDocuments}</p>
              <p className="mt-1 text-xs text-muted-foreground">Archivos con lectura mas completa para busqueda y respuestas.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Imagenes entendidas</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{visionReady}</p>
              <p className="mt-1 text-xs text-muted-foreground">Imagenes donde Operaly ya logro sacar contenido util.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F1F63]">Movimientos recientes</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aqui ve si hubo importaciones, analisis o uso reciente de documentos.
          </p>
          <div className="mt-4 space-y-3">
            {recentDocumentEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                Aun no hay movimientos recientes de documentos.
              </div>
            ) : (
              recentDocumentEvents.map((event) => (
                <div key={String(event.id || event.created_at)} className="rounded-2xl border border-border bg-secondary/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Origen</p>
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
            <h2 className="text-lg font-semibold text-[#0F1F63]">Contenido sensible 🔒</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Si un archivo resulta sensible, deberia terminar tambien en el baul privado para que quede mejor separado del resto.
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Uso general</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{documents.length - sensitiveCandidates}</p>
            <p className="mt-1 text-xs text-muted-foreground">Archivos de trabajo que puede revisar sin moverlos al baúl.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sensibles</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{sensitiveCandidates}</p>
            <p className="mt-1 text-xs text-muted-foreground">Archivos que conviene revisar o separar en el baúl privado.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Clasificación</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {recentDocumentEvents.length > 0 ? "Con señal" : "Pendiente"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Aqui deberia verse mejor que se queda en documentos y que se manda al baul.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Solo visibles desde Drive</p>
          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{driveDocuments}</p>
          <p className="mt-1 text-xs text-slate-600">Archivos que ya se alcanzan a ver aqui aunque todavia no se hayan traido completos.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Traidos a Operaly</p>
          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{importedDocuments}</p>
          <p className="mt-1 text-xs text-slate-600">Archivos que ya fueron traidos para lectura, analisis o reutilizacion completa.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Falta traer si hace falta</p>
          <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{Math.max(driveDocuments - importedDocuments, 0)}</p>
          <p className="mt-1 text-xs text-slate-600">Sirve para distinguir lo remoto de lo que ya forma parte de Operaly.</p>
        </div>
      </div>

      {remoteDocuments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0F1F63]">Tambien visible desde Drive ☁️</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Esto ya se alcanza a ver desde su Drive, aunque todavia no se haya traido completo a Operaly.
              </p>
            </div>
            <Link href="/dashboard/professional/integraciones" className="text-sm font-medium text-[#2563EB] hover:underline">
              Revisar conexión
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {remoteDocuments.slice(0, 6).map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${FileBg({ mime: doc.mime_type })}`}>
                    <FileIcon mime={doc.mime_type} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F1F63] line-clamp-2">
                      {doc.title || doc.file_name || "Archivo remoto"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {doc.source || "google_drive"} · {doc.availability || "remote"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {doc.modified_at ? new Date(doc.modified_at).toLocaleDateString(locale) : "Visible para traer cuando haga falta"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      {doc.embedding_status ? (
                        <RuntimeTag
                          label="Búsq."
                          value={normalizeRuntimeStatus(doc.embedding_status)}
                          tone={String(doc.embedding_status).toLowerCase() === "indexed" ? "emerald" : "amber"}
                        />
                      ) : null}
                      {doc.vision_status ? (
                        <RuntimeTag
                          label="Lect."
                          value={normalizeRuntimeStatus(doc.vision_status)}
                          tone={String(doc.vision_status).toLowerCase() === "ready" ? "purple" : "amber"}
                        />
                      ) : null}
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
