"use client"

import { useCallback, useEffect, useState } from "react"
import { Phone, Plus, RefreshCw, Save, Search, Trash2, Users, X } from "lucide-react"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { labelForLanguage, normalizeInternationalPhone } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

type ContactRow = {
  id: string
  name: string
  phone: string
  phone_normalized?: string | null
  phone_validation_status?: string | null
  relationship?: string | null
  notes?: string | null
  birthday?: string | null
  created_at: string
}

type ContactForm = {
  name: string
  phone: string
  relationship: string
  notes: string
  birthday: string
}

const BLANK_FORM: ContactForm = { name: "", phone: "", relationship: "", notes: "", birthday: "" }

function toBirthdayInput(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function birthdayLabel(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "long" })
}

export default function ContactosPage() {
  const [clientId, setClientId] = useState("")
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContactForm>(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState("PE")
  const [preferredLanguage, setPreferredLanguage] = useState("es")
  const [phoneHelper, setPhoneHelper] = useState("")

  const loadContacts = useCallback(async (nextClientId?: string) => {
    const resolvedClientId = nextClientId || clientId
    if (!resolvedClientId) return
    setLoading(true)
    const { data } = await supabase
      .from("contacts")
      .select("id,name,phone,phone_normalized,phone_validation_status,relationship,notes,birthday,created_at")
      .eq("client_id", resolvedClientId)
      .order("name", { ascending: true })
    setContacts((data || []) as ContactRow[])
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    getCurrentClientId()
      .then(async (currentClientId) => {
        setClientId(currentClientId)
        const { data: client } = await supabase
          .from("clients")
          .select("country_code,preferred_language,language")
          .eq("id", currentClientId)
          .maybeSingle()
        setCountryCode(String(client?.country_code || "PE").toUpperCase())
        setPreferredLanguage(String(client?.preferred_language || client?.language || "es"))
        await loadContacts(currentClientId)
      })
      .catch(console.error)
  }, [loadContacts])

  useEffect(() => {
    if (!clientId) return
    const channel = supabase
      .channel(`contacts-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts", filter: `client_id=eq.${clientId}` }, () => loadContacts())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId, loadContacts])

  const filtered = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    (contact.phone || "").includes(search) ||
    (contact.relationship || "").toLowerCase().includes(search.toLowerCase())
  )

  const birthdaysCount = contacts.filter((contact) => Boolean(contact.birthday)).length

  function openAdd() {
    setForm(BLANK_FORM)
    setEditingId(null)
    setPhoneHelper("")
    setShowForm(true)
  }

  function openEdit(contact: ContactRow) {
    setForm({
      name: contact.name,
      phone: contact.phone || "",
      relationship: contact.relationship || "",
      notes: contact.notes || "",
      birthday: toBirthdayInput(contact.birthday),
    })
    setPhoneHelper(contact.phone_normalized ? `Operaly ya lo tiene normalizado como ${contact.phone_normalized}.` : "")
    setEditingId(contact.id)
    setShowForm(true)
  }

  async function saveContact() {
    if (!form.name.trim() || !clientId) return
    setSaving(true)
    try {
      const normalizedPhone = normalizeInternationalPhone(form.phone.trim(), countryCode)
      if (form.phone.trim() && !normalizedPhone.ok) {
        alert(normalizedPhone.helperText)
        return
      }

      const payload = {
        name: form.name.trim(),
        phone: normalizedPhone.normalized || form.phone.trim() || null,
        phone_normalized: normalizedPhone.normalized || null,
        phone_validation_status: normalizedPhone.normalized ? "normalized" : null,
        relationship: form.relationship.trim() || null,
        notes: form.notes.trim() || null,
        birthday: form.birthday || null,
      }

      if (editingId) {
        await supabase.from("contacts").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingId)
      } else {
        await supabase.from("contacts").insert({ client_id: clientId, ...payload })
      }

      setShowForm(false)
      setEditingId(null)
      setForm(BLANK_FORM)
      setPhoneHelper("")
      await loadContacts()
    } finally {
      setSaving(false)
    }
  }

  async function deleteContact(id: string) {
    await supabase.from("contacts").delete().eq("id", id)
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
    setConfirmDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#3B82F6]" />
          <p className="text-xs text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Contactos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contacto{contacts.length !== 1 ? "s" : ""} · sincronización en tiempo real</p>
          <p className="text-xs text-slate-400 mt-1">Base: {countryCode} · idioma operativo {labelForLanguage(preferredLanguage)}</p>
          <p className="text-xs text-slate-500 mt-1">{birthdaysCount} con cumpleaños registrado · listos para automatizaciones útiles por WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadContacts()} className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9]"><RefreshCw className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />Agregar</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, teléfono o relación..." className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 bg-white" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
      </div>

      {showForm && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-[#0F1F63]">{editingId ? "Editar contacto" : "Nuevo contacto"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Ej: Cole Viajero" autoFocus className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]" onKeyDown={(event) => event.key === "Enter" && saveContact()} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Teléfono</label>
              <input value={form.phone} onChange={(event) => {
                const nextPhone = event.target.value
                setForm((prev) => ({ ...prev, phone: nextPhone }))
                const preview = normalizeInternationalPhone(nextPhone, countryCode)
                setPhoneHelper(preview.helperText)
              }} placeholder="+51 999 123 456" className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]" />
              {phoneHelper && <p className="mt-1 text-[11px] text-slate-500">{phoneHelper}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Relación</label>
              <input value={form.relationship} onChange={(event) => setForm((prev) => ({ ...prev, relationship: event.target.value }))} placeholder="Ej: proveedor, amigo" className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cumpleaños</label>
              <input type="date" value={form.birthday} onChange={(event) => setForm((prev) => ({ ...prev, birthday: event.target.value }))} className="w-full h-9 px-3 rounded-xl border border-[#D9E1EC] text-sm focus:outline-none focus:border-[#3B82F6]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
              <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notas adicionales..." rows={2} className="w-full px-3 py-2 rounded-xl border border-[#D9E1EC] text-sm resize-none focus:outline-none focus:border-[#3B82F6]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveContact} disabled={saving || !form.name.trim()} className="flex-1 h-9 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" />{editingId ? "Guardar" : "Agregar"}</>}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="h-9 px-4 rounded-xl border border-[#E2E8F0] text-sm hover:bg-[#F1F5F9]"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-700 font-medium">¿Eliminar este contacto? No se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={() => deleteContact(confirmDelete)} className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-medium hover:bg-red-600">Eliminar</button>
            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium hover:bg-[#F1F5F9]">Cancelar</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#D9E1EC] rounded-2xl">
          <Users className="w-10 h-10 mx-auto mb-3 text-[#D9E1EC]" />
          <p className="font-medium text-[#64748B]">{search ? "Sin resultados" : "Sin contactos guardados"}</p>
          <p className="text-sm text-muted-foreground mt-1">{search ? `No hay coincidencias para "${search}"` : "El dashboard y WhatsApp compartirán aquí todos tus contactos válidos."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact) => (
            <div key={contact.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#BFDBFE] hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0 text-sm font-bold text-[#3B82F6]">{contact.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#0F1F63]">{contact.name}</p>
                    {contact.relationship && <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">{contact.relationship}</span>}
                  </div>
                  {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-1 mt-0.5 text-sm text-[#3B82F6] hover:underline"><Phone className="w-3 h-3" />{contact.phone}</a>}
                  {contact.phone_normalized && contact.phone_normalized !== contact.phone && <p className="text-[11px] text-slate-400 mt-1">Normalizado: {contact.phone_normalized}</p>}
                  {contact.phone_validation_status && <p className="text-[11px] text-slate-400 mt-1">Estado: {contact.phone_validation_status}</p>}
                  {contact.birthday && <p className="text-[11px] text-slate-500 mt-1">Cumpleaños: {birthdayLabel(contact.birthday)}</p>}
                  {contact.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{contact.notes}</p>}
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    <button onClick={() => openEdit(contact)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-[#E2E8F0] text-[#4A5568] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] hover:text-[#3B82F6]">Editar</button>
                    {contact.phone && <button onClick={() => window.open(`tel:${contact.phone}`)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-[#E2E8F0] text-[#4A5568] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] hover:text-[#3B82F6]">Llamar</button>}
                    {contact.phone && <button onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, "")}`)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB]">WhatsApp</button>}
                    <button onClick={() => setConfirmDelete(contact.id)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100">Eliminar</button>
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
