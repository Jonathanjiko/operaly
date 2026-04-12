"use client"

import { useEffect, useState, useCallback } from "react"
import { User, Phone, Plus, Pencil, Trash2, RefreshCw, X, Save, Search, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type ContactRow = {
  id: string
  name: string
  phone: string
  relationship?: string
  notes?: string
  birthday?: string
  created_at: string
}

type ContactForm = {
  name: string
  phone: string
  relationship: string
  notes: string
}

const BLANK_FORM: ContactForm = { name: "", phone: "", relationship: "", notes: "" }

function WAButtonBar({ buttons }: { buttons: { label: string; danger?: boolean; primary?: boolean; onClick: () => void }[] }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
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

export default function ContactosPage() {
  const [clientId, setClientId]     = useState("")
  const [contacts, setContacts]     = useState<ContactRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState<ContactForm>(BLANK_FORM)
  const [saving, setSaving]         = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { getCurrentClientId().then(cid => { setClientId(cid); loadContacts(cid) }).catch(console.error) }, [])

  const loadContacts = useCallback(async (cid?: string) => {
    const id = cid || clientId
    if (!id) return
    setLoading(true)
    const { data } = await supabase.from("contacts").select("id,name,phone,relationship,notes,birthday,created_at")
      .eq("client_id", id).order("name", { ascending: true })
    setContacts((data || []) as ContactRow[])
    setLoading(false)
  }, [clientId])

  // Real-time sync
  useEffect(() => {
    if (!clientId) return
    const ch = supabase.channel(`contacts-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts", filter: `client_id=eq.${clientId}` },
        () => loadContacts())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId, loadContacts])

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search) ||
    (c.relationship || "").toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm(BLANK_FORM); setEditingId(null); setShowForm(true) }
  const openEdit = (c: ContactRow) => {
    setForm({ name: c.name, phone: c.phone || "", relationship: c.relationship || "", notes: c.notes || "" })
    setEditingId(c.id); setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim() || !clientId) return
    setSaving(true)
    try {
      if (editingId) {
        await supabase.from("contacts").update({ name: form.name.trim(), phone: form.phone.trim(), relationship: form.relationship.trim() || null, notes: form.notes.trim() || null, updated_at: new Date().toISOString() }).eq("id", editingId)
      } else {
        let phone = form.phone.trim()
        if (phone && !phone.startsWith("+")) phone = "+51" + phone.replace(/^0/, "")
        await supabase.from("contacts").insert({ client_id: clientId, name: form.name.trim(), phone, relationship: form.relationship.trim() || null, notes: form.notes.trim() || null })
      }
      setShowForm(false); setEditingId(null); setForm(BLANK_FORM)
      await loadContacts()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    await supabase.from("contacts").delete().eq("id", id)
    setContacts(prev => prev.filter(c => c.id !== id))
    setConfirmDelete(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#3B82F6]" />
        <p className="text-xs text-muted-foreground">Cargando contactos...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Contactos</h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} · en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadContacts()} className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-medium transition-all active:scale-95">
            <Plus className="w-4 h-4" />Agregar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o relación..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 bg-white" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-[#0F1F63]">{editingId ? "Editar contacto" : "Nuevo contacto"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Cole Viajero" autoFocus
                className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]"
                onKeyDown={e => e.key === "Enter" && save()} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Teléfono</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+51 999 123 456"
                className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Relación</label>
              <input value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                placeholder="Ej: proveedor, amigo"
                className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notas adicionales..." rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#D9E1EC] text-sm resize-none focus:outline-none focus:border-[#3B82F6]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.name.trim()}
              className="flex-1 h-9 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 active:scale-95">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" />{editingId ? "Guardar" : "Agregar"}</>}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }}
              className="h-9 px-4 rounded-xl border border-[#E2E8F0] text-sm hover:bg-[#F1F5F9] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-700 font-medium">¿Eliminar este contacto? No se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={() => del(confirmDelete)} className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-medium hover:bg-red-600 active:scale-95">Eliminar</button>
            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium hover:bg-[#F1F5F9]">Cancelar</button>
          </div>
        </div>
      )}

      {/* Contacts list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#D9E1EC] rounded-2xl">
          <Users className="w-10 h-10 mx-auto mb-3 text-[#D9E1EC]" />
          <p className="font-medium text-[#64748B]">{search ? "Sin resultados" : "Sin contactos guardados"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? `No hay coincidencias para "${search}"` : 'Di "guarda a [nombre] con número [tel]" por WhatsApp'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#BFDBFE] hover:shadow-sm transition-all duration-200 group">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0 text-sm font-bold text-[#3B82F6]">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#0F1F63]">{c.name}</p>
                    {c.relationship && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">{c.relationship}</span>
                    )}
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 mt-0.5 text-sm text-[#3B82F6] hover:underline">
                      <Phone className="w-3 h-3" />{c.phone}
                    </a>
                  )}
                  {c.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.notes}</p>}

                  {/* WA-style action buttons */}
                  <div className="mt-3">
                    <WAButtonBar buttons={[
                      { label: "✏️ Editar", onClick: () => openEdit(c) },
                      ...(c.phone ? [{ label: "📞 Llamar", onClick: () => window.open(`tel:${c.phone}`) }] : []),
                      ...(c.phone ? [{ label: "💬 WhatsApp", onClick: () => window.open(`https://wa.me/${c.phone.replace(/\D/g, "")}`) }] : []),
                      { label: "🗑️ Eliminar", danger: true, onClick: () => setConfirmDelete(c.id) },
                    ]} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
