"use client"

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import { Briefcase, Check, ChevronDown, ChevronRight, FileText, List, Pencil, Plus, RefreshCw, Save, ShoppingCart, Trash2, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { labelForLanguage, localeFromLanguage, resolveLanguageCode, type SupportedLanguage } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

type ListItem = { id: string; content: string; is_checked: boolean; position: number }
type ListRow = { id: string; title: string; list_type: string; status: string; created_at: string; items?: ListItem[]; expanded?: boolean }
type ChecklistItem = { id: string; content: string; is_checked: boolean; position: number }
type ChecklistRow = { id: string; title: string; status: string; created_at: string; items?: ChecklistItem[]; expanded?: boolean }
type Feedback = { type: "success" | "error"; message: string } | null

const TYPE_ICONS: Record<string, ComponentType<{ className?: string }>> = { shopping: ShoppingCart, project: Briefcase, personal: User, work: Briefcase, free: List }
const TYPE_LABELS: Record<string, string> = { shopping: "Compras", project: "Proyecto", personal: "Personal", work: "Trabajo", free: "Lista libre" }
const TYPE_COLORS: Record<string, string> = { shopping: "#F59E0B", project: "#7C3AED", personal: "#10B981", work: "#3B82F6", free: "#64748B" }

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    title: "Listas y checklists",
    subtitle: "Guarde compras, pendientes, pasos e indicaciones sin complicarse.",
    sync: "Todo lo que sí se guarde aquí debe volver a aparecerle en su cuenta y en Operaly",
    reminder: "Si algo lleva fecha, después puede convertirlo en recordatorio o agenda.",
    new: "Nueva",
    newList: "Nueva lista",
    newChecklist: "Nuevo checklist",
    create: "Crear",
    listPlaceholder: "Ej: Lista del mercado",
    checklistPlaceholder: "Ej: Pasos para la reunión",
    initialItems: "Escriba varios puntos separados por coma o por línea (opcional)",
    addItem: "Agregar punto",
    addChecklistItem: "Agregar paso",
    emptyLists: "Todavía no hay listas",
    emptyListsHint: "Úselas para compras, ideas rápidas o cosas por resolver.",
    emptyChecklists: "Todavía no hay checklists",
    emptyChecklistsHint: "Son útiles para procesos, pasos repetidos y controles rápidos.",
    listsTab: "Listas",
    checklistsTab: "Checklists",
    clearDone: "Quitar marcadas",
    listFallback: "Lista",
    savedOk: "Cambios guardados.",
    saveError: "No se pudo guardar todavía. Revise la conexión e intente de nuevo.",
  },
  en: { title: "Lists and checklists", subtitle: "Capture tasks, shopping, and ideas in a quick and simple format.", sync: "Saved to your account and also available for WhatsApp flows", reminder: "If you later add a date, Operaly can move it into your agenda.", new: "New", newList: "New list", newChecklist: "New checklist", create: "Create", listPlaceholder: "Example: Grocery list", checklistPlaceholder: "Example: Meeting steps", initialItems: "Write several points separated by commas or lines (optional)", addItem: "Add item", addChecklistItem: "Add step", emptyLists: "No lists yet", emptyListsHint: "Use them for shopping, quick ideas, or things to solve.", emptyChecklists: "No checklists yet", emptyChecklistsHint: "Useful for repeatable steps and quick controls.", listsTab: "Lists", checklistsTab: "Checklists", clearDone: "Remove checked", listFallback: "List", savedOk: "Changes saved.", saveError: "Could not save. Please try again." },
  pt: { title: "Listas e checklists", subtitle: "Anote pendências, compras e ideias de forma rápida e simples.", sync: "Salvo na sua conta e também disponível para o WhatsApp", reminder: "Se depois colocar data, a Operaly pode levar para a agenda.", new: "Nova", newList: "Nova lista", newChecklist: "Novo checklist", create: "Criar", listPlaceholder: "Ex.: Lista do mercado", checklistPlaceholder: "Ex.: Passos da reunião", initialItems: "Escreva vários pontos separados por vírgula ou linha (opcional)", addItem: "Adicionar ponto", addChecklistItem: "Adicionar passo", emptyLists: "Ainda não há listas", emptyListsHint: "Use para compras, ideias rápidas ou coisas para resolver.", emptyChecklists: "Ainda não há checklists", emptyChecklistsHint: "Úteis para processos e controles rápidos.", listsTab: "Listas", checklistsTab: "Checklists", clearDone: "Remover marcadas", listFallback: "Lista", savedOk: "Alterações salvas.", saveError: "Não foi possível salvar. Tente novamente." },
  de: { title: "Listen und Checklisten", subtitle: "Notiere Aufgaben, Einkäufe und Ideen schnell und einfach.", sync: "In deinem Konto gespeichert und auch für WhatsApp nutzbar", reminder: "Wenn du später ein Datum hinzufügst, kann Operaly es in die Agenda übernehmen.", new: "Neu", newList: "Neue Liste", newChecklist: "Neue Checkliste", create: "Erstellen", listPlaceholder: "Beispiel: Einkaufsliste", checklistPlaceholder: "Beispiel: Meeting-Schritte", initialItems: "Mehrere Punkte mit Komma oder Zeilen trennen (optional)", addItem: "Punkt hinzufügen", addChecklistItem: "Schritt hinzufügen", emptyLists: "Noch keine Listen", emptyListsHint: "Für Einkäufe, schnelle Ideen oder offene Punkte.", emptyChecklists: "Noch keine Checklisten", emptyChecklistsHint: "Praktisch für wiederholbare Schritte.", listsTab: "Listen", checklistsTab: "Checklisten", clearDone: "Erledigte entfernen", listFallback: "Liste", savedOk: "Änderungen gespeichert.", saveError: "Speichern nicht möglich. Bitte erneut versuchen." },
  fr: { title: "Listes et checklists", subtitle: "Note vos tâches, courses et idées dans un format simple et rapide.", sync: "Enregistré dans votre compte et aussi disponible pour WhatsApp", reminder: "Si vous ajoutez une date ensuite, Operaly peut l’envoyer dans l’agenda.", new: "Nouvelle", newList: "Nouvelle liste", newChecklist: "Nouvelle checklist", create: "Créer", listPlaceholder: "Ex. : Liste de courses", checklistPlaceholder: "Ex. : Étapes de réunion", initialItems: "Écrivez plusieurs points séparés par virgule ou ligne (optionnel)", addItem: "Ajouter un point", addChecklistItem: "Ajouter une étape", emptyLists: "Pas encore de listes", emptyListsHint: "Pour les courses, idées rapides ou choses à régler.", emptyChecklists: "Pas encore de checklists", emptyChecklistsHint: "Pratiques pour les étapes répétées.", listsTab: "Listes", checklistsTab: "Checklists", clearDone: "Retirer cochés", listFallback: "Liste", savedOk: "Modifications enregistrées.", saveError: "Impossible d’enregistrer. Réessayez." },
  it: { title: "Liste e checklist", subtitle: "Annoti attività, spesa e idee in modo rapido e semplice.", sync: "Salvato nel suo account e disponibile anche su WhatsApp", reminder: "Se dopo aggiunge una data, Operaly può portarlo in agenda.", new: "Nuova", newList: "Nuova lista", newChecklist: "Nuova checklist", create: "Crea", listPlaceholder: "Es.: Lista della spesa", checklistPlaceholder: "Es.: Passi della riunione", initialItems: "Scriva più punti separati da virgola o riga (opzionale)", addItem: "Aggiungi punto", addChecklistItem: "Aggiungi passaggio", emptyLists: "Ancora nessuna lista", emptyListsHint: "Per spesa, idee rapide o cose da chiudere.", emptyChecklists: "Ancora nessuna checklist", emptyChecklistsHint: "Utili per passaggi ripetuti.", listsTab: "Liste", checklistsTab: "Checklist", clearDone: "Rimuovi segnate", listFallback: "Lista", savedOk: "Modifiche salvate.", saveError: "Impossibile salvare. Riprovi." },
}

const parseInitialItems = (raw: string) => raw.split(/[\n,]/).map((content) => content.trim()).filter(Boolean)

export default function ListasPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [lists, setLists] = useState<ListRow[]>([])
  const [checklists, setChecklists] = useState<ChecklistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"listas" | "checklists">("listas")
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newType, setNewType] = useState("free")
  const [newItems, setNewItems] = useState("")
  const [creating, setCreating] = useState(false)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [addText, setAddText] = useState("")
  const [addingChecklistTo, setAddingChecklistTo] = useState<string | null>(null)
  const [checklistAddText, setChecklistAddText] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState("")
  const [language, setLanguage] = useState<SupportedLanguage>("es")
  const [timezone, setTimezone] = useState("America/Lima")
  const [locale, setLocale] = useState("es-PE")
  const [feedback, setFeedback] = useState<Feedback>(null)

  const copy = COPY[language]

  const showFeedback = useCallback((type: Feedback["type"], message: string) => {
    setFeedback({ type, message })
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 3500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  useEffect(() => {
    getCurrentClientId().then(setClientId).catch(console.error)
  }, [])

  const withSourceFallback = useCallback(async (table: "lists" | "checklists", payload: Record<string, unknown>) => {
    const firstAttempt = await supabase.from(table).insert(payload).select("id").single()
    if (!firstAttempt.error) return firstAttempt
    const fallbackPayload = { ...payload }
    delete fallbackPayload.source
    return supabase.from(table).insert(fallbackPayload).select("id").single()
  }, [])

  const loadAll = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const [{ data: lr, error: listsError }, { data: cr, error: checklistsError }, { data: profile }] = await Promise.all([
        supabase.from("lists").select("id,title,list_type,status,created_at").eq("client_id", clientId).eq("status", "active").order("created_at", { ascending: false }).limit(50),
        supabase.from("checklists").select("id,title,status,created_at").eq("client_id", clientId).eq("status", "active").order("created_at", { ascending: false }).limit(50),
        supabase.from("clients").select("preferred_language,language,timezone,timezone_auto").eq("id", clientId).maybeSingle(),
      ])
      if (listsError) throw listsError
      if (checklistsError) throw checklistsError
      const resolvedLanguage = resolveLanguageCode(profile?.preferred_language || profile?.language || "es")
      setLanguage(resolvedLanguage)
      setLocale(localeFromLanguage(resolvedLanguage))
      setTimezone(profile?.timezone_auto || profile?.timezone || "America/Lima")
      setLists((lr || []).map((row) => ({ ...row, expanded: false })))
      setChecklists((cr || []).map((row) => ({ ...row, expanded: false })))
    } catch (error) {
      console.error(error)
      showFeedback("error", COPY.es.saveError)
    } finally {
      setLoading(false)
    }
  }, [clientId, showFeedback])

  useEffect(() => {
    if (clientId) void loadAll()
  }, [clientId, loadAll])

  useEffect(() => {
    if (!clientId) return
    const ch = supabase.channel(`lists-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lists", filter: `client_id=eq.${clientId}` }, () => void loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "checklists", filter: `client_id=eq.${clientId}` }, () => void loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "list_items", filter: `client_id=eq.${clientId}` }, (payload) => {
        const listId = (payload.new as { list_id?: string } | null)?.list_id || (payload.old as { list_id?: string } | null)?.list_id
        if (listId) setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items: undefined } : row))
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "checklist_items", filter: `client_id=eq.${clientId}` }, (payload) => {
        const checklistId = (payload.new as { checklist_id?: string } | null)?.checklist_id || (payload.old as { checklist_id?: string } | null)?.checklist_id
        if (checklistId) setChecklists((prev) => prev.map((row) => row.id === checklistId ? { ...row, items: undefined } : row))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId, loadAll])

  const loadItems = async (id: string) => ((await supabase.from("list_items").select("id,content,is_checked,position").eq("list_id", id).order("position")).data as ListItem[]) || []
  const loadChecklistItems = async (id: string) => ((await supabase.from("checklist_items").select("id,content,is_checked,position").eq("checklist_id", id).order("position")).data as ChecklistItem[]) || []

  const topSummary = useMemo(() => ({
    totalItems: lists.reduce((acc, row) => acc + (row.items?.length || 0), 0),
    totalChecks: checklists.reduce((acc, row) => acc + (row.items?.length || 0), 0),
  }), [lists, checklists])

  const toggleList = async (id: string) => {
    const row = lists.find((item) => item.id === id)
    if (!row) return
    if (!row.expanded && !row.items) {
      const items = await loadItems(id)
      setLists((prev) => prev.map((item) => item.id === id ? { ...item, expanded: true, items } : item))
      return
    }
    setLists((prev) => prev.map((item) => item.id === id ? { ...item, expanded: !item.expanded } : item))
  }

  const toggleChecklist = async (id: string) => {
    const row = checklists.find((item) => item.id === id)
    if (!row) return
    if (!row.expanded && !row.items) {
      const items = await loadChecklistItems(id)
      setChecklists((prev) => prev.map((item) => item.id === id ? { ...item, expanded: true, items } : item))
      return
    }
    setChecklists((prev) => prev.map((item) => item.id === id ? { ...item, expanded: !item.expanded } : item))
  }

  const toggleItem = async (itemId: string, checked: boolean, listId: string) => {
    const { error } = await supabase.from("list_items").update({ is_checked: !checked }).eq("id", itemId)
    if (error) return showFeedback("error", copy.saveError)
    setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items: row.items?.map((item) => item.id === itemId ? { ...item, is_checked: !checked } : item) } : row))
  }

  const toggleChecklistItem = async (itemId: string, checked: boolean, checklistId: string) => {
    const { error } = await supabase.from("checklist_items").update({ is_checked: !checked }).eq("id", itemId)
    if (error) return showFeedback("error", copy.saveError)
    setChecklists((prev) => prev.map((row) => row.id === checklistId ? { ...row, items: row.items?.map((item) => item.id === itemId ? { ...item, is_checked: !checked } : item) } : row))
  }

  const addItem = async (listId: string) => {
    if (!addText.trim() || !clientId) return
    const position = lists.find((row) => row.id === listId)?.items?.length || 0
    const { error } = await supabase.from("list_items").insert({ list_id: listId, client_id: clientId, content: addText.trim(), position })
    if (error) return showFeedback("error", copy.saveError)
    const items = await loadItems(listId)
    setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items } : row))
    setAddText("")
    setAddingTo(null)
    showFeedback("success", copy.savedOk)
  }

  const addChecklistItem = async (checklistId: string) => {
    if (!checklistAddText.trim() || !clientId) return
    const position = checklists.find((row) => row.id === checklistId)?.items?.length || 0
    const { error } = await supabase.from("checklist_items").insert({ checklist_id: checklistId, client_id: clientId, content: checklistAddText.trim(), position })
    if (error) return showFeedback("error", copy.saveError)
    const items = await loadChecklistItems(checklistId)
    setChecklists((prev) => prev.map((row) => row.id === checklistId ? { ...row, items } : row))
    setChecklistAddText("")
    setAddingChecklistTo(null)
    showFeedback("success", copy.savedOk)
  }

  const clearChecked = async (listId: string) => {
    const ids = lists.find((row) => row.id === listId)?.items?.filter((item) => item.is_checked).map((item) => item.id) || []
    if (!ids.length) return
    const { error } = await supabase.from("list_items").delete().in("id", ids)
    if (error) return showFeedback("error", copy.saveError)
    setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items: row.items?.filter((item) => !item.is_checked) } : row))
    showFeedback("success", copy.savedOk)
  }

  const archiveRow = async (table: "lists" | "checklists", id: string) => {
    const { error } = await supabase.from(table).update({ status: "archived" }).eq("id", id)
    if (error) return showFeedback("error", copy.saveError)
    await loadAll()
    showFeedback("success", copy.savedOk)
  }

  const createNew = async () => {
    if (!clientId || !newTitle.trim()) return
    setCreating(true)
    try {
      if (tab === "listas") {
        const { data, error } = await withSourceFallback("lists", { client_id: clientId, title: newTitle.trim(), list_type: newType, status: "active", source: "dashboard" })
        if (error) throw error
        const parsedItems = parseInitialItems(newItems)
        if (data && parsedItems.length) {
          const rows = parsedItems.map((content, index) => ({ list_id: data.id, client_id: clientId, content, position: index }))
          const { error: itemsError } = await supabase.from("list_items").insert(rows)
          if (itemsError) throw itemsError
        }
      } else {
        const { data, error } = await withSourceFallback("checklists", { client_id: clientId, title: newTitle.trim(), status: "active", source: "dashboard" })
        if (error) throw error
        const parsedItems = parseInitialItems(newItems)
        if (data && parsedItems.length) {
          const rows = parsedItems.map((content, index) => ({ checklist_id: data.id, client_id: clientId, content, position: index }))
          const { error: itemsError } = await supabase.from("checklist_items").insert(rows)
          if (itemsError) throw itemsError
        }
      }
      setNewTitle("")
      setNewItems("")
      setShowNew(false)
      await loadAll()
      showFeedback("success", copy.savedOk)
    } catch (error) {
      console.error(error)
      showFeedback("error", copy.saveError)
    } finally {
      setCreating(false)
    }
  }

  const saveTitle = async (id: string) => {
    if (!editVal.trim()) return
    const { error } = await supabase.from("lists").update({ title: editVal.trim() }).eq("id", id)
    if (error) return showFeedback("error", copy.saveError)
    setLists((prev) => prev.map((row) => row.id === id ? { ...row, title: editVal.trim() } : row))
    setEditId(null)
    showFeedback("success", copy.savedOk)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><RefreshCw className="h-5 w-5 animate-spin text-[#3B82F6]" /></div>

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">{copy.sync} · {labelForLanguage(language)} · {locale} · {timezone}</p>
          <p className="mt-1 text-xs text-[#5F6B7A]">{copy.reminder}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadAll()} className="rounded-xl"><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setShowNew((prev) => !prev)} className="rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB]"><Plus className="mr-1.5 h-4 w-4" />{copy.new}</Button>
        </div>
      </div>

      {feedback ? <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{feedback.message}</div> : null}

      <div className="rounded-2xl border border-[#0F1F63]/10 bg-gradient-to-r from-[#0F1F63]/5 via-white to-[#3B82F6]/5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#0F1F63]">Úselo para lo rápido</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Compras, pendientes, ideas, pasos, controles o cualquier cosa que quiera tener a mano.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#0F1F63]">Después puede crecer</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Si algo termina teniendo fecha, pago o seguimiento, Operaly luego podrá llevarlo a agenda o automatizaciones.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#0F1F63]">Si es sensible</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Para documentos privados, credenciales o temas delicados conviene usar también el baúl privado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{copy.listsTab}</p><p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{lists.length}</p><p className="mt-1 text-xs text-slate-600">Listas activas para resolver hoy o después.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{copy.checklistsTab}</p><p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{checklists.length}</p><p className="mt-1 text-xs text-slate-600">Pasos o controles que quiere repetir sin olvidar nada.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Contenido</p><p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{topSummary.totalItems + topSummary.totalChecks}</p><p className="mt-1 text-xs text-slate-600">Puntos guardados entre listas y checklists.</p></div>
      </div>

      {showNew ? (
        <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">{tab === "listas" ? copy.newList : copy.newChecklist}</p>
          <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={tab === "listas" ? copy.listPlaceholder : copy.checklistPlaceholder} className="rounded-xl" onKeyDown={(event) => event.key === "Enter" && void createNew()} />
          {tab === "listas" ? <select value={newType} onChange={(event) => setNewType(event.target.value)} className="h-10 w-full rounded-xl border border-[#D9E1EC] bg-white px-3 text-sm">{Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : null}
          <textarea value={newItems} onChange={(event) => setNewItems(event.target.value)} placeholder={copy.initialItems} rows={3} className="w-full resize-none rounded-xl border border-[#D9E1EC] px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none" />
          <div className="flex gap-2">
            <Button onClick={() => void createNew()} disabled={creating || !newTitle.trim()} className="flex-1 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB]">{creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : copy.create}</Button>
            <Button variant="outline" onClick={() => setShowNew(false)} className="rounded-xl"><X className="h-4 w-4" /></Button>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">{(["listas", "checklists"] as const).map((value) => <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === value ? "bg-[#3B82F6] text-white" : "border border-[#E2E8F0] bg-white text-[#5F6B7A] hover:bg-[#F7F9FC]"}`}>{value === "listas" ? `${copy.listsTab} (${lists.length})` : `${copy.checklistsTab} (${checklists.length})`}</button>)}</div>

      {tab === "listas" ? <ListPanel copy={copy} lists={lists} toggleList={toggleList} toggleItem={toggleItem} addingTo={addingTo} setAddingTo={setAddingTo} addText={addText} setAddText={setAddText} addItem={addItem} clearChecked={clearChecked} archiveRow={archiveRow} editId={editId} setEditId={setEditId} editVal={editVal} setEditVal={setEditVal} saveTitle={saveTitle} /> : <ChecklistPanel copy={copy} checklists={checklists} toggleChecklist={toggleChecklist} toggleChecklistItem={toggleChecklistItem} addingChecklistTo={addingChecklistTo} setAddingChecklistTo={setAddingChecklistTo} checklistAddText={checklistAddText} setChecklistAddText={setChecklistAddText} addChecklistItem={addChecklistItem} archiveRow={archiveRow} />}
    </div>
  )
}

function ListPanel({ copy, lists, toggleList, toggleItem, addingTo, setAddingTo, addText, setAddText, addItem, clearChecked, archiveRow, editId, setEditId, editVal, setEditVal, saveTitle }: any) {
  if (lists.length === 0) return <div className="rounded-2xl border border-dashed border-[#D9E1EC] py-14 text-center text-muted-foreground"><List className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">{copy.emptyLists}</p><p className="mt-1 text-sm">{copy.emptyListsHint}</p></div>
  return <div className="space-y-3">{lists.map((row: ListRow) => { const Icon = TYPE_ICONS[row.list_type] || List; const color = TYPE_COLORS[row.list_type] || "#64748B"; const checked = row.items?.filter((item) => item.is_checked).length ?? 0; const total = row.items?.length ?? 0; return <div key={row.id} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"><div className="flex items-center gap-3 p-4"><button onClick={() => void toggleList(row.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}><Icon className="h-5 w-5" style={{ color }} /></div><div className="min-w-0 flex-1">{editId === row.id ? <div className="flex gap-1.5" onClick={(event) => event.stopPropagation()}><Input value={editVal} onChange={(event) => setEditVal(event.target.value)} className="h-7 rounded-lg text-sm" autoFocus onKeyDown={(event) => { if (event.key === "Enter") void saveTitle(row.id); if (event.key === "Escape") setEditId(null) }} /><button onClick={() => void saveTitle(row.id)} className="text-[#3B82F6]"><Save className="h-4 w-4" /></button></div> : <p className="truncate font-semibold text-[#0F1F63]">{row.title}</p>}<p className="text-xs text-muted-foreground">{TYPE_LABELS[row.list_type] || copy.listFallback}{total > 0 ? ` · ${checked}/${total}` : ""}</p>{total > 0 ? <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0]"><div className="h-full rounded-full" style={{ width: `${Math.round((checked / total) * 100)}%`, backgroundColor: color }} /></div> : null}</div></button><div className="flex shrink-0 items-center gap-1"><button onClick={() => { setEditId(row.id); setEditVal(row.title) }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F1F5F9] hover:text-[#3B82F6]"><Pencil className="h-3.5 w-3.5" /></button>{checked > 0 ? <button onClick={() => void clearChecked(row.id)} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-[#FFF7ED] hover:text-[#F59E0B]">{copy.clearDone}</button> : null}<button onClick={() => void archiveRow("lists", row.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>{row.expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</div></div>{row.expanded ? <div className="border-t border-[#F1F5F9]">{!row.items ? <div className="p-4 text-center"><RefreshCw className="mx-auto h-4 w-4 animate-spin text-muted-foreground" /></div> : <>{row.items.map((item) => <div key={item.id} className={`flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-2.5 last:border-0 hover:bg-[#F8FAFC] ${item.is_checked ? "opacity-55" : ""}`}><button onClick={() => void toggleItem(item.id, item.is_checked, row.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all" style={item.is_checked ? { backgroundColor: color, borderColor: color } : { borderColor: "#D9E1EC" }}>{item.is_checked ? <Check className="h-3 w-3 text-white" /> : null}</button><span className={`flex-1 text-sm ${item.is_checked ? "text-muted-foreground line-through" : "text-[#1D2A3B]"}`}>{item.content}</span></div>)}{addingTo === row.id ? <div className="flex gap-2 border-t border-[#F1F5F9] p-3"><Input value={addText} onChange={(event) => setAddText(event.target.value)} placeholder={copy.addItem} className="h-8 rounded-xl text-sm" autoFocus onKeyDown={(event) => { if (event.key === "Enter") void addItem(row.id); if (event.key === "Escape") setAddingTo(null) }} /><Button size="sm" onClick={() => void addItem(row.id)} className="h-8 rounded-xl bg-[#3B82F6] px-3 text-xs text-white hover:bg-[#2563EB]">OK</Button><Button size="sm" variant="ghost" onClick={() => setAddingTo(null)} className="h-8 rounded-xl px-2"><X className="h-3 w-3" /></Button></div> : <button onClick={() => { setAddingTo(row.id); setAddText("") }} className="flex w-full items-center gap-2 border-t border-[#F1F5F9] px-4 py-2.5 text-sm text-muted-foreground hover:bg-[#F8FAFC]"><Plus className="h-4 w-4" />{copy.addItem}</button>}</>}</div> : null}</div> })}</div>
}

function ChecklistPanel({ copy, checklists, toggleChecklist, toggleChecklistItem, addingChecklistTo, setAddingChecklistTo, checklistAddText, setChecklistAddText, addChecklistItem, archiveRow }: any) {
  if (checklists.length === 0) return <div className="rounded-2xl border border-dashed border-[#D9E1EC] py-14 text-center text-muted-foreground"><FileText className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">{copy.emptyChecklists}</p><p className="mt-1 text-sm">{copy.emptyChecklistsHint}</p></div>
  return <div className="space-y-3">{checklists.map((row: ChecklistRow) => { const checked = row.items?.filter((item) => item.is_checked).length ?? 0; const total = row.items?.length ?? 0; const done = total > 0 && checked === total; return <div key={row.id} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"><div className="flex items-center gap-3 p-4"><button onClick={() => void toggleChecklist(row.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? "bg-[#DCFCE7]" : "bg-[#F0FDF4]"}`}><Check className={`h-5 w-5 ${done ? "text-[#16A34A]" : "text-[#10B981]"}`} /></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#0F1F63]">{row.title}</p>{total > 0 ? <div className="mt-1 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]"><div className="h-full rounded-full bg-[#10B981]" style={{ width: `${Math.round((checked / total) * 100)}%` }} /></div><span className="text-xs text-muted-foreground">{checked}/{total}</span></div> : null}</div></button><button onClick={() => void archiveRow("checklists", row.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>{row.expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</div>{row.expanded ? <div className="border-t border-[#F1F5F9]">{!row.items ? <div className="p-4 text-center"><RefreshCw className="mx-auto h-4 w-4 animate-spin text-muted-foreground" /></div> : <>{row.items.map((item, index) => <div key={item.id} className={`flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-3 last:border-0 hover:bg-[#F8FAFC] ${item.is_checked ? "opacity-55" : ""}`}><button onClick={() => void toggleChecklistItem(item.id, item.is_checked, row.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${item.is_checked ? "border-[#10B981] bg-[#10B981]" : "border-[#D9E1EC] hover:border-[#10B981]"}`}>{item.is_checked ? <Check className="h-3 w-3 text-white" /> : null}</button><span className={`flex-1 text-sm ${item.is_checked ? "text-muted-foreground line-through" : "text-[#1D2A3B]"}`}><span className="mr-1.5 text-xs text-muted-foreground">{index + 1}.</span>{item.content}</span></div>)}{addingChecklistTo === row.id ? <div className="flex gap-2 border-t border-[#F1F5F9] p-3"><Input value={checklistAddText} onChange={(event) => setChecklistAddText(event.target.value)} placeholder={copy.addChecklistItem} className="h-8 rounded-xl text-sm" autoFocus onKeyDown={(event) => { if (event.key === "Enter") void addChecklistItem(row.id); if (event.key === "Escape") setAddingChecklistTo(null) }} /><Button size="sm" onClick={() => void addChecklistItem(row.id)} className="h-8 rounded-xl bg-[#10B981] px-3 text-xs text-white hover:bg-[#0f9c6f]">OK</Button><Button size="sm" variant="ghost" onClick={() => setAddingChecklistTo(null)} className="h-8 rounded-xl px-2"><X className="h-3 w-3" /></Button></div> : <button onClick={() => { setAddingChecklistTo(row.id); setChecklistAddText("") }} className="flex w-full items-center gap-2 border-t border-[#F1F5F9] px-4 py-2.5 text-sm text-muted-foreground hover:bg-[#F8FAFC]"><Plus className="h-4 w-4" />{copy.addChecklistItem}</button>}</>}</div> : null}</div> })}</div>
}
