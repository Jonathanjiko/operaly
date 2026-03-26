"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

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
      alert(err.message || "No se pudieron cargar los contactos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim()) {
      alert("Ingresa nombre y teléfono.")
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

      setName("")
      setPhone("")
      setRelationship("")
      setNotes("")
      await loadContacts()
    } catch (err: any) {
      alert(err.message || "No se pudo crear el contacto.")
    } finally {
      setSaving(false)
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
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar el contacto.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Contactos</h1>
          <p className="text-muted-foreground mt-1">
            Crea, consulta y elimina tus contactos.
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
        ) : contacts.length === 0 ? (
          <div className="p-8 text-muted-foreground">
            Todavía no tienes contactos.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
              >
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

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
