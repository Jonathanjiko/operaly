"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, RefreshCw, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type ContactRow = {
  id: string
  client_id: string
  name: string | null
  phone: string | null
  relationship: string | null
  notes: string | null
  preferred_language: string | null
  whatsapp_opt_in: boolean | null
  created_at: string | null
}

export default function ProfessionalContactsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contacts, setContacts] = useState<ContactRow[]>([])

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [relationship, setRelationship] = useState("")
  const [notes, setNotes] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editRelationship, setEditRelationship] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")
  const [toastMessage, setToastMessage] = useState("")

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message)
    setToastType(type)
    setToastOpen(true)
  }

  const closeToast = () => {
    setToastOpen(false)
    setToastMessage("")
  }

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
      return bDate - aDate
    })
  }, [contacts])

  const loadContacts = async () => {
    setLoading(true)

    try {
      const clientId = await getCurrentClientId()

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setContacts((data || []) as ContactRow[])
    } catch (err: any) {
      showToast(err.message || "No se pudieron cargar los contactos.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const resetCreateForm = () => {
    setName("")
    setPhone("")
    setRelationship("")
    setNotes("")
  }

  const startEditing = (contact: ContactRow) => {
    setEditingId(contact.id)
    setEditName(contact.name || "")
    setEditPhone(contact.phone || "")
    setEditRelationship(contact.relationship || "")
    setEditNotes(contact.notes || "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName("")
    setEditPhone("")
    setEditRelationship("")
    setEditNotes("")
  }

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim()) {
      showToast("Ingresa nombre y teléfono.", "error")
      return
    }

    setSaving(true)

    try {
      const clientId = await getCurrentClientId()

      const { error } = await supabase.from("contacts").insert({
        client_id: clientId,
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || null,
        notes: notes.trim() || null,
        whatsapp_opt_in: true,
      })

      if (error) {
        throw error
      }

      resetCreateForm()
      await loadContacts()
      showToast("Contacto creado correctamente.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo crear el contacto.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editPhone.trim()) {
      showToast("Nombre y teléfono son obligatorios.", "error")
      return
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: editName.trim(),
          phone: editPhone.trim(),
          relationship: editRelationship.trim() || null,
          notes: editNotes.trim() || null,
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      cancelEditing()
      await loadContacts()
      showToast("Contacto actualizado.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo actualizar el contacto.", "error")
    }
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Eliminar este contacto?")

    if (!ok) {
      return
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      await loadContacts()
      showToast("Contacto eliminado.", "success")
    } catch (err: any) {
      showToast(err.message || "No se pudo eliminar el contacto.", "error")
    }
  }

  return (
    <>
      <AppToast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={closeToast}
      />

      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1F63]">Contactos</h1>
            <p className="text-muted-foreground mt-1">
              Crea, edita y elimina tus contactos.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={loadContacts}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#0F1F63] mb-5">
            Nuevo contacto
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
            />

            <Input
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-xl"
            />

            <Input
              placeholder="Relación"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="h-12 rounded-xl"
            />

            <Input
              placeholder="Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            className="mt-5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
            onClick={handleCreate}
            disabled={saving}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Crear contacto"}
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg font-semibold text-[#0F1F63]">
              Lista de contactos
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-muted-foreground">Cargando contactos...</div>
          ) : sortedContacts.length === 0 ? (
            <div className="p-8 text-muted-foreground">
              Todavía no tienes contactos.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="px-6 py-5 hover:bg-secondary/20 transition-colors"
                >
                  {editingId === contact.id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-12 rounded-xl"
                        />

                        <Input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="h-12 rounded-xl"
                        />

                        <Input
                          value={editRelationship}
                          onChange={(e) => setEditRelationship(e.target.value)}
                          className="h-12 rounded-xl"
                        />

                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
                          onClick={() => handleSaveEdit(contact.id)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>

                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={cancelEditing}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#0F1F63]">
                          {contact.name || "Sin nombre"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contact.phone || "Sin teléfono"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contact.relationship || "Sin relación"} ·{" "}
                          {contact.notes || "Sin notas"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => startEditing(contact)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
