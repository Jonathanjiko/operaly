"use client"

import { useEffect, useMemo, useState } from "react"
import { Globe, Sparkles, User, ShieldCheck, Phone } from "lucide-react"
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
  phone_verified_at: string | null
  phone_verification_status: string | null
  phone_verification_requested_at: string | null
}

type PreferenceRow = {
  pref_key: string
  pref_value: string | null
}

export default function ProfessionalSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [requestingVerification, setRequestingVerification] = useState(false)

  const [clientId, setClientId] = useState("")
  const [email, setEmail] = useState("")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [profession, setProfession] = useState("")
  const [language, setLanguage] = useState("es")

  const [tone, setTone] = useState("profesional")
  const [instructions, setInstructions] = useState("")

  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null)
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState("pending")
  const [phoneVerificationRequestedAt, setPhoneVerificationRequestedAt] = useState<string | null>(null)

  const initials = useMemo(() => {
    if (!fullName.trim()) {
      return "OP"
    }

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [fullName])

  const loadData = async () => {
    setLoading(true)

    try {
      const currentClientId = await getCurrentClientId()
      setClientId(currentClientId)

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      const user = userData.user
      if (!user) {
        throw new Error("No hay sesión activa.")
      }

      setEmail(user.email || "")

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select(
          "id, name, phone, phone_normalized, profession_code, preferred_language, phone_verified_at, phone_verification_status, phone_verification_requested_at"
        )
        .eq("id", currentClientId)
        .single()

      if (clientError) {
        throw clientError
      }

      const client = clientData as ClientRow

      setFullName(client.name || "")
      setPhone(client.phone_normalized || client.phone || "")
      setProfession(client.profession_code || "")
      setLanguage(client.preferred_language || "es")
      setPhoneVerifiedAt(client.phone_verified_at)
      setPhoneVerificationStatus(client.phone_verification_status || "pending")
      setPhoneVerificationRequestedAt(client.phone_verification_requested_at)

      const { data: prefsData, error: prefsError } = await supabase
        .from("client_preferences")
        .select("pref_key, pref_value")
        .eq("client_id", currentClientId)

      if (prefsError) {
        throw prefsError
      }

      const prefs = (prefsData || []) as PreferenceRow[]
      const tonePref = prefs.find((row) => row.pref_key === "assistant_tone")
      const instructionsPref = prefs.find(
        (row) => row.pref_key === "assistant_instructions"
      )

      setTone(tonePref?.pref_value || "profesional")
      setInstructions(instructionsPref?.pref_value || "")
    } catch (err: any) {
      alert(err.message || "No se pudo cargar la configuración.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const upsertPreference = async (key: string, value: string) => {
    const { error } = await supabase.from("client_preferences").upsert(
      {
        client_id: clientId,
        pref_key: key,
        pref_value: value,
        source: "dashboard",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "client_id,pref_key",
      }
    )

    if (error) {
      throw error
    }
  }

  const handleSave = async () => {
    if (!clientId) {
      alert("No encontramos el cliente de esta cuenta.")
      return
    }

    setSaving(true)

    try {
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          name: fullName.trim() || null,
          phone: phone.trim() || null,
          phone_normalized: phone.trim() || null,
          profession_code: profession.trim() || null,
          preferred_language: language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)

      if (clientError) {
        throw clientError
      }

      await upsertPreference("assistant_tone", tone)
      await upsertPreference("assistant_instructions", instructions.trim())

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          phone_normalized: phone.trim(),
          profession_code: profession.trim(),
          preferred_language: language,
        },
      })

      if (authUpdateError) {
        throw authUpdateError
      }

      alert("Configuración guardada correctamente.")
      await loadData()
    } catch (err: any) {
      alert(err.message || "No se pudo guardar la configuración.")
    } finally {
      setSaving(false)
    }
  }

  const handleRequestPhoneVerification = async () => {
    if (!clientId) {
      alert("No encontramos el cliente de esta cuenta.")
      return
    }

    setRequestingVerification(true)

    try {
      const { error } = await supabase.rpc("operaly_request_phone_verification", {
        p_client_id: clientId,
      })

      if (error) {
        throw error
      }

      alert("Solicitud de verificación registrada.")
      await loadData()
    } catch (err: any) {
      alert(err.message || "No se pudo registrar la solicitud de verificación.")
    } finally {
      setRequestingVerification(false)
    }
  }

  const toneOptions = [
    { code: "profesional", label: "Profesional" },
    { code: "amigable", label: "Amigable" },
    { code: "formal", label: "Formal" },
    { code: "cercano", label: "Cercano" },
  ]

  const languageOptions = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "it", label: "Italiano" },
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando configuración...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0F1F63]">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra tu cuenta y preferencias
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-[#3B82F6]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Perfil</h2>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-bold text-3xl">
            {initials}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Cuenta conectada</p>
            <p className="font-medium text-[#0F1F63]">{email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              Nombre completo
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              Email
            </label>
            <Input
              value={email}
              disabled
              className="h-12 rounded-xl bg-secondary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              Teléfono
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1F63] mb-2">
              Profesión
            </label>
            <Input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <Button
          className="mt-6 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Phone className="w-5 h-5 text-[#0EA5E9]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">
            Verificación de número
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/20 p-5">
          <p className="text-sm text-muted-foreground mb-2">Número actual</p>
          <p className="font-medium text-[#0F1F63]">{phone || "No definido"}</p>

          <div className="mt-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium text-[#0F1F63]">Estado: </span>
              <span className="text-muted-foreground">
                {phoneVerifiedAt ? "Verificado" : phoneVerificationStatus || "pending"}
              </span>
            </p>

            <p className="text-sm">
              <span className="font-medium text-[#0F1F63]">Solicitado: </span>
              <span className="text-muted-foreground">
                {phoneVerificationRequestedAt
                  ? new Date(phoneVerificationRequestedAt).toLocaleString()
                  : "Aún no solicitado"}
              </span>
            </p>
          </div>

          {!phoneVerifiedAt && (
            <Button
              variant="outline"
              className="mt-5 rounded-xl"
              onClick={handleRequestPhoneVerification}
              disabled={requestingVerification}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {requestingVerification
                ? "Solicitando..."
                : "Solicitar verificación"}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#7C3AED]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">
            Configuración de Operaly
          </h2>
        </div>

        <div className="rounded-2xl border border-[#CBB8FF] bg-[#F7F4FF] p-4 mb-6">
          <p className="font-medium text-[#0F1F63]">Operaly activa</p>
          <p className="text-sm text-muted-foreground mt-1">
            Lista para asistirte según tus preferencias.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#0F1F63] mb-3">
            Tono de comunicación
          </label>

          <div className="flex flex-wrap gap-3">
            {toneOptions.map((option) => {
              const isActive = tone === option.code

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setTone(option.code)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    isActive
                      ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                      : "bg-secondary/30 text-foreground border-border hover:bg-secondary/50"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F1F63] mb-3">
            Instrucciones personalizadas
          </label>

          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full min-h-[130px] rounded-2xl border border-border bg-secondary/20 p-4 outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            placeholder="Escribe cómo quieres que Operaly trabaje contigo..."
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-[#06B6D4]" />
          <h2 className="text-xl font-semibold text-[#0F1F63]">Idioma</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {languageOptions.map((option) => {
            const isActive = language === option.code

            return (
              <button
                key={option.code}
                type="button"
                onClick={() => setLanguage(option.code)}
                className={`h-14 rounded-2xl border text-left px-4 transition-colors ${
                  isActive
                    ? "border-[#3B82F6] bg-[#3B82F6]/5 text-[#0F1F63]"
                    : "border-border bg-background hover:bg-secondary/30"
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
