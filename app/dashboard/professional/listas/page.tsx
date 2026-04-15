"use client"

import { useCallback, useEffect, useState, type ComponentType } from "react"
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

const TYPE_ICONS: Record<string, ComponentType<{ className?: string }>> = { shopping: ShoppingCart, project: Briefcase, personal: User, work: Briefcase, free: List }
const TYPE_LABELS: Record<string, string> = { shopping: "Compras", project: "Proyecto", personal: "Personal", work: "Trabajo", free: "Lista libre" }
const TYPE_COLORS: Record<string, string> = { shopping: "#F59E0B", project: "#7C3AED", personal: "#10B981", work: "#3B82F6", free: "#64748B" }

const COPY: Record<SupportedLanguage, Record<string, string>> = {
  es: { title: "Listas y checklists", subtitle: "Controla pendientes, compras e ideas sin perder continuidad con WhatsApp.", sync: "Sincronizado con Supabase y WhatsApp", reminder: "Si una lista termina teniendo fecha, Operaly puede llevarla a agenda con recordatorio por defecto de 10 min.", new: "Nueva", newList: "Nueva lista", newChecklist: "Nuevo checklist", create: "Crear", listPlaceholder: "Ej: Lista del mercado", checklistPlaceholder: "Ej: Pasos para la reunión", initialItems: "Ítems iniciales separados por coma o salto de línea (opcional)", addItem: "Agregar ítem", addChecklistItem: "Agregar paso", emptyLists: "Sin listas activas", emptyListsHint: "Úsalas para compras, ideas rápidas, pendientes y seguimiento operativo.", emptyChecklists: "Sin checklists activos", emptyChecklistsHint: "Perfectos para pasos repetibles, procesos y controles rápidos.", listsTab: "Listas", checklistsTab: "Checklists", clearDone: "Limpiar hechas", listFallback: "Lista" },
  en: { title: "Lists and checklists", subtitle: "Manage shopping, loose tasks, and ideas without breaking continuity with WhatsApp.", sync: "Synced with Supabase and WhatsApp", reminder: "If a list gets a date later, Operaly can move it into agenda with the default 10-minute reminder.", new: "New", newList: "New list", newChecklist: "New checklist", create: "Create", listPlaceholder: "Example: Grocery list", checklistPlaceholder: "Example: Meeting steps", initialItems: "Initial items separated by commas or line breaks (optional)", addItem: "Add item", addChecklistItem: "Add step", emptyLists: "No active lists", emptyListsHint: "Use them for shopping, quick ideas, loose tasks, and follow-up.", emptyChecklists: "No active checklists", emptyChecklistsHint: "Great for repeatable steps, processes, and quick controls.", listsTab: "Lists", checklistsTab: "Checklists", clearDone: "Clear done", listFallback: "List" },
  pt: { title: "Listas e checklists", subtitle: "Gerencie compras, pendências e ideias sem quebrar a continuidade com o WhatsApp.", sync: "Sincronizado com Supabase e WhatsApp", reminder: "Se uma lista ganhar data depois, a Operaly pode levá-la para a agenda com lembrete padrão de 10 min.", new: "Nova", newList: "Nova lista", newChecklist: "Novo checklist", create: "Criar", listPlaceholder: "Ex.: Lista do mercado", checklistPlaceholder: "Ex.: Passos da reunião", initialItems: "Itens iniciais separados por vírgula ou quebra de linha (opcional)", addItem: "Adicionar item", addChecklistItem: "Adicionar passo", emptyLists: "Sem listas ativas", emptyListsHint: "Use para compras, ideias rápidas, pendências e acompanhamento.", emptyChecklists: "Sem checklists ativos", emptyChecklistsHint: "Ótimos para passos repetíveis, processos e controles rápidos.", listsTab: "Listas", checklistsTab: "Checklists", clearDone: "Limpar feitas", listFallback: "Lista" },
  de: { title: "Listen und Checklisten", subtitle: "Verwalte Einkäufe, lose Aufgaben und Ideen ohne Bruch mit WhatsApp.", sync: "Mit Supabase und WhatsApp synchronisiert", reminder: "Wenn eine Liste später ein Datum bekommt, kann Operaly sie mit dem Standard-Reminder von 10 Min. in die Agenda verschieben.", new: "Neu", newList: "Neue Liste", newChecklist: "Neue Checkliste", create: "Erstellen", listPlaceholder: "Beispiel: Einkaufsliste", checklistPlaceholder: "Beispiel: Meeting-Schritte", initialItems: "Anfangseinträge durch Komma oder Zeilenumbruch getrennt (optional)", addItem: "Eintrag hinzufügen", addChecklistItem: "Schritt hinzufügen", emptyLists: "Keine aktiven Listen", emptyListsHint: "Für Einkäufe, schnelle Ideen, lose Aufgaben und Follow-up.", emptyChecklists: "Keine aktiven Checklisten", emptyChecklistsHint: "Perfekt für wiederholbare Schritte, Prozesse und schnelle Kontrollen.", listsTab: "Listen", checklistsTab: "Checklisten", clearDone: "Erledigte löschen", listFallback: "Liste" },
  fr: { title: "Listes et checklists", subtitle: "Gère courses, idées et tâches sans casser la continuité avec WhatsApp.", sync: "Synchronisé avec Supabase et WhatsApp", reminder: "Si une liste reçoit une date ensuite, Operaly peut la passer dans l’agenda avec rappel par défaut de 10 min.", new: "Nouvelle", newList: "Nouvelle liste", newChecklist: "Nouvelle checklist", create: "Créer", listPlaceholder: "Ex. : Liste des courses", checklistPlaceholder: "Ex. : Étapes de réunion", initialItems: "Éléments initiaux séparés par des virgules ou sauts de ligne (optionnel)", addItem: "Ajouter un élément", addChecklistItem: "Ajouter une étape", emptyLists: "Aucune liste active", emptyListsHint: "Pour courses, idées rapides, tâches libres et suivi.", emptyChecklists: "Aucune checklist active", emptyChecklistsHint: "Parfait pour les étapes répétables, processus et contrôles rapides.", listsTab: "Listes", checklistsTab: "Checklists", clearDone: "Effacer faits", listFallback: "Liste" },
  it: { title: "Liste e checklist", subtitle: "Gestisci spesa, idee e attività senza perdere continuità con WhatsApp.", sync: "Sincronizzato con Supabase e WhatsApp", reminder: "Se una lista riceve una data dopo, Operaly può spostarla in agenda con promemoria predefinito di 10 min.", new: "Nuova", newList: "Nuova lista", newChecklist: "Nuova checklist", create: "Crea", listPlaceholder: "Es.: Lista della spesa", checklistPlaceholder: "Es.: Passi della riunione", initialItems: "Elementi iniziali separati da virgola o a capo (opzionale)", addItem: "Aggiungi voce", addChecklistItem: "Aggiungi passaggio", emptyLists: "Nessuna lista attiva", emptyListsHint: "Per spesa, idee rapide, attività libere e follow-up.", emptyChecklists: "Nessuna checklist attiva", emptyChecklistsHint: "Perfette per passaggi ripetibili, processi e controlli rapidi.", listsTab: "Liste", checklistsTab: "Checklist", clearDone: "Pulisci fatte", listFallback: "Lista" },
}

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

  const copy = COPY[language]

  useEffect(() => { getCurrentClientId().then(setClientId).catch(console.error) }, [])

  const loadAll = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    const [{ data: lr }, { data: cr }, { data: profile }] = await Promise.all([
      supabase.from("lists").select("id,title,list_type,status,created_at").eq("client_id", clientId).eq("status", "active").order("created_at", { ascending: false }).limit(50),
      supabase.from("checklists").select("id,title,status,created_at").eq("client_id", clientId).eq("status", "active").order("created_at", { ascending: false }).limit(50),
      supabase.from("clients").select("preferred_language,language,timezone,timezone_auto").eq("id", clientId).maybeSingle(),
    ])
    const resolvedLanguage = resolveLanguageCode(profile?.preferred_language || profile?.language || "es")
    setLanguage(resolvedLanguage)
    setLocale(localeFromLanguage(resolvedLanguage))
    setTimezone(profile?.timezone_auto || profile?.timezone || "America/Lima")
    setLists((lr || []).map((row) => ({ ...row, expanded: false })))
    setChecklists((cr || []).map((row) => ({ ...row, expanded: false })))
    setLoading(false)
  }, [clientId])

  useEffect(() => { if (clientId) loadAll() }, [clientId, loadAll])

  useEffect(() => {
    if (!clientId) return
    const ch = supabase.channel(`lists-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lists", filter: `client_id=eq.${clientId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "checklists", filter: `client_id=eq.${clientId}` }, () => loadAll())
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
    await supabase.from("list_items").update({ is_checked: !checked }).eq("id", itemId)
    setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items: row.items?.map((item) => item.id === itemId ? { ...item, is_checked: !checked } : item) } : row))
  }

  const toggleChecklistItem = async (itemId: string, checked: boolean, checklistId: string) => {
    await supabase.from("checklist_items").update({ is_checked: !checked }).eq("id", itemId)
    setChecklists((prev) => prev.map((row) => row.id === checklistId ? { ...row, items: row.items?.map((item) => item.id === itemId ? { ...item, is_checked: !checked } : item) } : row))
  }

  const addItem = async (listId: string) => {
    if (!addText.trim() || !clientId) return
    const position = lists.find((row) => row.id === listId)?.items?.length || 0
    await supabase.from("list_items").insert({ list_id: listId, client_id: clientId, content: addText.trim(), position })
    const items = await loadItems(listId)
    setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items } : row))
    setAddText("")
    setAddingTo(null)
  }

  const addChecklistItem = async (checklistId: string) => {
    if (!checklistAddText.trim() || !clientId) return
    const position = checklists.find((row) => row.id === checklistId)?.items?.length || 0
    await supabase.from("checklist_items").insert({ checklist_id: checklistId, client_id: clientId, content: checklistAddText.trim(), position })
    const items = await loadChecklistItems(checklistId)
    setChecklists((prev) => prev.map((row) => row.id === checklistId ? { ...row, items } : row))
    setChecklistAddText("")
    setAddingChecklistTo(null)
  }

  const clearChecked = async (listId: string) => {
    const ids = lists.find((row) => row.id === listId)?.items?.filter((item) => item.is_checked).map((item) => item.id) || []
    if (!ids.length) return
    await supabase.from("list_items").delete().in("id", ids)
    setLists((prev) => prev.map((row) => row.id === listId ? { ...row, items: row.items?.filter((item) => !item.is_checked) } : row))
  }

  const createNew = async () => {
    if (!clientId || !newTitle.trim()) return
    setCreating(true)
    try {
      if (tab === "listas") {
        const { data } = await supabase.from("lists").insert({ client_id: clientId, title: newTitle.trim(), list_type: newType, status: "active", source: "dashboard" }).select("id").single()
        if (data && newItems.trim()) {
          const rows = newItems.split(/[\n,]/).map((content, index) => ({ list_id: data.id, client_id: clientId, content: content.trim(), position: index })).filter((row) => row.content)
          if (rows.length) await supabase.from("list_items").insert(rows)
        }
      } else {
        await supabase.from("checklists").insert({ client_id: clientId, title: newTitle.trim(), status: "active", source: "dashboard" })
      }
      setNewTitle("")
      setNewItems("")
      setShowNew(false)
      await loadAll()
    } finally {
      setCreating(false)
    }
  }

  const saveTitle = async (id: string) => {
    if (!editVal.trim()) return
    await supabase.from("lists").update({ title: editVal.trim() }).eq("id", id)
    setLists((prev) => prev.map((row) => row.id === id ? { ...row, title: editVal.trim() } : row))
    setEditId(null)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-5 h-5 animate-spin text-[#3B82F6]" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
          <p className="text-xs text-muted-foreground mt-1">{copy.sync} · {labelForLanguage(language)} · {locale} · {timezone}</p>
          <p className="text-xs text-[#5F6B7A] mt-1">{copy.reminder}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} className="rounded-xl"><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowNew((prev) => !prev)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"><Plus className="w-4 h-4 mr-1.5" />{copy.new}</Button>
        </div>
      </div>

      {showNew && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-[#0F1F63]">{tab === "listas" ? copy.newList : copy.newChecklist}</p>
          <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={tab === "listas" ? copy.listPlaceholder : copy.checklistPlaceholder} className="rounded-xl" onKeyDown={(event) => event.key === "Enter" && createNew()} />
          {tab === "listas" && (
            <>
              <select value={newType} onChange={(event) => setNewType(event.target.value)} className="w-full h-10 px-3 rounded-xl border border-[#D9E1EC] text-sm bg-white">
                {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <textarea value={newItems} onChange={(event) => setNewItems(event.target.value)} placeholder={copy.initialItems} rows={3} className="w-full px-3 py-2 rounded-xl border border-[#D9E1EC] text-sm resize-none focus:outline-none focus:border-[#3B82F6]" />
            </>
          )}
          <div className="flex gap-2">
            <Button onClick={createNew} disabled={creating || !newTitle.trim()} className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl">{creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : copy.create}</Button>
            <Button variant="outline" onClick={() => setShowNew(false)} className="rounded-xl"><X className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["listas", "checklists"] as const).map((value) => (
          <button key={value} onClick={() => setTab(value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === value ? "bg-[#3B82F6] text-white" : "bg-white border border-[#E2E8F0] text-[#5F6B7A] hover:bg-[#F7F9FC]"}`}>
            {value === "listas" ? `${copy.listsTab} (${lists.length})` : `${copy.checklistsTab} (${checklists.length})`}
          </button>
        ))}
      </div>

      {tab === "listas" && (
        <div className="space-y-3">
          {lists.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[#D9E1EC] rounded-2xl text-muted-foreground">
              <List className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">{copy.emptyLists}</p>
              <p className="text-sm mt-1">{copy.emptyListsHint}</p>
            </div>
          ) : lists.map((row) => {
            const Icon = TYPE_ICONS[row.list_type] || List
            const color = TYPE_COLORS[row.list_type] || "#64748B"
            const checked = row.items?.filter((item) => item.is_checked).length ?? 0
            const total = row.items?.length ?? 0
            return (
              <div key={row.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleList(row.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}><Icon className="w-5 h-5" style={{ color }} /></div>
                    <div className="flex-1 min-w-0">
                      {editId === row.id ? (
                        <div className="flex gap-1.5" onClick={(event) => event.stopPropagation()}>
                          <Input value={editVal} onChange={(event) => setEditVal(event.target.value)} className="h-7 text-sm rounded-lg" autoFocus onKeyDown={(event) => { if (event.key === "Enter") saveTitle(row.id); if (event.key === "Escape") setEditId(null) }} />
                          <button onClick={() => saveTitle(row.id)} className="text-[#3B82F6]"><Save className="w-4 h-4" /></button>
                        </div>
                      ) : <p className="font-semibold text-[#0F1F63] truncate">{row.title}</p>}
                      <p className="text-xs text-muted-foreground">{TYPE_LABELS[row.list_type] || copy.listFallback}{total > 0 && ` · ${checked}/${total}`}</p>
                      {total > 0 && <div className="mt-1 h-1 w-full bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.round((checked / total) * 100)}%`, backgroundColor: color }} /></div>}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditId(row.id); setEditVal(row.title) }} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-muted-foreground hover:text-[#3B82F6]"><Pencil className="w-3.5 h-3.5" /></button>
                    {checked > 0 && <button onClick={() => clearChecked(row.id)} className="px-2 py-1 rounded-lg hover:bg-[#FFF7ED] text-xs text-muted-foreground hover:text-[#F59E0B]">{copy.clearDone}</button>}
                    <button onClick={() => supabase.from("lists").update({ status: "archived" }).eq("id", row.id).then(loadAll)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    {row.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                {row.expanded && (
                  <div className="border-t border-[#F1F5F9]">
                    {!row.items ? <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div> : (
                      <>
                        {row.items.map((item) => (
                          <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0 transition-colors ${item.is_checked ? "opacity-55" : ""}`}>
                            <button onClick={() => toggleItem(item.id, item.is_checked, row.id)} className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all" style={item.is_checked ? { backgroundColor: color, borderColor: color } : { borderColor: "#D9E1EC" }}>{item.is_checked && <Check className="w-3 h-3 text-white" />}</button>
                            <span className={`text-sm flex-1 ${item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"}`}>{item.content}</span>
                          </div>
                        ))}
                        {addingTo === row.id ? (
                          <div className="flex gap-2 p-3 border-t border-[#F1F5F9]">
                            <Input value={addText} onChange={(event) => setAddText(event.target.value)} placeholder={copy.addItem} className="rounded-xl h-8 text-sm" autoFocus onKeyDown={(event) => { if (event.key === "Enter") addItem(row.id); if (event.key === "Escape") setAddingTo(null) }} />
                            <Button size="sm" onClick={() => addItem(row.id)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl h-8 text-xs px-3">OK</Button>
                            <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)} className="h-8 rounded-xl px-2"><X className="w-3 h-3" /></Button>
                          </div>
                        ) : <button onClick={() => { setAddingTo(row.id); setAddText("") }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-[#F8FAFC] border-t border-[#F1F5F9]"><Plus className="w-4 h-4" />{copy.addItem}</button>}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === "checklists" && (
        <div className="space-y-3">
          {checklists.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[#D9E1EC] rounded-2xl text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">{copy.emptyChecklists}</p>
              <p className="text-sm mt-1">{copy.emptyChecklistsHint}</p>
            </div>
          ) : checklists.map((row) => {
            const checked = row.items?.filter((item) => item.is_checked).length ?? 0
            const total = row.items?.length ?? 0
            const done = total > 0 && checked === total
            return (
              <div key={row.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleChecklist(row.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-[#DCFCE7]" : "bg-[#F0FDF4]"}`}><Check className={`w-5 h-5 ${done ? "text-[#16A34A]" : "text-[#10B981]"}`} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F1F63] truncate">{row.title}</p>
                      {total > 0 && <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.round((checked / total) * 100)}%` }} /></div><span className="text-xs text-muted-foreground">{checked}/{total}</span></div>}
                    </div>
                  </button>
                  <button onClick={() => supabase.from("checklists").update({ status: "archived" }).eq("id", row.id).then(loadAll)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  {row.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
                {row.expanded && (
                  <div className="border-t border-[#F1F5F9]">
                    {!row.items ? <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div> : (
                      <>
                        {row.items.map((item, index) => (
                          <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0 ${item.is_checked ? "opacity-55" : ""}`}>
                            <button onClick={() => toggleChecklistItem(item.id, item.is_checked, row.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.is_checked ? "bg-[#10B981] border-[#10B981]" : "border-[#D9E1EC] hover:border-[#10B981]"}`}>{item.is_checked && <Check className="w-3 h-3 text-white" />}</button>
                            <span className={`text-sm flex-1 ${item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"}`}><span className="text-xs text-muted-foreground mr-1.5">{index + 1}.</span>{item.content}</span>
                          </div>
                        ))}
                        {addingChecklistTo === row.id ? (
                          <div className="flex gap-2 p-3 border-t border-[#F1F5F9]">
                            <Input value={checklistAddText} onChange={(event) => setChecklistAddText(event.target.value)} placeholder={copy.addChecklistItem} className="rounded-xl h-8 text-sm" autoFocus onKeyDown={(event) => { if (event.key === "Enter") addChecklistItem(row.id); if (event.key === "Escape") setAddingChecklistTo(null) }} />
                            <Button size="sm" onClick={() => addChecklistItem(row.id)} className="bg-[#10B981] hover:bg-[#0f9c6f] text-white rounded-xl h-8 text-xs px-3">OK</Button>
                            <Button size="sm" variant="ghost" onClick={() => setAddingChecklistTo(null)} className="h-8 rounded-xl px-2"><X className="w-3 h-3" /></Button>
                          </div>
                        ) : <button onClick={() => { setAddingChecklistTo(row.id); setChecklistAddText("") }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-[#F8FAFC] border-t border-[#F1F5F9]"><Plus className="w-4 h-4" />{copy.addChecklistItem}</button>}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
