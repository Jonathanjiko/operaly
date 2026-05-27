"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Clock, FolderOpen, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, User, X } from "lucide-react"
import { AppToast } from "@/components/ui/app-toast"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  fetchProfessionalRuntime,
  normalizeRuntimeStatus,
  type ProfessionalRuntimeSnapshot,
} from "@/lib/professional-runtime"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

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
  continuity_summary?: string | null
  last_activity_at?: string | null
  created_at: string | null
  updated_at?: string | null
  event_count?: number | null
  document_count?: number | null
  contact_count?: number | null
  last_event_type?: string | null
}

type ContactOption = {
  id: string
  label: string
  email: string | null
  source: string | null
}

type Toast = { open: boolean; msg: string; type: "success" | "error" | "info" }
type GoogleProduct = "calendar" | "drive" | "gmail" | "contacts"
type GoogleProductState = {
  enabled?: boolean | null
  sync_status?: string | null
}
type GoogleStatusPayload = {
  products?: Partial<Record<GoogleProduct, GoogleProductState>>
  drive?: GoogleProductState
  gmail?: GoogleProductState
  contacts?: GoogleProductState
  connection?: {
    authorized_products?: string[] | null
  } | null
}

const CASES_PAGE_SIZE = 30
const CASE_CONTACTS_PAGE_SIZE = 50

const STATUS = [
  { value: "open", label: "Abierto", color: "#3B82F6", bg: "bg-blue-50", border: "border-blue-200", icon: FolderOpen },
  { value: "pending", label: "Pendiente", color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  { value: "resolved", label: "Resuelto", color: "#10B981", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  { value: "closed", label: "Cerrado", color: "#6B7280", bg: "bg-gray-50", border: "border-gray-200", icon: AlertCircle },
]

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: { title: "Casos", subtitle: "Siga cada tema importante sin perder el hilo.", sync: "Se actualiza con sus cambios", reminder: "Cada caso debe ayudarle a retomar personas, archivos y pendientes con facilidad.", total: "casos", open: "abiertos", search: "Buscar casos...", all: "Todos", noCases: "Sin casos", noCasesHint: "Cree el primero aquí o pídaselo a Operaly por WhatsApp.", newCase: "Nuevo caso", editCase: "Editar caso", createCase: "Crear caso", save: "Guardar", cancel: "Cancelar", titleLabel: "Título del caso *", titlePlaceholder: "Ej: Contrato de arrendamiento — García", personLabel: "Persona involucrada", personPlaceholder: "Nombre del cliente, contraparte o contacto", summaryLabel: "Resumen", summaryPlaceholder: "Contexto, siguiente paso o información relevante...", continuity: "Continuidad", opened: "Abierto el", deleteConfirm: "¿Eliminar este caso?", createdOk: "Caso creado.", updatedOk: "Caso actualizado.", deletedOk: "Caso eliminado.", deletedError: "Error al eliminar.", loadError: "Error al cargar." },
  en: { title: "Cases", subtitle: "Workline for continuity, context, and historical follow-up.", sync: "Synced with Supabase and WhatsApp", reminder: "Each case should preserve useful memory across contacts, files, and future conversations.", total: "cases total", open: "open", search: "Search cases...", all: "All", noCases: "No cases", noCasesHint: "Create the first one here or ask Operaly on WhatsApp to open it.", newCase: "New case", editCase: "Edit case", createCase: "Create case", save: "Save", cancel: "Cancel", titleLabel: "Case title *", titlePlaceholder: "Example: Lease contract — García", personLabel: "Person involved", personPlaceholder: "Client, counterparty, or contact name", summaryLabel: "Summary", summaryPlaceholder: "Context, next step, or relevant information...", continuity: "Continuity", opened: "Opened on", deleteConfirm: "Delete this case?", createdOk: "Case created.", updatedOk: "Case updated.", deletedOk: "Case deleted.", deletedError: "Error deleting case.", loadError: "Error loading cases." },
  pt: { title: "Casos", subtitle: "Linha de trabalho para continuidade, contexto e acompanhamento histórico.", sync: "Sincronizado com Supabase e WhatsApp", reminder: "Cada caso deve preservar memória útil por contato, arquivo e conversas futuras.", total: "casos no total", open: "abertos", search: "Buscar casos...", all: "Todos", noCases: "Sem casos", noCasesHint: "Crie o primeiro aqui ou peça para a Operaly abrir um pelo WhatsApp.", newCase: "Novo caso", editCase: "Editar caso", createCase: "Criar caso", save: "Salvar", cancel: "Cancelar", titleLabel: "Título do caso *", titlePlaceholder: "Ex.: Contrato de aluguel — García", personLabel: "Pessoa envolvida", personPlaceholder: "Cliente, contraparte ou contato", summaryLabel: "Resumo", summaryPlaceholder: "Contexto, próximo passo ou informação relevante...", continuity: "Continuidade", opened: "Aberto em", deleteConfirm: "Excluir este caso?", createdOk: "Caso criado.", updatedOk: "Caso atualizado.", deletedOk: "Caso excluído.", deletedError: "Erro ao excluir.", loadError: "Erro ao carregar." },
  de: { title: "Fälle", subtitle: "Arbeitslinie für Kontinuität, Kontext und historischen Verlauf.", sync: "Mit Supabase und WhatsApp synchronisiert", reminder: "Jeder Fall sollte nützliche Erinnerung über Kontakt, Datei und spätere Gespräche tragen.", total: "Fälle gesamt", open: "offen", search: "Fälle suchen...", all: "Alle", noCases: "Keine Fälle", noCasesHint: "Erstelle hier den ersten oder bitte Operaly per WhatsApp darum.", newCase: "Neuer Fall", editCase: "Fall bearbeiten", createCase: "Fall erstellen", save: "Speichern", cancel: "Abbrechen", titleLabel: "Falltitel *", titlePlaceholder: "Beispiel: Mietvertrag — García", personLabel: "Beteiligte Person", personPlaceholder: "Kunde, Gegenpartei oder Kontakt", summaryLabel: "Zusammenfassung", summaryPlaceholder: "Kontext, nächster Schritt oder relevante Info...", continuity: "Kontinuität", opened: "Geöffnet am", deleteConfirm: "Diesen Fall löschen?", createdOk: "Fall erstellt.", updatedOk: "Fall aktualisiert.", deletedOk: "Fall gelöscht.", deletedError: "Fehler beim Löschen.", loadError: "Fehler beim Laden." },
  fr: { title: "Cas", subtitle: "Ligne de travail pour continuité, contexte et suivi historique.", sync: "Synchronisé avec Supabase et WhatsApp", reminder: "Chaque cas doit préserver une mémoire utile par contact, fichier et futures conversations.", total: "cas au total", open: "ouverts", search: "Rechercher des cas...", all: "Tous", noCases: "Aucun cas", noCasesHint: "Crée le premier ici ou demande à Operaly sur WhatsApp d’en ouvrir un.", newCase: "Nouveau cas", editCase: "Modifier le cas", createCase: "Créer le cas", save: "Enregistrer", cancel: "Annuler", titleLabel: "Titre du cas *", titlePlaceholder: "Ex. : Contrat de bail — García", personLabel: "Personne impliquée", personPlaceholder: "Client, contrepartie ou contact", summaryLabel: "Résumé", summaryPlaceholder: "Contexte, prochaine étape ou information pertinente...", continuity: "Continuité", opened: "Ouvert le", deleteConfirm: "Supprimer ce cas ?", createdOk: "Cas créé.", updatedOk: "Cas mis à jour.", deletedOk: "Cas supprimé.", deletedError: "Erreur de suppression.", loadError: "Erreur de chargement." },
  it: { title: "Casi", subtitle: "Linea di lavoro per continuità, contesto e storico operativo.", sync: "Sincronizzato con Supabase e WhatsApp", reminder: "Ogni caso deve conservare memoria utile per contatto, file e conversazioni future.", total: "casi totali", open: "aperti", search: "Cerca casi...", all: "Tutti", noCases: "Nessun caso", noCasesHint: "Crea il primo qui o chiedi a Operaly su WhatsApp di aprirne uno.", newCase: "Nuovo caso", editCase: "Modifica caso", createCase: "Crea caso", save: "Salva", cancel: "Annulla", titleLabel: "Titolo del caso *", titlePlaceholder: "Es.: Contratto di locazione — García", personLabel: "Persona coinvolta", personPlaceholder: "Cliente, controparte o contatto", summaryLabel: "Riassunto", summaryPlaceholder: "Contesto, prossimo passo o informazione rilevante...", continuity: "Continuità", opened: "Aperto il", deleteConfirm: "Eliminare questo caso?", createdOk: "Caso creato.", updatedOk: "Caso aggiornato.", deletedOk: "Caso eliminato.", deletedError: "Errore durante l’eliminazione.", loadError: "Errore di caricamento." },
}

function getStatus(value: string | null) {
  return STATUS.find((status) => status.value === String(value || "open").toLowerCase()) || STATUS[0]
}

function StatusBadge({ status }: { status: string | null }) {
  const current = getStatus(status)
  const Icon = current.icon
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${current.bg} ${current.border}`} style={{ color: current.color }}><Icon className="w-3 h-3" />{current.label}</span>
}

function isCaseEvent(eventType: string | null | undefined) {
  const normalized = String(eventType || "").toLowerCase()
  return normalized.includes("case") || normalized.includes("continuity")
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      {label}: {value}
    </span>
  )
}

function DetailModal({ cas, locale, copy, onClose, onEdit, onDelete }: { cas: CaseRow; locale: string; copy: Record<string, string>; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const title = cas.case_title || cas.title || "Caso"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusBadge status={cas.status} />
              <h2 className="text-lg font-bold text-[#0F1F63] mt-2">{title}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {(cas.person_name || cas.person_key) && (
            <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3">
              <User className="w-4 h-4 text-[#7C3AED]" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{copy.personLabel}</p>
                <p className="text-sm font-semibold text-[#0F1F63]">{cas.person_name || cas.person_key}</p>
                {cas.person_type && <p className="text-xs text-muted-foreground">{cas.person_type}</p>}
              </div>
            </div>
          )}
          {cas.summary && <div className="bg-secondary/40 rounded-xl p-4"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{copy.summaryLabel}</p><p className="text-sm text-[#0F1F63] leading-relaxed">{cas.summary}</p></div>}
          {cas.continuity_summary && <div className="bg-[#EFF6FF] rounded-xl p-4 border border-[#BFDBFE]"><p className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-2">{copy.continuity}</p><p className="text-sm text-[#1D4ED8] leading-relaxed">{cas.continuity_summary}</p></div>}
          <div className="flex flex-wrap gap-2">
            {cas.event_count ? <MetricPill label="Hitos" value={String(cas.event_count)} /> : null}
            {cas.document_count ? <MetricPill label="Docs" value={String(cas.document_count)} /> : null}
            {cas.contact_count ? <MetricPill label="Contactos" value={String(cas.contact_count)} /> : null}
            {cas.last_event_type ? <MetricPill label="Último evento" value={normalizeRuntimeStatus(cas.last_event_type)} /> : null}
          </div>
          {cas.created_at && <p className="text-xs text-muted-foreground">{copy.opened} {new Date(cas.created_at).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>}
          {cas.last_activity_at ? <p className="text-xs text-muted-foreground">Última actividad: {new Date(cas.last_activity_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}</p> : null}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={() => { onEdit(); onClose() }} className="flex-1 h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-bold hover:bg-[#1a2f7a] flex items-center justify-center gap-2"><Pencil className="w-4 h-4" />{copy.editCase}</button>
          <button onClick={() => { onDelete(); onClose() }} className="h-10 w-10 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}

function FormModal({
  cas,
  copy,
  contactOptions,
  googleContactsActive,
  onClose,
  onSave,
}: {
  cas?: CaseRow
  copy: Record<string, string>
  contactOptions: ContactOption[]
  googleContactsActive: boolean
  onClose: () => void
  onSave: (payload: any) => Promise<void>
}) {
  const [title, setTitle] = useState(cas?.case_title || cas?.title || "")
  const [person, setPerson] = useState(cas?.person_name || cas?.person_key || "")
  const [summary, setSummary] = useState(cas?.summary || "")
  const [status, setStatus] = useState(cas?.status || "open")
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), case_title: title.trim(), person_name: person.trim() || null, person_key: person.trim() || null, summary: summary.trim() || null, status })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-bold text-[#0F1F63]">{cas ? copy.editCase : copy.newCase}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{copy.titleLabel}</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus placeholder={copy.titlePlaceholder} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{copy.personLabel}</label>
            <input
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              list="case-contact-options"
              placeholder={copy.personPlaceholder}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
            />
            <datalist id="case-contact-options">
              {contactOptions.map((option) => (
                <option key={option.id} value={option.label} />
              ))}
            </datalist>
            <p className="mt-2 text-xs text-muted-foreground">
              {googleContactsActive
                ? "Puede elegir desde su libreta y también desde los contactos conectados de Google."
                : "Puede elegir desde su libreta actual y luego relacionar documentos o seguimiento a este caso."}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{copy.summaryLabel}</label>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} placeholder={copy.summaryPlaceholder} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS.map((statusRow) => {
              const Icon = statusRow.icon
              return <button key={statusRow.value} onClick={() => setStatus(statusRow.value)} className={`h-10 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${status === statusRow.value ? `${statusRow.bg} ${statusRow.border}` : "border-border bg-background text-muted-foreground"}`} style={status === statusRow.value ? { color: statusRow.color } : {}}><Icon className="w-3.5 h-3.5" />{statusRow.label}</button>
            })}
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-secondary">{copy.cancel}</button>
          <button onClick={submit} disabled={saving || !title.trim()} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">{saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{cas ? copy.save : copy.createCase}</button>
        </div>
      </div>
    </div>
  )
}

export default function CasosPage() {
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<CaseRow[]>([])
  const [clientId, setClientId] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [detail, setDetail] = useState<CaseRow | null>(null)
  const [editing, setEditing] = useState<CaseRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<Toast>({ open: false, msg: "", type: "info" })
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [locale, setLocale] = useState("es-PE")
  const [timezone, setTimezone] = useState("America/Lima")
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<ProfessionalRuntimeSnapshot | null>(null)
  const [contactSignals, setContactSignals] = useState({
    total: 0,
    googleLike: 0,
    withEmail: 0,
  })
  const [googleSignals, setGoogleSignals] = useState({
    gmailConnected: false,
    driveConnected: false,
    contactsConnected: false,
    gmailSyncStatus: "",
    driveSyncStatus: "",
    contactsSyncStatus: "",
  })
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const copy = COPY[language]
  const showToast = (msg: string, type: Toast["type"] = "info") => setToast({ open: true, msg, type })

  async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error("No hay sesión activa.")
    return { Authorization: `Bearer ${token}` }
  }

  async function load() {
    setLoading(true)
    try {
      const currentClientId = await getCurrentClientId()
      const from = page * CASES_PAGE_SIZE
      const to = from + CASES_PAGE_SIZE
      setClientId(currentClientId)
      const [{ data: client }, { data, error }, { data: contacts }] = await Promise.all([
        supabase.from("clients").select("preferred_language,language,timezone,timezone_auto").eq("id", currentClientId).maybeSingle(),
        supabase.from("cases").select("id,client_id,title,person_key,status,person_name,person_type,case_title,summary,continuity_summary,last_activity_at,created_at,updated_at,event_count,document_count,contact_count,last_event_type").eq("client_id", currentClientId).order("created_at", { ascending: false }).range(from, to),
        supabase.from("contacts").select("id,name,display_name,full_name,contact_name,email,source").eq("client_id", currentClientId).order("updated_at", { ascending: false }).limit(CASE_CONTACTS_PAGE_SIZE),
      ])
      if (error) throw error
      const resolvedLanguage = resolveLanguageCode(client?.preferred_language || client?.language || "es")
      setLanguage(resolvedLanguage)
      setLocale(localeFromLanguage(resolvedLanguage))
      setTimezone(client?.timezone_auto || client?.timezone || "America/Lima")
      const nextCases = (data || []).slice(0, CASES_PAGE_SIZE)
      setHasMore((data || []).length > CASES_PAGE_SIZE)
      setCases(nextCases as CaseRow[])
      const contactRows = contacts || []
      setContactOptions(
        contactRows
          .map((contact: any) => {
            const label = String(
              contact.full_name ||
              contact.display_name ||
              contact.name ||
              contact.contact_name ||
              contact.email ||
              ""
            ).trim()
            if (!label) return null
            return {
              id: String(contact.id || label),
              label,
              email: contact.email ? String(contact.email) : null,
              source: contact.source ? String(contact.source) : null,
            } satisfies ContactOption
          })
          .filter(Boolean) as ContactOption[]
      )
      setContactSignals({
        total: contactRows.length,
        googleLike: contactRows.filter((contact) => {
          const source = String(contact.source || "").toLowerCase()
          return source.includes("google") || source.includes("merge")
        }).length,
        withEmail: contactRows.filter((contact) => Boolean(contact.email)).length,
      })
      try {
        const headers = await getAuthHeaders()
        const googleResponse = await fetch("/api/google/status", {
          method: "GET",
          headers,
          cache: "no-store",
        })
        const googlePayload = (await googleResponse.json().catch(() => ({}))) as GoogleStatusPayload
        if (googleResponse.ok) {
          const authorizedProducts = googlePayload?.connection?.authorized_products || []
          const gmailState = googlePayload?.products?.gmail || googlePayload?.gmail || null
          const driveState = googlePayload?.products?.drive || googlePayload?.drive || null
          const contactsState = googlePayload?.products?.contacts || googlePayload?.contacts || null
          setGoogleSignals({
            gmailConnected: Boolean(gmailState?.enabled) || authorizedProducts.includes("gmail"),
            driveConnected: Boolean(driveState?.enabled) || authorizedProducts.includes("drive"),
            contactsConnected: Boolean(contactsState?.enabled) || authorizedProducts.includes("contacts"),
            gmailSyncStatus: String(gmailState?.sync_status || ""),
            driveSyncStatus: String(driveState?.sync_status || ""),
            contactsSyncStatus: String(contactsState?.sync_status || ""),
          })
        }
      } catch (googleError) {
        console.error("No se pudo cargar estado Google de casos:", googleError)
      }
      try {
        setRuntimeSnapshot(await fetchProfessionalRuntime())
      } catch (runtimeError) {
        console.error("No se pudo cargar runtime de casos:", runtimeError)
      }
    } catch (error: any) {
      showToast(error.message || copy.loadError, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const filtered = useMemo(() => cases.filter((cas) => {
    const query = search.toLowerCase()
    const matchesQuery = !query || (cas.case_title || cas.title || "").toLowerCase().includes(query) || (cas.person_name || "").toLowerCase().includes(query)
    const matchesStatus = !filterStatus || (cas.status || "open") === filterStatus
    return matchesQuery && matchesStatus
  }), [cases, search, filterStatus])

  const counts = useMemo(() => Object.fromEntries(STATUS.map((statusRow) => [statusRow.value, cases.filter((cas) => (cas.status || "open") === statusRow.value).length])), [cases])
  const recentCaseEvents = useMemo(() => {
    return (runtimeSnapshot?.recentEvents || []).filter((event) => isCaseEvent(event?.event_type)).slice(0, 4)
  }, [runtimeSnapshot])
  const casesWithContinuity = cases.filter((cas) => Boolean(cas.continuity_summary)).length
  const casesWithActivity = cases.filter((cas) => Boolean(cas.last_activity_at || cas.last_event_type)).length

  async function createCase(payload: any) {
    const { error } = await supabase.from("cases").insert({ client_id: clientId, ...payload, created_at: new Date().toISOString() })
    if (error) throw error
    showToast(copy.createdOk, "success")
    await load()
  }

  async function updateCase(payload: any) {
    if (!editing) return
    const { error } = await supabase.from("cases").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id)
    if (error) throw error
    showToast(copy.updatedOk, "success")
    await load()
  }

  async function deleteCase(id: string) {
    if (!window.confirm(copy.deleteConfirm)) return
    const { error } = await supabase.from("cases").delete().eq("id", id)
    if (error) {
      showToast(copy.deletedError, "error")
      return
    }
    showToast(copy.deletedOk, "success")
    setCases((prev) => prev.filter((cas) => cas.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">{copy.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cases.length} {copy.total} · {counts.open || 0} {copy.open}</p>
          <p className="text-xs text-muted-foreground mt-1">{copy.sync} · {labelForLanguage(language)} · {locale} · {timezone}</p>
          <p className="text-xs text-[#5F6B7A] mt-1">{copy.reminder}</p>
          <p className="text-xs text-muted-foreground mt-1">Página {page + 1} · máximo {CASES_PAGE_SIZE} casos por carga</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || loading} className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-secondary disabled:opacity-40">Anterior</button>
          <button onClick={() => setPage((current) => current + 1)} disabled={!hasMore || loading} className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-secondary disabled:opacity-40">Siguiente</button>
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={() => setCreating(true)} className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 flex items-center gap-1.5"><Plus className="w-4 h-4" />{copy.newCase}</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterStatus("")} className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${!filterStatus ? "bg-[#0F1F63] text-white border-transparent" : "border-border bg-background text-muted-foreground"}`}>{copy.all} ({cases.length})</button>
          {STATUS.map((statusRow) => <button key={statusRow.value} onClick={() => setFilterStatus(statusRow.value)} className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${filterStatus === statusRow.value ? `${statusRow.bg} ${statusRow.border}` : "border-border bg-background text-muted-foreground"}`} style={filterStatus === statusRow.value ? { color: statusRow.color } : {}}>{statusRow.label} ({counts[statusRow.value] || 0})</button>)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0F1F63]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">Resumen del trabajo</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aquí ve qué temas siguen abiertos, qué ya tiene continuidad y con qué personas o documentos puede apoyarse.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Casos</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{cases.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Temas que ya tiene guardados.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Con resumen</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {casesWithContinuity}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Casos que ya se pueden retomar más fácil.</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Actividad</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{recentCaseEvents.length > 0 ? "Con movimiento" : "Pendiente"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Le ayuda a ver si un caso se está moviendo o sigue quieto.</p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Con actividad</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{casesWithActivity}</p>
              <p className="mt-1 text-xs text-muted-foreground">Casos con alguna novedad visible.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Seguimiento</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
                {recentCaseEvents.length > 0 ? "Con señal" : "Pendiente"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Le muestra si el caso ya viene tomando forma.</p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${googleSignals.contactsConnected ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white/80"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Personas involucradas</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleSignals.contactsConnected ? "Libreta + Google" : "Libreta interna"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {googleSignals.contactsConnected
                  ? `Al crear un caso ya puede asociar personas desde sus contactos y retomar ese hilo después por nombre o referencia.`
                  : `Cada caso ya puede apoyarse en su libreta propia para relacionar personas, documentos y seguimiento.`}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${googleSignals.gmailConnected ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white/80"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Seguimiento del caso</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleSignals.gmailConnected ? "Correo listo" : "Listo para continuar"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {googleSignals.gmailConnected
                  ? `Puede escalar un caso a correo cuando haga falta y mantener a la persona correcta dentro del hilo.`
                  : `${contactSignals.withEmail} contacto${contactSignals.withEmail !== 1 ? "s" : ""} ya tiene email para futuras acciones desde el caso.`}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${googleSignals.driveConnected ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white/80"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Documentos del caso</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleSignals.driveConnected ? "Listos para asociar" : "Base documental activa"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {googleSignals.driveConnected
                  ? `Puede conectar documentos remotos o propios y volver a pedirle a Operaly que siga ese caso más adelante.`
                  : "Los documentos propios ya pueden darle continuidad al caso aunque todavía no todo venga desde integraciones."}
              </p>
            </div>
          </div>
          <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${contactSignals.googleLike > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
            {contactSignals.googleLike > 0
              ? `Ya hay ${contactSignals.googleLike} contacto${contactSignals.googleLike !== 1 ? "s" : ""} Google o fusionado${contactSignals.googleLike !== 1 ? "s" : ""} visible${contactSignals.googleLike !== 1 ? "s" : ""} para nutrir continuidad, correo y seguimiento por persona.`
              : `Los casos ya pueden apoyarse en ${contactSignals.total} contacto${contactSignals.total !== 1 ? "s" : ""} interno${contactSignals.total !== 1 ? "s" : ""}. El siguiente salto es ver aqui el puente real con Google Contacts y sus emails.`}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F1F63]">Movimientos recientes</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Le ayuda a ver qué cambió hace poco en sus casos.
          </p>
          <div className="mt-4 space-y-3">
            {recentCaseEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                Todavía no hay novedades recientes en sus casos.
              </div>
            ) : (
              recentCaseEvents.map((event) => (
                <div key={String(event.id || event.created_at)} className="rounded-2xl border border-border bg-secondary/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Runtime</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
                    {normalizeRuntimeStatus(String(event.event_type || "case_event"))}
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

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2"><RefreshCw className="w-5 h-5 animate-spin" />{copy.loadError}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="font-semibold text-[#0F1F63]">{copy.noCases}</p>
          <p className="text-sm text-muted-foreground mt-1">{copy.noCasesHint}</p>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {filtered.map((cas) => {
            const title = cas.case_title || cas.title || "Caso"
            const person = cas.person_name || cas.person_key || null
            return (
              <div key={cas.id} onClick={() => setDetail(cas)} className="group bg-card rounded-2xl border border-border p-5 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0"><FolderOpen className="w-5 h-5 text-[#3B82F6]" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#0F1F63] leading-snug">{title}</p>
                      {person && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><User className="w-3 h-3" />{person}</p>}
                      {cas.summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-secondary/30 rounded-lg px-2.5 py-1.5">{cas.summary}</p>}
                      {cas.continuity_summary && <p className="text-xs text-[#1D4ED8] mt-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-2.5 py-1.5 line-clamp-2">{cas.continuity_summary}</p>}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cas.event_count ? <MetricPill label="Hitos" value={String(cas.event_count)} /> : null}
                        {cas.document_count ? <MetricPill label="Docs" value={String(cas.document_count)} /> : null}
                        {cas.last_event_type ? <MetricPill label="Último" value={normalizeRuntimeStatus(cas.last_event_type)} /> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={cas.status} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(event) => event.stopPropagation()}>
                      <button onClick={() => setEditing(cas)} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-secondary"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => deleteCase(cas.id)} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{cas.created_at ? new Date(cas.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading ? (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-secondary disabled:opacity-40">Anterior</button>
          <button onClick={() => setPage((current) => current + 1)} disabled={!hasMore} className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-secondary disabled:opacity-40">Siguiente</button>
        </div>
      ) : null}

      {creating && <FormModal copy={copy} contactOptions={contactOptions} googleContactsActive={googleSignals.contactsConnected} onClose={() => setCreating(false)} onSave={createCase} />}
      {detail && !editing && <DetailModal cas={detail} locale={locale} copy={copy} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null) }} onDelete={() => { deleteCase(detail.id); setDetail(null) }} />}
      {editing && <FormModal cas={editing} copy={copy} contactOptions={contactOptions} googleContactsActive={googleSignals.contactsConnected} onClose={() => setEditing(null)} onSave={updateCase} />}
      <AppToast open={toast.open} message={toast.msg} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </div>
  )
}
