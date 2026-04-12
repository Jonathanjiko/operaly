"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ShoppingCart, Briefcase, User, FileText, List, Plus, Check, Trash2, RefreshCw, ChevronDown, ChevronRight, Pencil, X, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type ListItem      = { id: string; content: string; is_checked: boolean; position: number }
type ListRow       = { id: string; title: string; list_type: string; status: string; created_at: string; items?: ListItem[]; expanded?: boolean; loadingItems?: boolean }
type ChecklistItem = { id: string; content: string; is_checked: boolean; position: number }
type ChecklistRow  = { id: string; title: string; status: string; created_at: string; items?: ChecklistItem[]; expanded?: boolean }

const TYPE_ICONS: Record<string, any> = { shopping: ShoppingCart, project: Briefcase, personal: User, work: Briefcase, free: List }
const TYPE_LABELS: Record<string, string> = { shopping: "Compras", project: "Proyecto", personal: "Personal", work: "Trabajo", free: "Lista libre" }
const TYPE_COLORS: Record<string, string> = { shopping: "#F59E0B", project: "#7C3AED", personal: "#10B981", work: "#3B82F6", free: "#64748B" }

function ProgressBar({ checked, total, color }: { checked: number; total: number; color: string }) {
  if (total === 0) return null
  const pct = Math.round((checked / total) * 100)
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{checked}/{total}</span>
    </div>
  )
}

function WAButtonBar({ buttons }: { buttons: { label: string; danger?: boolean; primary?: boolean; onClick: () => void }[] }) {
  return (
    <div className="flex gap-1.5 px-4 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]/60 flex-wrap">
      {buttons.map((b, i) => (
        <button key={i} onClick={b.onClick}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 ${
            b.danger ? "bg-red-50 text-red-500 hover:bg-red-100" :
            b.primary ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]" :
            "bg-white border border-[#E2E8F0] text-[#4A5568] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] hover:text-[#3B82F6]"
          }`}>
          {b.label}
        </button>
      ))}
    </div>
  )
}

export default function ListasPage() {
  const [clientId, setClientId]     = useState<string | null>(null)
  const [lists, setLists]           = useState<ListRow[]>([])
  const [checklists, setChecklists] = useState<ChecklistRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<"listas" | "checklists">("listas")
  const [showNew, setShowNew]       = useState(false)
  const [newTitle, setNewTitle]     = useState("")
  const [newType, setNewType]       = useState("free")
  const [newItems, setNewItems]     = useState("")
  const [creating, setCreating]     = useState(false)
  const [addingTo, setAddingTo]     = useState<string | null>(null)
  const [addText, setAddText]       = useState("")
  const [editId, setEditId]         = useState<string | null>(null)
  const [editVal, setEditVal]       = useState("")
  const addRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!clientId) return
    const ch = supabase.channel(`lists-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lists", filter: `client_id=eq.${clientId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "checklists", filter: `client_id=eq.${clientId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "list_items", filter: `client_id=eq.${clientId}` }, (p) => {
        const lid = (p.new as any)?.list_id || (p.old as any)?.list_id
        if (lid) setLists(prev => prev.map(l => l.id === lid ? { ...l, items: undefined } : l))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId, loadAll])

  const loadItems = async (id: string) =>
    ((await supabase.from("list_items").select("id,content,is_checked,position").eq("list_id", id).order("position")).data || []) as ListItem[]

  const loadCLItems = async (id: string) =>
    ((await supabase.from("checklist_items").select("id,content,is_checked,position").eq("checklist_id", id).order("position")).data || []) as ChecklistItem[]

  const toggleList = async (id: string) => {
    const lst = lists.find(l => l.id === id)
    if (!lst) return
    if (!lst.expanded && !lst.items) {
      setLists(prev => prev.map(l => l.id === id ? { ...l, expanded: true, loadingItems: true } : l))
      const items = await loadItems(id)
      setLists(prev => prev.map(l => l.id === id ? { ...l, items, loadingItems: false } : l))
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
    setLists(prev => prev.map(l => l.id === listId ? { ...l, items: l.items?.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i) } : l))
    await supabase.from("list_items").update({ is_checked: !checked }).eq("id", itemId)
  }

  const toggleCLItem = async (itemId: string, checked: boolean, clId: string) => {
    setChecklists(prev => prev.map(c => c.id === clId ? { ...c, items: c.items?.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i) } : c))
    await supabase.from("checklist_items").update({ is_checked: !checked }).eq("id", itemId)
  }

  const addItem = async (listId: string) => {
    if (!addText.trim() || !clientId) return
    const pos = lists.find(l => l.id === listId)?.items?.length || 0
    const { data } = await supabase.from("list_items").insert({ list_id: listId, client_id: clientId, content: addText.trim(), position: pos }).select("id,content,is_checked,position").single()
    if (data) setLists(prev => prev.map(l => l.id === listId ? { ...l, items: [...(l.items || []), data] } : l))
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#3B82F6]" />
        <p className="text-xs text-muted-foreground">Sincronizando...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Listas y Checklists</h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En tiempo real con WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-medium transition-all active:scale-95">
            <Plus className="w-4 h-4" />Nueva
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-[#0F1F63]">{tab === "listas" ? "Nueva lista" : "Nuevo checklist"}</p>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus
            placeholder={tab === "listas" ? "Ej: Lista del mercado" : "Ej: Pasos para la reunión"}
            className="w-full h-10 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]"
            onKeyDown={e => e.key === "Enter" && createNew()} />
          {tab === "listas" && (
            <>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D9E1EC] text-sm bg-white focus:outline-none">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <textarea value={newItems} onChange={e => setNewItems(e.target.value)} rows={3}
                placeholder="Ítems (uno por línea o coma) — opcional"
                className="w-full px-3 py-2 rounded-xl border border-[#D9E1EC] text-sm resize-none focus:outline-none focus:border-[#3B82F6]" />
            </>
          )}
          <div className="flex gap-2">
            <button onClick={createNew} disabled={creating || !newTitle.trim()}
              className="flex-1 h-9 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 active:scale-95">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Crear</>}
            </button>
            <button onClick={() => setShowNew(false)} className="h-9 px-4 rounded-xl border border-[#E2E8F0] text-sm hover:bg-[#F1F5F9]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 p-1 bg-[#F1F5F9] rounded-xl">
        {(["listas", "checklists"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t ? "bg-white shadow-sm text-[#0F1F63]" : "text-[#5F6B7A] hover:text-[#0F1F63]"}`}>
            {t === "listas" ? `Listas (${lists.length})` : `Checklists (${checklists.length})`}
          </button>
        ))}
      </div>

      {tab === "listas" && (
        <div className="space-y-3">
          {lists.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#D9E1EC] rounded-2xl">
              <List className="w-10 h-10 mx-auto mb-3 text-[#D9E1EC]" />
              <p className="font-medium text-[#64748B]">Sin listas activas</p>
              <p className="text-sm text-muted-foreground mt-1">Di <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-xs">hazme una lista de compras</code> por WhatsApp</p>
            </div>
          ) : lists.map(lst => {
            const Icon = TYPE_ICONS[lst.list_type] || List
            const color = TYPE_COLORS[lst.list_type] || "#64748B"
            const chk = lst.items?.filter(i => i.is_checked).length ?? 0
            const tot = lst.items?.length ?? 0

            return (
              <div key={lst.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => toggleList(lst.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editId === lst.id ? (
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <input value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus
                          className="flex-1 h-7 px-2 text-sm rounded-lg border border-[#D9E1EC] focus:outline-none focus:border-[#3B82F6]"
                          onKeyDown={e => { if (e.key === "Enter") saveTitle(lst.id); if (e.key === "Escape") setEditId(null) }} />
                        <button onClick={() => saveTitle(lst.id)} className="text-[#3B82F6] p-1"><Save className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditId(null)} className="text-muted-foreground p-1"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <p className="font-semibold text-[#0F1F63] truncate">{lst.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{TYPE_LABELS[lst.list_type] || "Lista"}</p>
                    {lst.items && <ProgressBar checked={chk} total={tot} color={color} />}
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditId(lst.id); setEditVal(lst.title) }}
                      className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-muted-foreground hover:text-[#3B82F6] transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {lst.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {lst.expanded && (
                  <div className="border-t border-[#F1F5F9]">
                    {lst.loadingItems ? (
                      <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div>
                    ) : (
                      <>
                        {(lst.items || []).length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">Lista vacía</p>}
                        {(lst.items || []).map(item => (
                          <div key={item.id}
                            className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] border-b border-[#F8FAFC] last:border-0 transition-all ${item.is_checked ? "opacity-50" : ""}`}>
                            <button
                              onClick={() => toggleItem(item.id, item.is_checked, lst.id)}
                              className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
                              style={item.is_checked ? { backgroundColor: color, borderColor: color } : { borderColor: "#D9E1EC" }}>
                              {item.is_checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </button>
                            <span className={`text-sm flex-1 transition-all ${item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"}`}>
                              {item.content}
                            </span>
                          </div>
                        ))}
                        {addingTo === lst.id && (
                          <div className="flex gap-2 p-3 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                            <input ref={addRef} value={addText} onChange={e => setAddText(e.target.value)}
                              placeholder="Nuevo ítem..." autoFocus
                              className="flex-1 h-8 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]"
                              onKeyDown={e => { if (e.key === "Enter") addItem(lst.id); if (e.key === "Escape") setAddingTo(null) }} />
                            <button onClick={() => addItem(lst.id)} className="px-3 h-8 bg-[#3B82F6] text-white rounded-xl text-xs font-medium hover:bg-[#2563EB] active:scale-95">OK</button>
                            <button onClick={() => setAddingTo(null)} className="h-8 px-2 rounded-xl hover:bg-[#E2E8F0]"><X className="w-3 h-3 text-muted-foreground" /></button>
                          </div>
                        )}
                        <WAButtonBar buttons={[
                          { label: "➕ Agregar ítem", onClick: () => { setAddingTo(lst.id); setAddText(""); setTimeout(() => addRef.current?.focus(), 50) } },
                          ...(chk > 0 ? [{ label: `🗑️ Limpiar ${chk} ✓`, danger: true, onClick: () => clearChecked(lst.id) }] : []),
                          { label: "✏️ Renombrar", onClick: () => { setEditId(lst.id); setEditVal(lst.title) } },
                          { label: "🗂️ Archivar", danger: true, onClick: () => { supabase.from("lists").update({ status: "archived" }).eq("id", lst.id).then(loadAll) } },
                        ]} />
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
            <div className="text-center py-16 border border-dashed border-[#D9E1EC] rounded-2xl">
              <FileText className="w-10 h-10 mx-auto mb-3 text-[#D9E1EC]" />
              <p className="font-medium text-[#64748B]">Sin checklists activos</p>
              <p className="text-sm text-muted-foreground mt-1">Di <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-xs">hazme un checklist para X</code> por WhatsApp</p>
            </div>
          ) : checklists.map(cl => {
            const chk = cl.items?.filter(i => i.is_checked).length ?? 0
            const tot = cl.items?.length ?? 0
            const done = tot > 0 && chk === tot
            return (
              <div key={cl.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${done ? "border-emerald-200" : "border-[#E2E8F0]"}`}>
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => toggleCL(cl.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-[#DCFCE7]" : "bg-[#F0FDF4]"}`}>
                    <Check className={`w-5 h-5 ${done ? "text-[#16A34A]" : "text-[#10B981]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0F1F63] truncate">{cl.title}</p>
                    <ProgressBar checked={chk} total={tot} color="#10B981" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { supabase.from("checklists").update({ status: "archived" }).eq("id", cl.id).then(loadAll) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {cl.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                {cl.expanded && (
                  <div className="border-t border-[#F1F5F9]">
                    {!cl.items ? (
                      <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div>
                    ) : cl.items.map((item, idx) => (
                      <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] border-b border-[#F8FAFC] last:border-0 ${item.is_checked ? "opacity-50" : ""}`}>
                        <button onClick={() => toggleCLItem(item.id, item.is_checked, cl.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 ${item.is_checked ? "bg-[#10B981] border-[#10B981]" : "border-[#D9E1EC] hover:border-[#10B981]"}`}>
                          {item.is_checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>
                        <span className={`text-sm flex-1 ${item.is_checked ? "line-through text-muted-foreground" : "text-[#1D2A3B]"}`}>
                          <span className="text-xs text-muted-foreground mr-1.5 font-mono">{idx + 1}.</span>{item.content}
                        </span>
                      </div>
                    ))}
                    <WAButtonBar buttons={[
                      { label: "🗂️ Archivar", danger: true, onClick: () => { supabase.from("checklists").update({ status: "archived" }).eq("id", cl.id).then(loadAll) } },
                    ]} />
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
