"use client"

import { useEffect, useState, useCallback } from "react"
import {
  List, Plus, Check, Trash2, RefreshCw, ShoppingCart,
  Briefcase, User, FileText, ChevronDown, ChevronRight,
  Pencil, X, Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type ListItem      = { id: string; content: string; is_checked: boolean; position: number }
type ListRow       = { id: string; title: string; list_type: string; status: string; created_at: string; items?: ListItem[]; expanded?: boolean }
type ChecklistItem = { id: string; content: string; is_checked: boolean; position: number }
type ChecklistRow  = { id: string; title: string; status: string; created_at: string; items?: ChecklistItem[]; expanded?: boolean }

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { shopping: ShoppingCart, project: Briefcase, personal: User, work: Briefcase, free: List }
const TYPE_LABELS: Record<string, string> = { shopping: "Compras", project: "Proyecto", personal: "Personal", work: "Trabajo", free: "Lista libre" }
const TYPE_COLORS: Record<string, string> = { shopping: "#F59E0B", project: "#7C3AED", personal: "#10B981", work: "#3B82F6", free: "#64748B" }

export default function ListasPage() {
  const [clientId, setClientId]         = useState<string | null>(null)
  const [lists, setLists]               = useState<ListRow[]>([])
  const [checklists, setChecklists]     = useState<ChecklistRow[]>([])
  const [loading, setLoading]           = useState(true)
  const [tab, setTab]                   = useState<"listas" | "checklists">("listas")
  const [showNew, setShowNew]           = useState(false)
  const [newTitle, setNewTitle]         = useState("")
  const [newType, setNewType]           = useState("free")
  const [newItems, setNewItems]         = useState("")
  const [creating, setCreating]         = useState(false)
  const [addingTo, setAddingTo]         = useState<string | null>(null)
  const [addText, setAddText]           = useState("")
  const [editId, setEditId]             = useState<string | null>(null)
  const [editVal, setEditVal]           = useState("")

  useEffect(() => { getCurrentClientId().then(setClientId).catch(console.error) }, [])
  useEffect(() => { if (clientId) loadAll() }, [clientId])

  const loadAll = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    const [lr, cr] = await Promise.all([
      supabase.from("lists").select("id,title,list_type,status,created_at").eq("client_id", clientId).eq("status", "active").order("created_at", { ascending: false }).limit(50),
      supabase.from("checklists").select("id,title,status,created_at").eq("client_id", clientId).eq("status", "active").order("created_at", { ascending: false }).limit(50),
    ])
    setLists((lr.data || []).map(l => ({ ...l, expanded: false })))
    setChecklists((cr.data || []).map(c => ({ ...c, expanded: false })))
    setLoading(false)
  }, [clientId])

  // Real-time: changes from WhatsApp reflect instantly
  useEffect(() => {
    if (!clientId) return
    const ch = supabase.channel(`lists-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lists",          filter: `client_id=eq.${clientId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "checklists",     filter: `client_id=eq.${clientId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "list_items",     filter: `client_id=eq.${clientId}` }, (p) => {
        const lid = (p.new as any)?.list_id || (p.old as any)?.list_id
        if (lid) setLists(prev => prev.map(l => l.id === lid ? { ...l, items: undefined } : l))
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "checklist_items", filter: `client_id=eq.${clientId}` }, (p) => {
        const cid = (p.new as any)?.checklist_id || (p.old as any)?.checklist_id
        if (cid) setChecklists(prev => prev.map(c => c.id === cid ? { ...c, items: undefined } : c))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId, loadAll])

  const loadItems = async (id: string) => (await supabase.from("list_items").select("id,content,is_checked,position").eq("list_id", id).order("position")).data as ListItem[] || []
  const loadCLItems = async (id: string) => (await supabase.from("checklist_items").select("id,content,is_checked,position").eq("checklist_id", id).order("position")).data as ChecklistItem[] || []

  const toggleList = async (id: string) => {
    const lst = lists.find(l => l.id === id)
    if (!lst) return
    if (!lst.expanded && !lst.items) {
      const items = await loadItems(id)
      setLists(prev => prev.map(l => l.id === id ? { ...l, expanded: true, items } : l))
    } else {
      setLists(prev => prev.map(l => l.id === id ? { ...l, expanded: !l.expanded } : l))
    }
  }

  const toggleCL = async (id: string) => {
    const cl = checklists.find(c => c.id === id)
    if (!cl) return
    if (!cl.expanded && !cl.items) {
      const items = await loadCLItems(id)
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, expanded: true, items } : c))
    } else {
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c))
    }
  }

  const toggleItem = async (itemId: string, checked: boolean, listId: string) => {
    await supabase.from("list_items").update({ is_checked: !checked }).eq("id", itemId)
    setLists(prev => prev.map(l => l.id === listId ? { ...l, items: l.items?.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i) } : l))
  }

  const toggleCLItem = async (itemId: string, checked: boolean, clId: string) => {
    await supabase.from("checklist_items").update({ is_checked: !checked }).eq("id", itemId)
    setChecklists(prev => prev.map(c => c.id === clId ? { ...c, items: c.items?.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i) } : c))
  }

  const addItem = async (listId: string) => {
    if (!addText.trim() || !clientId) return
    const pos = lists.find(l => l.id === listId)?.items?.length || 0
    await supabase.from("list_items").insert({ list_id: listId, client_id: clientId, content: addText.trim(), position: pos })
    const items = await loadItems(listId)
    setLists(prev => prev.map(l => l.id === listId ? { ...l, items } : l))
    setAddText(""); setAddingTo(null)
  }

  const clearChecked = async (listId: string) => {
    const ids = lists.find(l => l.id === listId)?.items?.filter(i => i.is_checked).map(i => i.id) || []
    if (!ids.length) return
    await supabase.from("list_items").delete().in("id", ids)
    setLists(prev => prev.map(l => l.id === listId ? { ...l, items: l.items?.filter(i => !i.is_checked) } : l))
  }

  const createNew = async () => {
    if (!clientId || !newTitle.trim()) return
    setCreating(true)
    try {
      if (tab === "listas") {
        const { data } = await supabase.from("lists").insert({ client_id: clientId, title: newTitle.trim(), list_type: newType, status: "active", source: "dashboard" }).select("id").single()
        if (data && newItems.trim()) {
          const rows = newItems.split(/[\n,]/).map((x, i) => ({ list_id: data.id, client_id: clientId, content: x.trim(), position: i })).filter(r => r.content)
          if (rows.length) await supabase.from("list_items").insert(rows)
        }
      } else {
        await supabase.from("checklists").insert({ client_id: clientId, title: newTitle.trim(), status: "active", source: "dashboard" })
      }
      setNewTitle(""); setNewItems(""); setShowNew(false); await loadAll()
    } finally { setCreating(false) }
  }

  const saveTitle = async (id: string) => {
    if (!editVal.trim()) return
    await supabase.from("lists").update({ title: editVal.trim() }).eq("id", id)
    setLists(prev => prev.map(l => l.id === id ? { ...l, title: editVal.trim() } : l))
    setEditId(null)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-5 h-5 animate-spin text-[#3B82F6]" /></div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Listas y Checklists</h1>
          <p className="text-sm text-muted-foreground">Se sincroniza con WhatsApp en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} className="rounded-xl"><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowNew(!showNew)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"><Plus className="w-4 h-4 mr-1.5" />Nueva</Button>
        </div>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-[#0F1F63]">{tab === "listas" ? "Nueva lista" : "Nuevo checklist"}</p>
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={tab === "listas" ? "Ej: Lista del mercado" : "Ej: Pasos para la reunión"} className="rounded-xl" onKeyDown={e => e.key === "Enter" && createNew()} />
          {tab === "listas" && (
            <>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[#D9E1EC] text-sm bg-white">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <textarea value={newItems} onChange={e => setNewItems(e.target.value)} placeholder="Ítems iniciales separados por coma o salto de línea (opcional)" rows={3} className="w-full px-3 py-2 rounded-xl border border-[#D9E1EC] text-sm resize-none focus:outline-none focus:border-[#3B82F6]" />
            </>
          )}
          <div className="flex gap-2">
            <Button onClick={createNew} disabled={creating || !newTitle.trim()} className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Crear"}
            </Button>
            <Button variant="outline" onClick={() => setShowNew(false)} className="rounded-xl"><X className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["listas","checklists"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-[#3B82F6] text-white" : "bg-white border border-[#E2E8F0] text-[#5F6B7A] hover:bg-[#F7F9FC]"}`}>
            {t === "listas" ? `Listas (${lists.length})` : `Checklists (${checklists.length})`}
          </button>
        ))}
      </div>

      {/* LISTS */}
      {tab === "listas" && (
        <div className="space-y-3">
          {lists.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[#D9E1EC] rounded-2xl text-muted-foreground">
              <List className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Sin listas activas</p>
              <p className="text-sm mt-1">Di <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">hazme una lista de compras</code> por WhatsApp</p>
            </div>
          ) : lists.map(lst => {
            const Icon  = TYPE_ICONS[lst.list_type] || List
            const color = TYPE_COLORS[lst.list_type] || "#64748B"
            const chk   = lst.items?.filter(i => i.is_checked).length ?? 0
            const tot   = lst.items?.length ?? 0
            return (
              <div key={lst.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleList(lst.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editId === lst.id
                        ? <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                            <Input value={editVal} onChange={e => setEditVal(e.target.value)} className="h-7 text-sm rounded-lg" autoFocus onKeyDown={e => { if (e.key === "Enter") saveTitle(lst.id); if (e.key === "Escape") setEditId(null) }} />
                            <button onClick={() => saveTitle(lst.id)} className="text-[#3B82F6]"><Save className="w-4 h-4" /></button>
                          </div>
                        : <p className="font-semibold text-[#0F1F63] truncate">{lst.title}</p>
                      }
                      <p className="text-xs text-muted-foreground">{TYPE_LABELS[lst.list_type] || "Lista"}{tot > 0 && ` · ${chk}/${tot}`}</p>
                      {tot > 0 && <div className="mt-1 h-1 w-full bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.round(chk/tot*100)}%`, backgroundColor: color }} /></div>}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditId(lst.id); setEditVal(lst.title) }} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-muted-foreground hover:text-[#3B82F6]"><Pencil className="w-3.5 h-3.5" /></button>
                    {chk > 0 && <button onClick={() => clearChecked(lst.id)} className="px-2 py-1 rounded-lg hover:bg-[#FFF7ED] text-xs text-muted-foreground hover:text-[#F59E0B]">Limpiar ✓</button>}
                    <button onClick={() => supabase.from("lists").update({ status: "archived" }).eq("id", lst.id).then(loadAll)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    {lst.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {lst.expanded && (
                  <div className="border-t border-[#F1F5F9]">
                    {!lst.items
                      ? <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div>
                      : lst.items.length === 0
                      ? null
                      : lst.items.map(item => (
                        <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0 transition-colors ${item.is_checked ? "opacity-55" : ""}`}>
                          <button onClick={() => toggleItem(item.id, item.is_checked, lst.id)}
                            className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                            style={item.is_checked ? { backgroundColor: color, borderColor: color } : { borderColor: "#D9E1EC" }}>
                            {item.is_checked && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`text-sm flex-1 ${item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"}`}>{item.content}</span>
                        </div>
                      ))
                    }
                    {addingTo === lst.id
                      ? <div className="flex gap-2 p-3 border-t border-[#F1F5F9]">
                          <Input value={addText} onChange={e => setAddText(e.target.value)} placeholder="Nuevo ítem..." className="rounded-xl h-8 text-sm" autoFocus
                            onKeyDown={e => { if (e.key === "Enter") addItem(lst.id); if (e.key === "Escape") setAddingTo(null) }} />
                          <Button size="sm" onClick={() => addItem(lst.id)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl h-8 text-xs px-3">OK</Button>
                          <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)} className="h-8 rounded-xl px-2"><X className="w-3 h-3" /></Button>
                        </div>
                      : <button onClick={() => { setAddingTo(lst.id); setAddText("") }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-[#F8FAFC] border-t border-[#F1F5F9]">
                          <Plus className="w-4 h-4" />Agregar ítem
                        </button>
                    }
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CHECKLISTS */}
      {tab === "checklists" && (
        <div className="space-y-3">
          {checklists.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[#D9E1EC] rounded-2xl text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Sin checklists activos</p>
              <p className="text-sm mt-1">Di <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">hazme un checklist para X</code> por WhatsApp</p>
            </div>
          ) : checklists.map(cl => {
            const chk = cl.items?.filter(i => i.is_checked).length ?? 0
            const tot = cl.items?.length ?? 0
            const done = tot > 0 && chk === tot
            return (
              <div key={cl.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleCL(cl.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-[#DCFCE7]" : "bg-[#F0FDF4]"}`}>
                      <Check className={`w-5 h-5 ${done ? "text-[#16A34A]" : "text-[#10B981]"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F1F63] truncate">{cl.title}</p>
                      {tot > 0 && <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.round(chk/tot*100)}%` }} /></div><span className="text-xs text-muted-foreground">{chk}/{tot}</span></div>}
                    </div>
                  </button>
                  <button onClick={() => supabase.from("checklists").update({ status: "archived" }).eq("id", cl.id).then(loadAll)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {cl.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
                {cl.expanded && (
                  <div className="border-t border-[#F1F5F9]">
                    {!cl.items ? <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div>
                      : cl.items.map((item, idx) => (
                        <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0 ${item.is_checked ? "opacity-55" : ""}`}>
                          <button onClick={() => toggleCLItem(item.id, item.is_checked, cl.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.is_checked ? "bg-[#10B981] border-[#10B981]" : "border-[#D9E1EC] hover:border-[#10B981]"}`}>
                            {item.is_checked && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`text-sm flex-1 ${item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"}`}>
                            <span className="text-xs text-muted-foreground mr-1.5">{idx + 1}.</span>{item.content}
                          </span>
                        </div>
                      ))
                    }
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
