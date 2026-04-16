"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Mail, Phone, Plus, RefreshCw, Save, Search, Users, X } from "lucide-react"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { labelForLanguage, normalizeInternationalPhone } from "@/lib/runtime-locale"
import { supabase } from "@/lib/supabase"

type ContactRow = {
  id: string
  name: string
  phone: string | null
  email?: string | null
  phone_normalized?: string | null
  phone_validation_status?: string | null
  relationship?: string | null
  notes?: string | null
  birthday?: string | null
  company?: string | null
  job_title?: string | null
  source?: string | null
  sync_status?: string | null
  external_source?: string | null
  last_synced_at?: string | null
  created_at: string
}

type ContactForm = {
  name: string
  phone: string
  relationship: string
  notes: string
  birthday: string
}

type GoogleContactsProductState = {
  enabled?: boolean | null
  sync_status?: string | null
  last_synced_at?: string | null
  last_error?: string | null
}

type GoogleContactsStatusPayload = {
  ok?: boolean
  google_enabled?: boolean
  capability?: {
    google_enabled?: boolean
  }
  connection?: {
    authorized_products?: string[] | null
  } | null
  products?: {
    contacts?: GoogleContactsProductState
  } | null
  contacts?: GoogleContactsProductState
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

function sourceLabel(value?: string | null) {
  const normalized = String(value || "internal").toLowerCase()
  if (normalized.includes("merge")) return "Fusionado"
  if (normalized.includes("google")) return "Google"
  return "Operaly"
}

function sourceClasses(value?: string | null) {
  const normalized = String(value || "internal").toLowerCase()
  if (normalized.includes("merge")) return "border-violet-200 bg-violet-50 text-violet-700"
  if (normalized.includes("google")) return "border-sky-200 bg-sky-50 text-sky-700"
  return "border-slate-200 bg-slate-50 text-slate-600"
}

function syncLabel(value?: string | null) {
  const normalized = String(value || "").toLowerCase()
  if (!normalized) return "Sin sync"
  if (normalized.includes("ok") || normalized.includes("sync")) return "Sincronizado"
  if (normalized.includes("pending")) return "Pendiente"
  if (normalized.includes("error") || normalized.includes("fail")) return "Con conflicto"
  return normalized.replace(/_/g, " ")
}

function MetricCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string
  value: string | number
  caption: string
  tone?: "default" | "sky" | "amber" | "emerald"
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-200 bg-sky-50"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50"
        : tone === "emerald"
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#0F1F63]">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{caption}</p>
    </div>
  )
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
  const [contactsBridgeStatus, setContactsBridgeStatus] = useState<"active" | "pending" | "base_only">("base_only")
  const [googleContactsConnected, setGoogleContactsConnected] = useState(false)
  const [googleContactsSyncStatus, setGoogleContactsSyncStatus] = useState("")
  const [googleContactsAction, setGoogleContactsAction] = useState<string | null>(null)
  const [googleContactsMessage, setGoogleContactsMessage] = useState("")
  const [googleContactsError, setGoogleContactsError] = useState("")

  const loadGoogleContactsStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/google/status", { method: "GET", cache: "no-store" })
      const payload = (await response.json().catch(() => ({}))) as GoogleContactsStatusPayload
      if (!response.ok) throw new Error(String((payload as any)?.error || "No se pudo consultar Google Contacts."))
      const productState = payload?.products?.contacts || payload?.contacts || null
      const authorizedProducts = payload?.connection?.authorized_products || []
      const connected = Boolean(productState?.enabled) || authorizedProducts.includes("contacts")
      setGoogleContactsConnected(connected)
      setGoogleContactsSyncStatus(String(productState?.sync_status || ""))
      setGoogleContactsError(String(productState?.last_error || ""))
    } catch (error) {
      console.error("No se pudo leer el estado de Google Contacts:", error)
    }
  }, [])

  const loadContacts = useCallback(async (nextClientId?: string) => {
    const resolvedClientId = nextClientId || clientId
    if (!resolvedClientId) return
    setLoading(true)
    const extendedResponse = await supabase
      .from("contacts")
      .select("id,name,phone,email,phone_normalized,phone_validation_status,relationship,notes,birthday,company,job_title,source,sync_status,external_source,last_synced_at,created_at")
      .eq("client_id", resolvedClientId)
      .order("name", { ascending: true })
    if (!extendedResponse.error) {
      const rows = (extendedResponse.data || []) as ContactRow[]
      setContacts(rows)
      setContactsBridgeStatus(rows.some((contact) => String(contact.source || "").toLowerCase().includes("google") || String(contact.source || "").toLowerCase().includes("merge")) ? "active" : "pending")
      setLoading(false)
      return
    }

    const baseResponse = await supabase
      .from("contacts")
      .select("id,name,phone,phone_normalized,phone_validation_status,relationship,notes,birthday,created_at")
      .eq("client_id", resolvedClientId)
      .order("name", { ascending: true })

    setContacts(((baseResponse.data || []) as ContactRow[]).map((contact) => ({
      ...contact,
      email: null,
      company: null,
      job_title: null,
      source: "internal",
      sync_status: null,
      external_source: null,
      last_synced_at: null,
    })))
    setContactsBridgeStatus("base_only")
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
        await Promise.all([loadContacts(currentClientId), loadGoogleContactsStatus()])
      })
      .catch(console.error)
  }, [loadContacts, loadGoogleContactsStatus])

  useEffect(() => {
    if (!clientId) return
    const channel = supabase
      .channel(`contacts-rt-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts", filter: `client_id=eq.${clientId}` }, () => loadContacts())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, loadContacts])

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase()
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(normalizedSearch) ||
      String(contact.phone || "").includes(search) ||
      String(contact.relationship || "").toLowerCase().includes(normalizedSearch) ||
      String(contact.email || "").toLowerCase().includes(normalizedSearch) ||
      String(contact.company || "").toLowerCase().includes(normalizedSearch)
    )
  }, [contacts, search])

  const birthdaysCount = contacts.filter((contact) => Boolean(contact.birthday)).length
  const googleContactsCount = contacts.filter((contact) => String(contact.source || "").toLowerCase().includes("google")).length
  const mergedContactsCount = contacts.filter((contact) => String(contact.source || "").toLowerCase().includes("merge")).length
  const emailContactsCount = contacts.filter((contact) => Boolean(contact.email)).length
  const syncedContactsCount = contacts.filter((contact) => {
    const normalized = String(contact.sync_status || "").toLowerCase()
    return normalized.includes("ok") || normalized.includes("sync")
  }).length

  async function connectGoogleContacts() {
    setGoogleContactsAction("connect")
    setGoogleContactsMessage("")
    setGoogleContactsError("")
    try {
      const response = await fetch("/api/google/contacts/connect", { method: "GET", cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String(payload?.error || payload?.detail || "No se pudo iniciar Google Contacts."))
      const authUrl = String(payload?.auth_url || "")
      if (!authUrl) throw new Error("Google no devolvio una URL de autorizacion para Contacts.")
      window.location.href = authUrl
    } catch (error) {
      setGoogleContactsError(error instanceof Error ? error.message : "No se pudo iniciar Google Contacts.")
    } finally {
      setGoogleContactsAction(null)
    }
  }

  async function syncGoogleContacts() {
    setGoogleContactsAction("sync")
    setGoogleContactsMessage("")
    setGoogleContactsError("")
    try {
      const response = await fetch("/api/google/contacts/sync", { method: "POST" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String(payload?.error || payload?.detail || "No se pudo sincronizar Google Contacts."))
      setGoogleContactsMessage("Google Contacts ya se sincronizo con tu base de Operaly.")
      await Promise.all([loadContacts(), loadGoogleContactsStatus()])
    } catch (error) {
      setGoogleContactsError(error instanceof Error ? error.message : "No se pudo sincronizar Google Contacts.")
    } finally {
      setGoogleContactsAction(null)
    }
  }

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
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-[#3B82F6]" />
          <p className="text-xs text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Contactos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} · sincronizacion en tiempo real
          </p>
          <p className="mt-1 text-xs text-slate-400">Base: {countryCode} · idioma operativo {labelForLanguage(preferredLanguage)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {birthdaysCount} con cumpleanos registrado · listos para agenda, Gmail, casos y automatizaciones utiles
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadContacts()} className="rounded-xl border border-[#E2E8F0] bg-white p-2 hover:bg-[#F1F5F9]">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB]"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard
          label="contactos base"
          value={contacts.length}
          caption="Agenda, casos, archivos y correo deben resolver personas desde aqui."
        />
        <MetricCard
          label="google / fusionados"
          value={googleContactsCount + mergedContactsCount}
          caption={`${googleContactsCount} Google puros · ${mergedContactsCount} fusionados`}
          tone="sky"
        />
        <MetricCard
          label="cumpleanos / correo"
          value={birthdaysCount}
          caption={`${emailContactsCount} con email y listos para Gmail operativo`}
          tone="amber"
        />
        <MetricCard
          label="sincronizados"
          value={syncedContactsCount}
          caption="Senal util para agenda, llamadas, casos y envios desde WhatsApp."
          tone="emerald"
        />
      </div>

      <div className="rounded-2xl border border-[#1A73E8]/15 bg-gradient-to-r from-[#1A73E8]/5 via-white to-[#34A853]/5 px-4 py-3 text-sm text-slate-600">
        Cuando Google Contacts quede conectado, esta base debe distinguir claramente contactos internos de Operaly, contactos traidos desde Google y contactos fusionados. Desde aqui se prepara el puente para agenda, Gmail, llamadas, archivos y casos.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F1F63]">Google Contacts</p>
            <p className="mt-1 text-sm text-slate-600">
              Aqui debe quedar visible si la libreta Google ya esta conectada, si falta conceder el scope o si solo falta correr la sincronizacion real hacia Operaly.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Estado actual:{" "}
              {googleContactsConnected
                ? contactsBridgeStatus === "active"
                  ? "conectado y reflejado en esta base"
                  : "conectado, pero todavia falta sync visible"
                : "todavia no conectado"}
              {googleContactsSyncStatus ? ` · sync: ${syncLabel(googleContactsSyncStatus)}` : ""}
            </p>
            {googleContactsMessage && <p className="mt-2 text-xs text-emerald-700">{googleContactsMessage}</p>}
            {googleContactsError && <p className="mt-2 text-xs text-red-700">{googleContactsError}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={connectGoogleContacts}
              disabled={googleContactsAction !== null}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-60"
            >
              {googleContactsAction === "connect" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              {googleContactsConnected ? "Reconectar Contacts" : "Conectar Contacts"}
            </button>
            <button
              onClick={syncGoogleContacts}
              disabled={googleContactsAction !== null || !googleContactsConnected}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
            >
              {googleContactsAction === "sync" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {contactsBridgeStatus === "active" ? "Re-sincronizar" : "Sincronizar"}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          contactsBridgeStatus === "active"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : contactsBridgeStatus === "pending"
              ? "border-sky-200 bg-sky-50 text-sky-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {contactsBridgeStatus === "active"
          ? "El puente con Google Contacts ya deja senales visibles en esta base. Aqui deberias empezar a ver contactos Google o fusionados."
          : contactsBridgeStatus === "pending"
            ? googleContactsConnected
              ? "Google Contacts ya esta conectado, pero todavia falta completar o refrescar la sync para ver personas Google o fusionadas en esta vista."
              : "Tu libreta interna ya esta lista, pero el backend todavia no esta reflejando contactos Google sincronizados en esta vista."
            : "Mostrando la base interna de Operaly. Si el backend de Google Contacts aun no expone columnas de sync, esta pantalla ya no se rompe y sigue mostrando los contactos reales del usuario."}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, telefono, email, empresa o relacion..."
          className="h-10 w-full rounded-xl border border-[#D9E1EC] bg-white pl-9 pr-4 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">{editingId ? "Editar contacto" : "Nuevo contacto"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Nombre *</label>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ej: Cole Viajero"
                autoFocus
                className="h-9 w-full rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
                onKeyDown={(event) => event.key === "Enter" && saveContact()}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Telefono</label>
              <input
                value={form.phone}
                onChange={(event) => {
                  const nextPhone = event.target.value
                  setForm((prev) => ({ ...prev, phone: nextPhone }))
                  const preview = normalizeInternationalPhone(nextPhone, countryCode)
                  setPhoneHelper(preview.helperText)
                }}
                placeholder="+51 999 123 456"
                className="h-9 w-full rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
              />
              {phoneHelper && <p className="mt-1 text-[11px] text-slate-500">{phoneHelper}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Relacion</label>
              <input
                value={form.relationship}
                onChange={(event) => setForm((prev) => ({ ...prev, relationship: event.target.value }))}
                placeholder="Ej: proveedor, amigo"
                className="h-9 w-full rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Cumpleanos</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(event) => setForm((prev) => ({ ...prev, birthday: event.target.value }))}
                className="h-9 w-full rounded-xl border border-[#D9E1EC] px-3 text-sm focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Notas</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full resize-none rounded-xl border border-[#D9E1EC] px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveContact}
              disabled={saving || !form.name.trim()}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingId ? "Guardar" : "Agregar"}
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="h-9 rounded-xl border border-[#E2E8F0] px-4 text-sm hover:bg-[#F1F5F9]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">¿Eliminar este contacto? No se puede deshacer.</p>
          <div className="flex gap-2">
            <button
              onClick={() => deleteContact(confirmDelete)}
              className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
            >
              Eliminar
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium hover:bg-[#F1F5F9]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9E1EC] py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-[#D9E1EC]" />
          <p className="font-medium text-[#64748B]">{search ? "Sin resultados" : "Sin contactos guardados"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? `No hay coincidencias para "${search}"` : "El dashboard y WhatsApp compartiran aqui todos tus contactos validos."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact) => (
            <div key={contact.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-all hover:border-[#BFDBFE] hover:shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 text-sm font-bold text-[#3B82F6]">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#0F1F63]">{contact.name}</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${sourceClasses(contact.source)}`}>
                      {sourceLabel(contact.source)}
                    </span>
                    {contact.relationship && (
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#64748B]">{contact.relationship}</span>
                    )}
                    {contact.sync_status && (
                      <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs text-emerald-700">{syncLabel(contact.sync_status)}</span>
                    )}
                  </div>

                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="mt-0.5 flex items-center gap-1 text-sm text-[#3B82F6] hover:underline">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  )}

                  {contact.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </p>
                  )}

                  {contact.phone_normalized && contact.phone_normalized !== contact.phone && (
                    <p className="mt-1 text-[11px] text-slate-400">Normalizado: {contact.phone_normalized}</p>
                  )}
                  {contact.phone_validation_status && <p className="mt-1 text-[11px] text-slate-400">Estado: {contact.phone_validation_status}</p>}
                  {contact.birthday && <p className="mt-1 text-[11px] text-slate-500">Cumpleanos: {birthdayLabel(contact.birthday)}</p>}
                  {(contact.job_title || contact.company) && (
                    <p className="mt-1 text-[11px] text-slate-500">{[contact.job_title, contact.company].filter(Boolean).join(" · ")}</p>
                  )}
                  {contact.last_synced_at && (
                    <p className="mt-1 text-[11px] text-slate-400">Ultima sync: {new Date(contact.last_synced_at).toLocaleString("es-PE")}</p>
                  )}
                  {contact.external_source && <p className="mt-1 text-[11px] text-slate-400">Origen externo: {contact.external_source}</p>}
                  {contact.notes && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{contact.notes}</p>}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => openEdit(contact)}
                      className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#4A5568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                    >
                      Editar
                    </button>
                    {contact.phone && (
                      <button
                        onClick={() => window.open(`tel:${contact.phone}`)}
                        className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#4A5568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                      >
                        Llamar
                      </button>
                    )}
                    {contact.phone && (
                      <button
                        onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, "")}`)}
                        className="rounded-xl bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2563EB]"
                      >
                        WhatsApp
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(contact.id)}
                      className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-100"
                    >
                      Eliminar
                    </button>
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
