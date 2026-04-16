"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  FolderLock,
  KeyRound,
  Link2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  fetchProfessionalRuntime,
  normalizeRuntimeStatus,
  type ProfessionalRuntimeSnapshot,
} from "@/lib/professional-runtime"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

type VaultRow = Record<string, any> & {
  id: string
  client_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    title: "Baúl privado",
    subtitle: "Vista separada para links, credenciales y registros sensibles ligados a tu cuenta.",
    sync: "Sincronizado con Supabase como fuente de verdad",
    search: "Buscar por nombre, tipo o referencia...",
    empty: "Aún no hay elementos visibles",
    emptyHint: "Cuando el backend clasifique o guarde información sensible, aparecerá aquí con trazabilidad.",
    contract: "Este módulo ya te muestra el estado real de lectura. La alta y edición completa siguen dependiendo del contrato backend final.",
    refresh: "Actualizar",
    delete: "Eliminar",
    type: "Tipo",
    created: "Creado",
    updated: "Actualizado",
    details: "Detalle",
    runtime: "Estado del módulo",
    runtimeHint: "Aquí diferenciamos lo que ya existe realmente en tu vault de lo que todavía depende del backend.",
    pending: "Gestión completa pendiente",
    ready: "Lectura disponible",
    count: "registros",
    protected: "Cobertura esperada",
    protectedHint: "El baúl debe separar credenciales, links y archivos sensibles del resto de la operación.",
    credentials: "Credenciales y accesos",
    links: "Links y referencias privadas",
    files: "Archivos sensibles",
    recent: "Actividad reciente",
    recentHint: "Aquí verás señales recientes del runtime cuando el backend clasifique o use contenido sensible.",
    noRecent: "Aún no hay eventos recientes del baúl privado para mostrar.",
    backendSource: "Señal backend",
  },
  en: {
    title: "Private vault",
    subtitle: "Separate view for links, credentials, and sensitive records tied to your account.",
    sync: "Synced with Supabase as source of truth",
    search: "Search by name, type, or reference...",
    empty: "No visible items yet",
    emptyHint: "When the backend classifies or stores sensitive information, it will show up here with traceability.",
    contract: "This module already shows the real read state. Full create/edit still depends on the final backend contract.",
    refresh: "Refresh",
    delete: "Delete",
    type: "Type",
    created: "Created",
    updated: "Updated",
    details: "Details",
    runtime: "Module status",
    runtimeHint: "This panel separates what already exists in your vault from what still depends on backend work.",
    pending: "Full management pending",
    ready: "Read access available",
    count: "records",
    protected: "Expected coverage",
    protectedHint: "The vault should separate credentials, links, and sensitive files from the rest of the operation.",
    credentials: "Credentials and access",
    links: "Private links and references",
    files: "Sensitive files",
    recent: "Recent activity",
    recentHint: "This area shows recent runtime signals when the backend classifies or uses sensitive content.",
    noRecent: "No recent private vault events yet.",
    backendSource: "Backend signal",
  },
  pt: {
    title: "Baú privado",
    subtitle: "Visão separada para links, credenciais e registros sensíveis ligados à sua conta.",
    sync: "Sincronizado com Supabase como fonte de verdade",
    search: "Buscar por nome, tipo ou referência...",
    empty: "Ainda não há itens visíveis",
    emptyHint: "Quando o backend classificar ou salvar informação sensível, ela aparecerá aqui com rastreabilidade.",
    contract: "Este módulo já mostra o estado real de leitura. Criação e edição completas ainda dependem do contrato final do backend.",
    refresh: "Atualizar",
    delete: "Excluir",
    type: "Tipo",
    created: "Criado",
    updated: "Atualizado",
    details: "Detalhes",
    runtime: "Estado do módulo",
    runtimeHint: "Aqui separamos o que já existe de verdade no baú do que ainda depende do backend.",
    pending: "Gestão completa pendente",
    ready: "Leitura disponível",
    count: "registros",
    protected: "Cobertura esperada",
    protectedHint: "O baú deve separar credenciais, links e arquivos sensíveis do restante da operação.",
    credentials: "Credenciais e acessos",
    links: "Links e referências privadas",
    files: "Arquivos sensíveis",
    recent: "Atividade recente",
    recentHint: "Aqui você verá sinais recentes do runtime quando o backend classificar ou usar conteúdo sensível.",
    noRecent: "Ainda não há eventos recentes do baú privado para mostrar.",
    backendSource: "Sinal do backend",
  },
  de: {
    title: "Privater Tresor",
    subtitle: "Getrennte Ansicht für Links, Zugangsdaten und sensible Einträge deines Kontos.",
    sync: "Mit Supabase als Quelle der Wahrheit synchronisiert",
    search: "Nach Name, Typ oder Referenz suchen...",
    empty: "Noch keine sichtbaren Einträge",
    emptyHint: "Sobald das Backend sensible Informationen klassifiziert oder speichert, erscheinen sie hier mit Nachvollziehbarkeit.",
    contract: "Dieses Modul zeigt bereits den echten Lesezustand. Vollständiges Erstellen/Bearbeiten hängt noch vom finalen Backend-Vertrag ab.",
    refresh: "Aktualisieren",
    delete: "Löschen",
    type: "Typ",
    created: "Erstellt",
    updated: "Aktualisiert",
    details: "Details",
    runtime: "Modulstatus",
    runtimeHint: "Hier trennen wir, was bereits wirklich im Tresor liegt, von dem, was noch vom Backend abhängt.",
    pending: "Vollständige Verwaltung ausstehend",
    ready: "Lesen verfügbar",
    count: "Einträge",
    protected: "Erwarteter Umfang",
    protectedHint: "Der Tresor soll Zugangsdaten, Links und sensible Dateien vom restlichen Betrieb trennen.",
    credentials: "Zugangsdaten und Zugriffe",
    links: "Private Links und Referenzen",
    files: "Sensible Dateien",
    recent: "Letzte Aktivität",
    recentHint: "Hier erscheinen aktuelle Runtime-Signale, wenn das Backend sensible Inhalte klassifiziert oder nutzt.",
    noRecent: "Noch keine aktuellen Tresor-Ereignisse verfügbar.",
    backendSource: "Backend-Signal",
  },
  fr: {
    title: "Coffre privé",
    subtitle: "Vue séparée pour les liens, identifiants et éléments sensibles liés à ton compte.",
    sync: "Synchronisé avec Supabase comme source de vérité",
    search: "Rechercher par nom, type ou référence...",
    empty: "Aucun élément visible pour l’instant",
    emptyHint: "Quand le backend classera ou stockera des informations sensibles, elles apparaîtront ici avec traçabilité.",
    contract: "Ce module montre déjà l’état réel en lecture. La création et l’édition complètes dépendent encore du contrat backend final.",
    refresh: "Actualiser",
    delete: "Supprimer",
    type: "Type",
    created: "Créé",
    updated: "Mis à jour",
    details: "Détails",
    runtime: "État du module",
    runtimeHint: "Ici, on sépare ce qui existe déjà réellement dans le coffre de ce qui dépend encore du backend.",
    pending: "Gestion complète en attente",
    ready: "Lecture disponible",
    count: "éléments",
    protected: "Couverture attendue",
    protectedHint: "Le coffre doit séparer identifiants, liens et fichiers sensibles du reste de l’opération.",
    credentials: "Identifiants et accès",
    links: "Liens et références privées",
    files: "Fichiers sensibles",
    recent: "Activité récente",
    recentHint: "Tu verras ici les signaux récents du runtime quand le backend classe ou utilise du contenu sensible.",
    noRecent: "Aucun événement récent du coffre privé pour l’instant.",
    backendSource: "Signal backend",
  },
  it: {
    title: "Caveau privato",
    subtitle: "Vista separata per link, credenziali e record sensibili associati al tuo account.",
    sync: "Sincronizzato con Supabase come fonte di verità",
    search: "Cerca per nome, tipo o riferimento...",
    empty: "Nessun elemento visibile per ora",
    emptyHint: "Quando il backend classificherà o salverà informazioni sensibili, compariranno qui con tracciabilità.",
    contract: "Questo modulo mostra già lo stato reale in lettura. Creazione e modifica complete dipendono ancora dal contratto backend finale.",
    refresh: "Aggiorna",
    delete: "Elimina",
    type: "Tipo",
    created: "Creato",
    updated: "Aggiornato",
    details: "Dettagli",
    runtime: "Stato del modulo",
    runtimeHint: "Qui separiamo ciò che esiste davvero nel caveau da ciò che dipende ancora dal backend.",
    pending: "Gestione completa in sospeso",
    ready: "Lettura disponibile",
    count: "record",
    protected: "Copertura prevista",
    protectedHint: "Il caveau deve separare credenziali, link e file sensibili dal resto dell’operatività.",
    credentials: "Credenziali e accessi",
    links: "Link e riferimenti privati",
    files: "File sensibili",
    recent: "Attività recente",
    recentHint: "Qui vedrai i segnali runtime recenti quando il backend classifica o usa contenuti sensibili.",
    noRecent: "Nessun evento recente del caveau privato.",
    backendSource: "Segnale backend",
  },
}

function inferVaultType(item: VaultRow) {
  return String(item.item_type || item.type || item.kind || item.category || "registro")
}

function inferVaultTitle(item: VaultRow) {
  return String(
    item.title ||
      item.name ||
      item.label ||
      item.reference_name ||
      item.reference ||
      item.key ||
      "Registro sensible"
  )
}

function inferVaultDetail(item: VaultRow) {
  return String(
    item.url ||
      item.link_url ||
      item.username ||
      item.notes ||
      item.description ||
      item.summary ||
      item.storage_path ||
      "Sin detalle visible"
  )
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(parsed)
}

function isVaultEvent(eventType: string | null | undefined) {
  const normalized = String(eventType || "").toLowerCase()
  return (
    normalized.includes("vault") ||
    normalized.includes("private") ||
    normalized.includes("credential") ||
    normalized.includes("sensitive")
  )
}

function inferOriginLabel(item: VaultRow) {
  return String(item.source || item.origin || item.created_from || item.channel || "vault")
}

function TypeIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase()
  if (normalized.includes("password") || normalized.includes("credential") || normalized.includes("secret")) {
    return <KeyRound className="h-4 w-4 text-[#7C3AED]" />
  }
  if (normalized.includes("link") || normalized.includes("url")) {
    return <Link2 className="h-4 w-4 text-[#3B82F6]" />
  }
  return <Lock className="h-4 w-4 text-[#10B981]" />
}

export default function BaulPrivadoPage() {
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState<VaultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [locale, setLocale] = useState("es-PE")
  const [errorMessage, setErrorMessage] = useState("")
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<ProfessionalRuntimeSnapshot | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [draft, setDraft] = useState({ title: "", type: "", detail: "" })

  const copy = COPY[language]

  async function load() {
    setLoading(true)
    setErrorMessage("")
    try {
      const currentClientId = await getCurrentClientId()
      setClientId(currentClientId)

      const { data: client } = await supabase
        .from("clients")
        .select("preferred_language,language")
        .eq("id", currentClientId)
        .maybeSingle()

      const resolvedLanguage = resolveLanguageCode(client?.preferred_language || client?.language || "es")
      setLanguage(resolvedLanguage)
      setLocale(localeFromLanguage(resolvedLanguage))

      try {
        setRuntimeSnapshot(await fetchProfessionalRuntime())
      } catch (runtimeError) {
        console.error("No se pudo cargar runtime del baúl privado:", runtimeError)
      }

      const { data, error } = await supabase
        .from("private_vault_items")
        .select("*")
        .eq("client_id", currentClientId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setItems((data || []) as VaultRow[])
    } catch (error: any) {
      console.error(error)
      setItems([])
      setErrorMessage(error.message || "No se pudo cargar el baúl privado.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      [inferVaultTitle(item), inferVaultType(item), inferVaultDetail(item)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [items, search])

  const recentVaultEvents = useMemo(() => {
    return (runtimeSnapshot?.recentEvents || []).filter((event) => isVaultEvent(event?.event_type)).slice(0, 4)
  }, [runtimeSnapshot])

  async function saveVaultItem() {
    if (!clientId || !draft.title.trim()) return
    setSaving(true)
    setSaveMessage("")

    const attempts = [
      { client_id: clientId, title: draft.title.trim(), item_type: draft.type.trim() || "registro", notes: draft.detail.trim() || null, source: "dashboard" },
      { client_id: clientId, title: draft.title.trim(), item_type: draft.type.trim() || "registro", notes: draft.detail.trim() || null },
      { client_id: clientId, title: draft.title.trim(), type: draft.type.trim() || "registro", description: draft.detail.trim() || null },
      { client_id: clientId, name: draft.title.trim(), type: draft.type.trim() || "registro", notes: draft.detail.trim() || null },
    ]

    let lastError: any = null
    for (const payload of attempts) {
      const result = await supabase.from("private_vault_items").insert(payload).select("*").single()
      if (!result.error) {
        setItems((prev) => [result.data as VaultRow, ...prev])
        setDraft({ title: "", type: "", detail: "" })
        setShowCreate(false)
        setSaveMessage("Guardado correctamente.")
        setSaving(false)
        return
      }
      lastError = result.error
    }

    console.error(lastError)
    setSaveMessage(lastError?.message || "No se pudo guardar. Intente de nuevo.")
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este registro del baúl privado?")) return
    const { error } = await supabase.from("private_vault_items").delete().eq("id", id)
    if (error) {
      alert(error.message)
      return
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">{copy.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{copy.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">
            {items.length} {copy.count} · {copy.sync} · {labelForLanguage(language)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-4 text-sm font-medium text-[#0F1F63] hover:bg-[#3B82F6]/10"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
          <button
            onClick={() => load()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-[#0F1F63] hover:bg-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {copy.refresh}
          </button>
        </div>
      </div>

      {saveMessage ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${saveMessage.toLowerCase().includes("no se pudo") ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {saveMessage}
        </div>
      ) : null}

      {showCreate ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Nombre" className="h-10 rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none" />
            <input value={draft.type} onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value }))} placeholder="Qué es" className="h-10 rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none" />
            <input value={draft.detail} onChange={(event) => setDraft((prev) => ({ ...prev, detail: event.target.value }))} placeholder="Detalle" className="h-10 rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => void saveVaultItem()} disabled={saving || !draft.title.trim()} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
            <button onClick={() => setShowCreate(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-[#0F1F63] hover:bg-secondary">
              Cerrar
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#0F1F63]/10 bg-gradient-to-r from-[#0F1F63]/5 via-white to-[#3B82F6]/5 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#0F1F63]" />
          <h2 className="text-lg font-semibold text-[#0F1F63]">{copy.runtime}</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.runtimeHint}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contenido visible</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {errorMessage ? copy.pending : copy.ready}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {errorMessage || "Ya puede revisar lo que está guardado para su cuenta."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Captura y edición</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{copy.pending}</p>
            <p className="mt-1 text-xs text-muted-foreground">{copy.contract}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[#0F1F63]" />
            <h2 className="text-lg font-semibold text-[#0F1F63]">{copy.protected}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.protectedHint}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { label: copy.credentials, icon: <KeyRound className="h-4 w-4 text-[#7C3AED]" /> },
              { label: copy.links, icon: <Link2 className="h-4 w-4 text-[#2563EB]" /> },
              { label: copy.files, icon: <FolderLock className="h-4 w-4 text-[#0F766E]" /> },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <p className="text-sm font-semibold text-[#0F1F63]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0F1F63]" />
            <h2 className="text-lg font-semibold text-[#0F1F63]">{copy.recent}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.recentHint}</p>
          <div className="mt-4 space-y-3">
            {recentVaultEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                {copy.noRecent}
              </div>
            ) : (
              recentVaultEvents.map((event) => (
                <div key={String(event.id || event.created_at)} className="rounded-2xl border border-border bg-secondary/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{copy.backendSource}</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F1F63]">
                    {normalizeRuntimeStatus(String(event.event_type || "runtime_event"))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(event.created_at, locale)}
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
            <h2 className="text-lg font-semibold text-[#0F1F63]">Separación con documentos</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              El baúl privado no reemplaza tu base documental. Aquí deben vivir credenciales, links y archivos sensibles cuando el runtime o tú decidan aislarlos del flujo operativo general.
            </p>
          </div>
          <Link
            href="/dashboard/professional/documentos"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0F1F63]/15 bg-white px-4 text-sm font-medium text-[#0F1F63] hover:bg-secondary"
          >
            <FolderLock className="h-4 w-4" />
            Ver documentos
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Registros visibles</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{items.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Elementos ya separados dentro de `private_vault_items`.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Origen documental</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {items.filter((item) => inferOriginLabel(item).toLowerCase().includes("document")).length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Registros que ya parecen venir de clasificación documental o runtime similar.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Separación viva</p>
            <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
              {recentVaultEvents.length > 0 ? "Con señal" : "Pendiente"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">La clasificación sensible desde documentos y WhatsApp todavía seguirá ganando profundidad en backend.</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={copy.search}
          className="h-11 w-full rounded-xl border border-[#D9E1EC] bg-white pl-9 pr-4 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Cargando baúl privado...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9E1EC] bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F1F63]/5">
            <FolderLock className="h-7 w-7 text-[#0F1F63]" />
          </div>
          <p className="mt-4 font-medium text-[#0F1F63]">{copy.empty}</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{copy.emptyHint}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const type = inferVaultType(item)
            const title = inferVaultTitle(item)
            const detail = inferVaultDetail(item)

            return (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F1F63]/5">
                      <TypeIcon type={type} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F1F63]">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground break-all">{detail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    {copy.delete}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.type}</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F63]">{type}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.created}</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F63]">{formatDate(item.created_at, locale)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.updated}</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F63]">{formatDate(item.updated_at, locale)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{copy.contract}</p>
        </div>
      </div>
    </div>
  )
}
