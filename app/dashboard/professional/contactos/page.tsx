"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus, Trash2, RefreshCw, Pencil, X, Save,
  Search, Phone, Users, MessageSquare, User,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type ContactRow = {
  id: string; client_id: string; name: string | null; phone: string | null
  relationship: string | null; notes: string | null
  preferred_language: string | null; whatsapp_opt_in: boolean | null; created_at: string | null
}

const COLORS = ["#3B82F6","#7C3AED","#10B981","#F59E0B","#EF4444","#06B6D4","#8B5CF6","#EC4899"]

function initials(name: string | null) {
  if (!name) return "?"
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?"
}

function colorFor(name: string | null) {
  const s = (name || "?").charCodeAt(0) % COLORS.length
  return COLORS[s]
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = "md" }: { name: string | null; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-9 h-9 text-sm" : size === "lg" ? "w-14 h-14 text-xl" : "w-11 h-11 text-base"
  return (
    <div className={`${sz} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: colorFor(name) }}>
      {initials(name)}
    </div>
  )
}

// ── Contact Card ──────────────────────────────────────────────────────────────
function ContactCard({ contact, onClick, onEdit, onDelete }: {
  contact: ContactRow; onClick: () => void; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div onClick={onClick}
      className="group bg-card rounded-2xl border border-border p-4 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start gap-3">
        <Avatar name={contact.name} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#0F1F63] truncate">{contact.name || "Sin nombre"}</p>
          {contact.phone && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {contact.phone}
            </p>
          )}
          {contact.relationship && (
            <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
              {contact.relationship}
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-secondary transition-colors">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 hover:text-[#EF4444] transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {contact.notes && (
        <p className="text-xs text-muted-foreground mt-3 bg-secondary/30 rounded-lg px-3 py-2 line-clamp-2">{contact.notes}</p>
      )}
    </div>
  )
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ contact, onClose, onEdit, onDelete }: {
  contact: ContactRow; onClose: () => void; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Top banner */}
        <div className="h-16 w-full" style={{ backgroundColor: colorFor(contact.name) + "30" }}>
          <div className="absolute top-8 left-6">
            <Avatar name={contact.name} size="lg" />
          </div>
        </div>
        <button onClick={onClose} className="absolute top-3 right-4 w-8 h-8 rounded-xl border border-white/30 bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="pt-12 px-6 pb-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F1F63]">{contact.name || "Sin nombre"}</h2>
            {contact.relationship && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
                {contact.relationship}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {contact.phone && (
              <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3">
                <Phone className="w-4 h-4 text-[#3B82F6]" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Teléfono</p>
                  <p className="text-sm font-semibold text-[#0F1F63]">{contact.phone}</p>
                </div>
                <a href={`https://wa.me/${contact.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                  className="ml-auto h-8 px-3 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                  onClick={e => e.stopPropagation()}>
                  <MessageSquare className="w-3.5 h-3.5" /> WA
                </a>
              </div>
            )}
            {contact.notes && (
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Notas</p>
                <p className="text-sm text-[#0F1F63] leading-relaxed">{contact.notes}</p>
              </div>
            )}
            {contact.created_at && (
              <p className="text-xs text-muted-foreground">
                Contacto desde {new Date(contact.created_at).toLocaleDateString("es-PE", { day:"numeric", month:"long", year:"numeric" })}
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
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
    </div>
  )
}

// ── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ contact, onClose, onSave }: {
  contact?: ContactRow; onClose: () => void; onSave: (data: any) => Promise<void>
}) {
  const [name, setName]           = useState(contact?.name || "")
  const [phone, setPhone]         = useState(contact?.phone || "")
  const [relationship, setRel]    = useState(contact?.relationship || "")
  const [notes, setNotes]         = useState(contact?.notes || "")
  const [saving, setSaving]       = useState(false)

  const handle = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), phone: phone.trim() || null, relationship: relationship.trim() || null, notes: notes.trim() || null })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-bold text-[#0F1F63]">{contact ? "Editar contacto" : "Nuevo contacto"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Preview avatar */}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
            <Avatar name={name || null} size="md" />
            <div>
              <p className="font-semibold text-sm text-[#0F1F63]">{name || "Nombre del contacto"}</p>
              <p className="text-xs text-muted-foreground">{relationship || "Sin relación"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Nombre *</label>
              <input value={name} onChange={e => setName(e.target.value)} autoFocus
                placeholder="Nombre completo"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Teléfono</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+51 999 000 000"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Relación</label>
            <input value={relationship} onChange={e => setRel(e.target.value)}
              placeholder="Ej: Cliente, Proveedor, Familiar, Socio..."
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Información relevante sobre este contacto..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">Cancelar</button>
          <button onClick={handle} disabled={saving || !name.trim()}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : contact ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {contact ? "Guardar" : "Crear contacto"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ContactosPage() {
  const [loading, setLoading]   = useState(true)
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [clientId, setClientId] = useState("")
  const [search, setSearch]     = useState("")
  const [detail, setDetail]     = useState<ContactRow | null>(null)
  const [editing, setEditing]   = useState<ContactRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [toast, setToast]       = useState<{ open: boolean; msg: string; type: "success"|"error"|"info" }>({ open: false, msg: "", type: "info" })

  const show = (msg: string, type: typeof toast.type = "info") => setToast({ open: true, msg, type })

  const load = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId(); setClientId(cid)
      const { data, error } = await supabase.from("contacts").select("*").eq("client_id", cid).order("created_at", { ascending: false })
      if (error) throw error
      setContacts((data || []) as ContactRow[])
    } catch (err: any) { show(err.message || "Error al cargar.", "error") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => contacts.filter(c => {
    const q = search.toLowerCase()
    return !q || (c.name || "").toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.relationship || "").toLowerCase().includes(q)
  }), [contacts, search])

  const handleCreate = async (data: any) => {
    const { error } = await supabase.from("contacts").insert({ client_id: clientId, ...data, created_at: new Date().toISOString() })
    if (error) throw error
    show("Contacto creado.", "success"); await load()
  }

  const handleUpdate = async (data: any) => {
    if (!editing) return
    const { error } = await supabase.from("contacts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", editing.id)
    if (error) throw error
    show("Contacto actualizado.", "success"); await load()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este contacto?")) return
    const { error } = await supabase.from("contacts").delete().eq("id", id)
    if (error) { show("Error al eliminar.", "error"); return }
    show("Contacto eliminado.", "success"); setContacts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Contactos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contactos guardados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setCreating(true)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nuevo contacto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o relación..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Cargando contactos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="font-semibold text-[#0F1F63]">{search ? "Sin resultados" : "Sin contactos"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Prueba con otro término" : "Crea tu primer contacto o dile a Operaly por WhatsApp que guarde uno"}
          </p>
          {!search && (
            <button onClick={() => setCreating(true)}
              className="mt-4 h-9 px-5 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors">
              Crear contacto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(contact => (
            <ContactCard key={contact.id} contact={contact}
              onClick={() => setDetail(contact)}
              onEdit={() => setEditing(contact)}
              onDelete={() => handleDelete(contact.id)} />
          ))}
        </div>
      )}

      {/* Modals */}
      {creating && <FormModal onClose={() => setCreating(false)} onSave={handleCreate} />}
      {detail && !editing && (
        <DetailModal contact={detail} onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null) }}
          onDelete={() => { handleDelete(detail.id); setDetail(null) }} />
      )}
      {editing && <FormModal contact={editing} onClose={() => setEditing(null)} onSave={handleUpdate} />}

      <AppToast open={toast.open} message={toast.msg} type={toast.type} onClose={() => setToast(p => ({...p,open:false}))} />
    </div>
  )
}
