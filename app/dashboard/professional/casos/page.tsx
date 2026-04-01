"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus, Trash2, RefreshCw, Pencil, X, Save,
  FolderOpen, Search, ChevronRight, User, FileText,
  Circle, CheckCircle2, Clock, AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type CaseRow = {
  id: string; client_id: string; title: string | null; person_key: string | null
  status: string | null; person_name: string | null; person_type: string | null
  case_title: string | null; summary: string | null; created_at: string | null
}

const STATUSES = [
  { v: "open",     label: "Abierto",    color: "#3B82F6", bg: "bg-blue-50",    border: "border-blue-200",    icon: Circle },
  { v: "pending",  label: "Pendiente",  color: "#F59E0B", bg: "bg-amber-50",   border: "border-amber-200",   icon: Clock },
  { v: "resolved", label: "Resuelto",   color: "#10B981", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  { v: "closed",   label: "Cerrado",    color: "#6B7280", bg: "bg-gray-50",    border: "border-gray-200",    icon: AlertCircle },
]

function getStatus(v: string | null) {
  return STATUSES.find(s => s.v === (v || "").toLowerCase()) || STATUSES[0]
}

function StatusBadge({ status }: { status: string | null }) {
  const s = getStatus(status)
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.border}`} style={{ color: s.color }}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  )
}

// ── Case Card ─────────────────────────────────────────────────────────────────
function CaseCard({ cas, onClick, onEdit, onDelete }: {
  cas: CaseRow; onClick: () => void; onEdit: () => void; onDelete: () => void
}) {
  const title = cas.case_title || cas.title || "Caso sin título"
  const person = cas.person_name || cas.person_key || null

  return (
    <div onClick={onClick}
      className="group bg-card rounded-2xl border border-border p-5 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#0F1F63] leading-snug">{title}</p>
            {person && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <User className="w-3 h-3" /> {person}
              </p>
            )}
            {cas.summary && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-secondary/30 rounded-lg px-2.5 py-1.5">{cas.summary}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={cas.status} />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-secondary transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={onDelete} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444] transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {cas.created_at ? new Date(cas.created_at).toLocaleDateString("es-PE", { day:"numeric", month:"short", year:"numeric" }) : ""}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ cas, onClose, onEdit, onDelete }: {
  cas: CaseRow; onClose: () => void; onEdit: () => void; onDelete: () => void
}) {
  const title = cas.case_title || cas.title || "Caso sin título"
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
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {(cas.person_name || cas.person_key) && (
            <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3">
              <User className="w-4 h-4 text-[#7C3AED]" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Persona involucrada</p>
                <p className="text-sm font-semibold text-[#0F1F63]">{cas.person_name || cas.person_key}</p>
                {cas.person_type && <p className="text-xs text-muted-foreground">{cas.person_type}</p>}
              </div>
            </div>
          )}
          {cas.summary && (
            <div className="bg-secondary/40 rounded-xl p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Resumen</p>
              <p className="text-sm text-[#0F1F63] leading-relaxed">{cas.summary}</p>
            </div>
          )}
          {cas.created_at && (
            <p className="text-xs text-muted-foreground">
              Abierto el {new Date(cas.created_at).toLocaleDateString("es-PE", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={() => { onEdit(); onClose() }}
            className="flex-1 h-10 rounded-xl bg-[#0F1F63] text-white text-sm font-bold hover:bg-[#1a2f7a] transition-colors flex items-center justify-center gap-2">
            <Pencil className="w-4 h-4" /> Editar
          </button>
          <button onClick={() => { onDelete(); onClose() }}
            className="h-10 w-10 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Form Modal ────────────────────────────────────────────────────────────────
function FormModal({ cas, onClose, onSave }: {
  cas?: CaseRow; onClose: () => void; onSave: (data: any) => Promise<void>
}) {
  const [title, setTitle]   = useState(cas?.case_title || cas?.title || "")
  const [person, setPerson] = useState(cas?.person_name || cas?.person_key || "")
  const [summary, setSumm]  = useState(cas?.summary || "")
  const [status, setStatus] = useState(cas?.status || "open")
  const [saving, setSaving] = useState(false)

  const handle = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), case_title: title.trim(), person_name: person.trim() || null, person_key: person.trim() || null, summary: summary.trim() || null, status })
    setSaving(false); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-bold text-[#0F1F63]">{cas ? "Editar caso" : "Nuevo caso"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Título del caso *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
              placeholder="Ej: Contrato de arrendamiento — García"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Persona involucrada</label>
            <input value={person} onChange={e => setPerson(e.target.value)}
              placeholder="Nombre del cliente, contraparte, etc."
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Resumen</label>
            <textarea value={summary} onChange={e => setSumm(e.target.value)} rows={3}
              placeholder="Descripción del caso, contexto importante..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Estado</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => {
                const Icon = s.icon
                return (
                  <button key={s.v} onClick={() => setStatus(s.v)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${status === s.v ? `${s.bg} ${s.border}` : "border-border bg-background text-muted-foreground"}`}
                    style={status === s.v ? { color: s.color } : {}}>
                    <Icon className="w-3.5 h-3.5" /> {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">Cancelar</button>
          <button onClick={handle} disabled={saving || !title.trim()}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : cas ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {cas ? "Guardar" : "Crear caso"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CasosPage() {
  const [loading, setLoading] = useState(true)
  const [cases, setCases]     = useState<CaseRow[]>([])
  const [clientId, setClientId] = useState("")
  const [search, setSearch]   = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [detail, setDetail]   = useState<CaseRow | null>(null)
  const [editing, setEditing] = useState<CaseRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [toast, setToast]     = useState<{ open: boolean; msg: string; type: "success"|"error"|"info" }>({ open: false, msg: "", type: "info" })

  const show = (msg: string, type: typeof toast.type = "info") => setToast({ open: true, msg, type })

  const load = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId(); setClientId(cid)
      const { data, error } = await supabase.from("cases").select("*").eq("client_id", cid).order("created_at", { ascending: false })
      if (error) throw error
      setCases((data || []) as CaseRow[])
    } catch (err: any) { show(err.message || "Error al cargar.", "error") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => cases.filter(c => {
    const q = search.toLowerCase()
    const matchQ = !q || (c.case_title || c.title || "").toLowerCase().includes(q) || (c.person_name || "").toLowerCase().includes(q)
    const matchS = !filterStatus || (c.status || "open") === filterStatus
    return matchQ && matchS
  }), [cases, search, filterStatus])

  const handleCreate = async (data: any) => {
    const { error } = await supabase.from("cases").insert({ client_id: clientId, ...data, created_at: new Date().toISOString() })
    if (error) throw error
    show("Caso creado.", "success"); await load()
  }

  const handleUpdate = async (data: any) => {
    if (!editing) return
    const { error } = await supabase.from("cases").update({ ...data, updated_at: new Date().toISOString() }).eq("id", editing.id)
    if (error) throw error
    show("Caso actualizado.", "success"); await load()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este caso?")) return
    const { error } = await supabase.from("cases").delete().eq("id", id)
    if (error) { show("Error al eliminar.", "error"); return }
    show("Caso eliminado.", "success"); setCases(prev => prev.filter(c => c.id !== id))
  }

  const counts = useMemo(() => Object.fromEntries(STATUSES.map(s => [s.v, cases.filter(c => (c.status || "open") === s.v).length])), [cases])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Casos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cases.length} casos en total · {counts["open"] || 0} abiertos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setCreating(true)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nuevo caso
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar casos..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterStatus("")}
            className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${!filterStatus ? "bg-[#0F1F63] text-white border-transparent" : "border-border bg-background text-muted-foreground"}`}>
            Todos ({cases.length})
          </button>
          {STATUSES.map(s => (
            <button key={s.v} onClick={() => setFilterStatus(s.v)}
              className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s.v ? `${s.bg} ${s.border}` : "border-border bg-background text-muted-foreground"}`}
              style={filterStatus === s.v ? { color: s.color } : {}}>
              {s.label} ({counts[s.v] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Cargando casos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="font-semibold text-[#0F1F63]">{search || filterStatus ? "Sin resultados" : "Sin casos"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {!search && !filterStatus ? "Crea tu primer caso o dile a Operaly por WhatsApp que lo guarde" : "Prueba con otros filtros"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {filtered.map(cas => (
            <CaseCard key={cas.id} cas={cas}
              onClick={() => setDetail(cas)}
              onEdit={() => setEditing(cas)}
              onDelete={() => handleDelete(cas.id)} />
          ))}
        </div>
      )}

      {/* Modals */}
      {creating && <FormModal onClose={() => setCreating(false)} onSave={handleCreate} />}
      {detail && !editing && (
        <DetailModal cas={detail} onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null) }}
          onDelete={() => { handleDelete(detail.id); setDetail(null) }} />
      )}
      {editing && <FormModal cas={editing} onClose={() => setEditing(null)} onSave={handleUpdate} />}

      <AppToast open={toast.open} message={toast.msg} type={toast.type} onClose={() => setToast(p => ({...p,open:false}))} />
    </div>
  )
}
