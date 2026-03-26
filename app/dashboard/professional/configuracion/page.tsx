"use client"

import { useEffect, useMemo, useState } from "react"
import { Globe, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type ClientRow = {
  id: string
  name: string | null
  phone: string | null
  phone_normalized: string | null
  profession_code: string | null
  preferred_language: string | null
}

type PreferenceRow = {
  pref_key: string
  pref_value: string | null
}

export default function ProfessionalSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [clientId, setClientId] = useState("")
  const [email, setEmail] = useState("")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [profession, setProfession] = useState("")
  const [language, setLanguage] = useState("es")

  const [tone, setTone] = useState("profesional")
  const [instructions, setInstructions] = useState("")

  // Iniciales para avatar
  const initials = useMemo(() => {
    if (!fullName.trim()) return "OP"

    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }, [fullName])

  // =========================
  // CARGAR DATOS
  // =========================
  const loadData = async () => {
    try {
      const clientId = await getCurrentClientId()
      setClientId(clientId)

      const { data: userData } = await supabase.auth.getUser()
      setEmail(userData.user?.email || "")

      const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single()

      if (client) {
        setFullName(client.name || "")
        setPhone(client.phone_normalized || client.phone || "")
        setProfession(client.profession_code || "")
        setLanguage(client.preferred_language || "es")
      }

      const { data: prefs } = await supabase
        .from("client_preferences")
        .select("pref_key, pref_value")
        .eq("client_id", clientId)

      if (prefs) {
        const tonePref = prefs.find((p) => p.pref_key === "assistant_tone")
        const instrPref = prefs.find((p) => p.pref_key === "assistant_instructions")

        if (tonePref) setTone(tonePref.pref_value || "profesional")
        if (instrPref) setInstructions(instrPref.pref_value || "")
      }
    } catch (error) {
      console.error(error)
      alert("Error cargando configuración")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // =========================
  // GUARDAR
  // =========================
  const handleSave = async () => {
    setSaving(true)

    try {
      // CLIENT
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          name: fullName,
          phone,
          phone_normalized: phone,
          profession_code: profession,
          preferred_language: language,
        })
        .eq("id", clientId)

      if (clientError) throw clientError

      // PREFERENCIAS
      await supabase.from("client_preferences").upsert([
        {
          client_id: clientId,
          pref_key: "assistant_tone",
          pref_value: tone,
        },
        {
          client_id: clientId,
          pref_key: "assistant_instructions",
          pref_value: instructions,
        },
      ])

      // AUTH METADATA
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone,
          profession_code: profession,
          preferred_language: language,
        },
      })

      alert("Guardado correctamente")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-10">Cargando...</div>
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F1F63]">
          Configuración
        </h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias
        </p>
      </div>

      {/* PERFIL */}
      <div className="bg-white rounded-2xl p-6 border">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Perfil</h2>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre"
          />

          <Input value={email} disabled />

          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+51..."
          />

          <Input
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Profesión"
          />
        </div>

        <Button
          className="mt-6"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {/* OPERALLY */}
      <div className="bg-white rounded-2xl p-6 border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">
            Configuración de Operaly
          </h2>
        </div>

        <div className="flex gap-3 mb-4">
          {["profesional", "amigable", "formal", "cercano"].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-full border ${
                tone === t ? "bg-blue-500 text-white" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border rounded-xl p-3"
          placeholder="Instrucciones personalizadas"
        />
      </div>

      {/* IDIOMA */}
      <div className="bg-white rounded-2xl p-6 border">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-cyan-500" />
          <h2 className="text-xl font-semibold">Idioma</h2>
        </div>

        <div className="flex gap-3">
          {["es", "en", "pt"].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-xl border ${
                language === lang ? "bg-blue-500 text-white" : ""
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
