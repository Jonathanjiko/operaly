"use client"

import { useEffect, useState } from "react"
import {
  List, Plus, Check, Trash2, RefreshCw,
  ShoppingCart, Briefcase, User, FileText,
  ChevronDown, ChevronRight, MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type ListItem = {
  id: string
  content: string
  is_checked: boolean
  position: number
}

type ListRow = {
  id: string
  title: string
  list_type: string
  status: string
  created_at: string
  items?: ListItem[]
  expanded?: boolean
}

type ChecklistItem = {
  id: string
  content: string
  is_checked: boolean
  position: number
}

type ChecklistRow = {
  id: string
  title: string
  status: string
  created_at: string
  items?: ChecklistItem[]
  expanded?: boolean
}

const LIST_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shopping: ShoppingCart,
  project:  Briefcase,
  personal: User,
  work:     Briefcase,
  free:     List,
}

const LIST_TYPE_LABELS: Record<string, string> = {
  shopping: "Compras",
  project:  "Proyecto",
  personal: "Personal",
  work:     "Trabajo",
  free:     "Lista libre",
}

export default function ListasPage() {
  const [clientId, setClientId]       = useState<string | null>(null)
  const [lists, setLists]             = useState<ListRow[]>([])
  const [checklists, setChecklists]   = useState<ChecklistRow[]>([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState<"listas" | "checklists">("listas")
  const [newTitle, setNewTitle]       = useState("")
  const [newType, setNewType]         = useState("free")
  const [creating, setCreating]       = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    getCurrentClientId()
      .then(setClientId)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!clientId) return
    loadData()
  }, [clientId])

  const loadData = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const [listsRes, checklistsRes] = await Promise.all([
        supabase.from("lists")
          .select("id, title, list_type, status, created_at")
          .eq("client_id", clientId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.from("checklists")
          .select("id, title, status, created_at")
          .eq("client_id", clientId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(30),
      ])
      setLists((listsRes.data || []).map(l => ({ ...l, expanded: false })))
      setChecklists((checklistsRes.data || []).map(c => ({ ...c, expanded: false })))
    } catch (err) {
      console.error("loadData error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadListItems = async (listId: string) => {
    const res = await supabase.from("list_items")
      .select("id, content, is_checked, position")
      .eq("list_id", listId)
      .order("position", { ascending: true })
    return res.data || []
  }

  const loadChecklistItems = async (checklistId: string) => {
    const res = await supabase.from("checklist_items")
      .select("id, content, is_checked, position")
      .eq("checklist_id", checklistId)
      .order("position", { ascending: true })
    return res.data || []
  }

  const toggleList = async (id: string) => {
    const lst = lists.find(l => l.id === id)
    if (!lst) return
    if (!lst.expanded && !lst.items) {
      const items = await loadListItems(id)
      setLists(prev => prev.map(l => l.id === id
        ? { ...l, expanded: true, items }
        : l
      ))
    } else {
      setLists(prev => prev.map(l => l.id === id
        ? { ...l, expanded: !l.expanded }
        : l
      ))
    }
  }

  const toggleChecklist = async (id: string) => {
    const cl = checklists.find(c => c.id === id)
    if (!cl) return
    if (!cl.expanded && !cl.items) {
      const items = await loadChecklistItems(id)
      setChecklists(prev => prev.map(c => c.id === id
        ? { ...c, expanded: true, items }
        : c
      ))
    } else {
      setChecklists(prev => prev.map(c => c.id === id
        ? { ...c, expanded: !c.expanded }
        : c
      ))
    }
  }

  const toggleItem = async (itemId: string, currentChecked: boolean, listId: string) => {
    await supabase.from("list_items")
      .update({ is_checked: !currentChecked })
      .eq("id", itemId)
    setLists(prev => prev.map(l =>
      l.id === listId
        ? {
            ...l,
            items: l.items?.map(i =>
              i.id === itemId ? { ...i, is_checked: !currentChecked } : i
            ),
          }
        : l
    ))
  }

  const toggleChecklistItem = async (
    itemId: string, currentChecked: boolean, checklistId: string
  ) => {
    await supabase.from("checklist_items")
      .update({ is_checked: !currentChecked })
      .eq("id", itemId)
    setChecklists(prev => prev.map(c =>
      c.id === checklistId
        ? {
            ...c,
            items: c.items?.map(i =>
              i.id === itemId ? { ...i, is_checked: !currentChecked } : i
            ),
          }
        : c
    ))
  }

  const createNew = async () => {
    if (!clientId || !newTitle.trim()) return
    setCreating(true)
    try {
      if (tab === "listas") {
        await supabase.from("lists").insert({
          client_id: clientId,
          title:     newTitle.trim(),
          list_type: newType,
          status:    "active",
          source:    "dashboard",
        })
      } else {
        await supabase.from("checklists").insert({
          client_id: clientId,
          title:     newTitle.trim(),
          status:    "active",
          source:    "dashboard",
        })
      }
      setNewTitle("")
      setShowNewForm(false)
      await loadData()
    } catch (err) {
      console.error("createNew error:", err)
    } finally {
      setCreating(false)
    }
  }

  const archiveList = async (id: string) => {
    await supabase.from("lists").update({ status: "archived" }).eq("id", id)
    setLists(prev => prev.filter(l => l.id !== id))
  }

  const archiveChecklist = async (id: string) => {
    await supabase.from("checklists").update({ status: "archived" }).eq("id", id)
    setChecklists(prev => prev.filter(c => c.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-[#3B82F6]" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Listas y Checklists</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organiza tus ideas, compras y procesos
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      {/* New form */}
      {showNewForm && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-[#0F1F63] mb-1 block">
                {tab === "listas" ? "Nombre de la lista" : "Nombre del checklist"}
              </label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder={tab === "listas" ? "Ej: Lista de compras del mercado" : "Ej: Preparación para reunión"}
                className="rounded-xl border-[#D9E1EC]"
                onKeyDown={e => e.key === "Enter" && createNew()}
              />
            </div>
            {tab === "listas" && (
              <div>
                <label className="text-sm font-medium text-[#0F1F63] mb-1 block">Tipo</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#D9E1EC] text-sm bg-white"
                >
                  {Object.entries(LIST_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            )}
            <Button
              onClick={createNew}
              disabled={creating || !newTitle.trim()}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
            >
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Crear"}
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["listas", "checklists"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "bg-white border border-[#E2E8F0] text-[#5F6B7A] hover:bg-[#F7F9FC]"
            }`}
          >
            {t === "listas" ? `Listas (${lists.length})` : `Checklists (${checklists.length})`}
          </button>
        ))}
      </div>

      {/* Lists */}
      {tab === "listas" && (
        <div className="space-y-3">
          {lists.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No tienes listas aún</p>
              <p className="text-sm mt-1">Crea una o dile a Operaly por WhatsApp</p>
            </div>
          ) : lists.map(lst => {
            const Icon = LIST_TYPE_ICONS[lst.list_type] || List
            const checkedCount = lst.items?.filter(i => i.is_checked).length ?? 0
            const totalCount   = lst.items?.length ?? 0

            return (
              <div key={lst.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F7F9FC] transition-colors"
                  onClick={() => toggleList(lst.id)}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3FF] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0F1F63] truncate">{lst.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {LIST_TYPE_LABELS[lst.list_type] || "Lista"}
                      {lst.items && totalCount > 0 && ` · ${checkedCount}/${totalCount}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); archiveList(lst.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {lst.expanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </div>

                {lst.expanded && (
                  <div className="border-t border-[#E2E8F0] px-4 pb-3">
                    {!lst.items || lst.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3 text-center">
                        Lista vacía · Agrega ítems por WhatsApp
                      </p>
                    ) : lst.items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 group"
                      >
                        <button
                          onClick={() => toggleItem(item.id, item.is_checked, lst.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            item.is_checked
                              ? "bg-[#3B82F6] border-[#3B82F6]"
                              : "border-[#D9E1EC] hover:border-[#3B82F6]"
                          }`}
                        >
                          {item.is_checked && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${
                          item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"
                        }`}>
                          {item.content}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Checklists */}
      {tab === "checklists" && (
        <div className="space-y-3">
          {checklists.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No tienes checklists aún</p>
              <p className="text-sm mt-1">Crea uno o dile a Operaly por WhatsApp</p>
            </div>
          ) : checklists.map(cl => {
            const checkedCount = cl.items?.filter(i => i.is_checked).length ?? 0
            const totalCount   = cl.items?.length ?? 0
            const progress     = totalCount > 0 ? Math.round(checkedCount / totalCount * 100) : 0

            return (
              <div key={cl.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F7F9FC] transition-colors"
                  onClick={() => toggleChecklist(cl.id)}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0F1F63] truncate">{cl.title}</p>
                    {cl.items && totalCount > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#10B981] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); archiveChecklist(cl.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {cl.expanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </div>

                {cl.expanded && (
                  <div className="border-t border-[#E2E8F0] px-4 pb-3">
                    {!cl.items || cl.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3 text-center">
                        Checklist vacío · Agrega pasos por WhatsApp
                      </p>
                    ) : cl.items.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <button
                          onClick={() => toggleChecklistItem(item.id, item.is_checked, cl.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            item.is_checked
                              ? "bg-[#10B981] border-[#10B981]"
                              : "border-[#D9E1EC] hover:border-[#10B981]"
                          }`}
                        >
                          {item.is_checked && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${
                          item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"
                        }`}>
                          <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                          {item.content}
                        </span>
                      </div>
                    ))}
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
