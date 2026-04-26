"use client"

import { useEffect, useMemo, useState } from "react"
import {
  FileKey2,
  FolderLock,
  KeyRound,
  Link2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { getCurrentClientId } from "@/lib/dashboard-client"
import {
  labelForLanguage,
  localeFromLanguage,
  resolveLanguageCode,
  type SupportedLanguage,
} from "@/lib/runtime-locale"
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
    subtitle:
      "Guarde aquí documentos, enlaces y notas privadas para volver a usarlos cuando lo necesite.",
    sync: "Solo lo sensible y lo importante, siempre a mano",
    search: "Buscar por nombre, categoría o referencia...",
    empty: "Aún no tiene elementos en su baúl",
    emptyHint:
      "Cuando guarde algo sensible, aparecerá aquí para revisarlo, buscarlo o eliminarlo.",
    refresh: "Actualizar",
    delete: "Eliminar",
    count: "registros",
  },
  en: {
    title: "Private vault",
    subtitle: "Save private files, links, and notes here so you can retrieve them later.",
    sync: "Only what matters, always close at hand",
    search: "Search by name, category, or reference...",
    empty: "No private items yet",
    emptyHint:
      "When you save something sensitive, it will appear here so you can review it, search it, or delete it.",
    refresh: "Refresh",
    delete: "Delete",
    count: "records",
  },
  pt: {
    title: "Baú privado",
    subtitle: "Guarde aqui arquivos, links e notas privadas para usar depois sem perder tempo.",
    sync: "Só o sensível e o importante, sempre à mão",
    search: "Buscar por nome, categoria ou referência...",
    empty: "Ainda não há itens no baú",
    emptyHint: "Quando você guardar algo sensível, ele aparecerá aqui para revisar, buscar ou excluir.",
    refresh: "Atualizar",
    delete: "Excluir",
    count: "registros",
  },
  de: {
    title: "Privater Tresor",
    subtitle: "Speichern Sie hier private Dateien, Links und Notizen, um sie später schnell wiederzufinden.",
    sync: "Nur das Wichtige und Sensible, immer griffbereit",
    search: "Nach Name, Kategorie oder Referenz suchen...",
    empty: "Noch keine Einträge im Tresor",
    emptyHint: "Sobald Sie etwas Sensibles speichern, erscheint es hier zum Prüfen, Suchen oder Löschen.",
    refresh: "Aktualisieren",
    delete: "Löschen",
    count: "Einträge",
  },
  fr: {
    title: "Coffre privé",
    subtitle: "Gardez ici vos fichiers, liens et notes privées pour les retrouver quand vous en avez besoin.",
    sync: "Seulement le sensible et l'important, toujours à portée",
    search: "Rechercher par nom, catégorie ou référence...",
    empty: "Aucun élément dans le coffre pour l'instant",
    emptyHint:
      "Quand vous sauvegardez quelque chose de sensible, il apparaît ici pour le revoir, le chercher ou le supprimer.",
    refresh: "Actualiser",
    delete: "Supprimer",
    count: "éléments",
  },
  it: {
    title: "Caveau privato",
    subtitle: "Conserva qui file, link e note private per ritrovarli quando servono.",
    sync: "Solo ciò che è sensibile e importante, sempre disponibile",
    search: "Cerca per nome, categoria o riferimento...",
    empty: "Nessun elemento nel caveau",
    emptyHint: "Quando salvi qualcosa di sensibile, apparirà qui per rivederlo, cercarlo o eliminarlo.",
    refresh: "Aggiorna",
    delete: "Elimina",
    count: "record",
  },
}

const CATEGORY_OPTIONS = [
  "Receta médica",
  "Bancos",
  "Personal",
  "Familia",
  "Estudio",
  "Deudas",
  "Otros",
]

const KIND_OPTIONS = [
  { value: "note", label: "Nota privada" },
  { value: "link", label: "Link" },
  { value: "file", label: "Archivo" },
  { value: "document", label: "Documento" },
]

function inferVaultType(item: VaultRow) {
  return String(item.item_type || item.type || item.kind || "registro")
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

function inferVaultCategory(item: VaultRow) {
  return String(item.category || item.group_name || item.group || "Otros")
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(parsed)
}

function TypeIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase()
  if (normalized.includes("password") || normalized.includes("credential") || normalized.includes("secret")) {
    return <KeyRound className="h-4 w-4 text-[#7C3AED]" />
  }
  if (normalized.includes("link") || normalized.includes("url")) {
    return <Link2 className="h-4 w-4 text-[#3B82F6]" />
  }
  if (normalized.includes("file") || normalized.includes("document")) {
    return <FileKey2 className="h-4 w-4 text-[#10B981]" />
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
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [draft, setDraft] = useState({
    title: "",
    category: "Otros",
    kind: "note",
    detail: "",
  })

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

        const { data, error } = await supabase
          .from("private_vault_items")
          .select("id,client_id,title,name,label,reference_name,reference,key,url,link_url,username,notes,description,summary,storage_path,category,group_name,group,item_type,type,kind,source,status,created_at,updated_at")
          .eq("client_id", currentClientId)
          .order("created_at", { ascending: false })
          .limit(50)

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
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      [inferVaultTitle(item), inferVaultType(item), inferVaultCategory(item), inferVaultDetail(item)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [items, search])

  async function saveVaultItem() {
    if (!clientId || !draft.title.trim()) return
    setSaving(true)
    setSaveMessage("")

    const attempts = [
      {
        client_id: clientId,
        title: draft.title.trim(),
        item_type: draft.kind,
        category: draft.category,
        notes: draft.detail.trim() || null,
        source: "dashboard",
      },
      {
        client_id: clientId,
        title: draft.title.trim(),
        item_type: draft.kind,
        category: draft.category,
        notes: draft.detail.trim() || null,
      },
      {
        client_id: clientId,
        title: draft.title.trim(),
        type: draft.kind,
        category: draft.category,
        description: draft.detail.trim() || null,
      },
      {
        client_id: clientId,
        name: draft.title.trim(),
        type: draft.kind,
        category: draft.category,
        notes: draft.detail.trim() || null,
      },
    ]

    let lastError: any = null
    for (const payload of attempts) {
        const result = await supabase.from("private_vault_items").insert(payload).select("id,client_id,title,name,label,reference_name,reference,key,url,link_url,username,notes,description,summary,storage_path,category,group_name,group,item_type,type,kind,source,status,created_at,updated_at").single()
      if (!result.error) {
        setItems((prev) => [result.data as VaultRow, ...prev])
        setDraft({ title: "", category: "Otros", kind: "note", detail: "" })
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
            onClick={() => void load()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-[#0F1F63] hover:bg-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {copy.refresh}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Guarde con categoría</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recetas, bancos, familia, estudio, deudas u otros datos que quiera mantener protegidos.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Análisis cuando aplica</p>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF, Office y las imágenes JPG o PNG se preparan para resumen, consulta o seguimiento posterior.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E1EC] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Recuperación rápida</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Luego puede pedirlo desde WhatsApp o la web y Operaly lo ubica por referencia, categoría o contenido.
          </p>
        </div>
      </div>

      {saveMessage ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            saveMessage.toLowerCase().includes("no se pudo")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {saveMessage}
        </div>
      ) : null}

      {showCreate ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Nombre o referencia"
              className="h-10 rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
            />
            <select
              value={draft.category}
              onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
              className="h-10 rounded-xl border border-[#D9E1EC] bg-white px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={draft.kind}
              onChange={(event) => setDraft((prev) => ({ ...prev, kind: event.target.value }))}
              className="h-10 rounded-xl border border-[#D9E1EC] bg-white px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              value={draft.detail}
              onChange={(event) => setDraft((prev) => ({ ...prev, detail: event.target.value }))}
              placeholder="Dato, enlace o nota breve"
              className="h-10 rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none md:col-span-2 xl:col-span-1"
            />
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[#D9E1EC] bg-[#F8FAFC] px-4 py-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
            <p>
              Puede guardar cualquier formato. Los PDF, Office y las imágenes JPG o PNG quedan listos
              para análisis cuando corresponda.
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => void saveVaultItem()}
              disabled={saving || !draft.title.trim()}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-[#0F1F63] hover:bg-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}

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
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{errorMessage || copy.emptyHint}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const type = inferVaultType(item)
            const title = inferVaultTitle(item)
            const detail = inferVaultDetail(item)
            const category = inferVaultCategory(item)

            return (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F1F63]/5">
                      <TypeIcon type={type} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F1F63]">{title}</p>
                      <p className="mt-1 break-all text-sm text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDelete(item.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    {copy.delete}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Categoría</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F63]">{category}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Tipo de guardado</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F63]">{type}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Guardado</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F63]">{formatDate(item.created_at, locale)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
