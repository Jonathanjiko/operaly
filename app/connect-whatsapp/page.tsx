"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  ExternalLink,
  MessageSquare,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type StoredAssistantProfile = {
  fullName?: string
  phone_normalized?: string
  countryCode?: string
  city?: string
  preferred_language?: string
  timezone?: string
  planCode?: string
}

const OPERALLY_WHATSAPP_URL = process.env.NEXT_PUBLIC_OPERALY_WHATSAPP_URL || ""

function ConnectWhatsAppContent() {
  const router = useRouter()
  const [profile, setProfile] = useState<StoredAssistantProfile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("operaly_assistant_profile")
      if (raw) setProfile(JSON.parse(raw) as StoredAssistantProfile)
    } catch {
      setProfile(null)
    }
  }, [])

  const displayName = useMemo(() => {
    const name = String(profile?.fullName || "").trim()
    return name || "tu nombre"
  }, [profile?.fullName])

  const displayPhone = useMemo(() => {
    const phone = String(profile?.phone_normalized || "").trim()
    return phone || "tu WhatsApp registrado"
  }, [profile?.phone_normalized])

  const handleContinue = () => {
    router.push("/dashboard/professional")
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-[#DCE7F5] bg-[#0F1F63] p-8 text-white shadow-2xl">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#25D366]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#22C7E5]/20 blur-3xl" />

            <div className="relative">
              <Image
                src="/images/operaly-logo.png"
                alt="Operaly"
                width={140}
                height={140}
                className="mb-10 h-12 w-auto brightness-0 invert"
              />

              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/85">
                <Sparkles className="h-4 w-4 text-[#25D366]" />
                WhatsApp es donde Operaly vive
              </div>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Tu cuenta ya queda lista para operar por WhatsApp.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
                El dashboard no es un chat. Aqui controlas datos, pagos, integraciones y configuracion. La operacion diaria ocurre por WhatsApp.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  "Solo usuarios registrados pueden usar Operaly.",
                  "El numero registrado es la llave de acceso por WhatsApp.",
                  "Al completar el registro, Operaly debe saludarte con tu nombre y contexto.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 p-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                    <span className="text-sm text-white/82">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#DCE7F5] bg-white p-8 shadow-xl md:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-lg shadow-[#25D366]/20">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#25D366]">
                  Bienvenida automatica
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#0F1F63]">Revisa tu WhatsApp</h2>
              </div>
            </div>

            <div className="rounded-3xl border border-[#DCE7F5] bg-[#F8FBFF] p-5">
              <p className="text-sm text-slate-500">Operaly debe escribirle a:</p>
              <p className="mt-2 text-xl font-semibold text-[#0F1F63]">{displayName}</p>
              <p className="mt-1 font-mono text-sm text-slate-600">{displayPhone}</p>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-800">
                Mensaje esperado: una bienvenida personalizada con tu nombre, idioma, ciudad/timezone, plan y una guia breve para empezar a pedir agenda, tareas, archivos o recordatorios por WhatsApp.
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Smartphone className="mb-3 h-5 w-5 text-[#25D366]" />
                <p className="text-sm font-semibold text-[#0F1F63]">1. Registro web</p>
                <p className="mt-1 text-xs text-slate-500">Tu numero queda asociado al client_id.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <MessageSquare className="mb-3 h-5 w-5 text-[#3B82F6]" />
                <p className="text-sm font-semibold text-[#0F1F63]">2. Bienvenida</p>
                <p className="mt-1 text-xs text-slate-500">Operaly te saluda por WhatsApp.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Shield className="mb-3 h-5 w-5 text-[#7C3AED]" />
                <p className="text-sm font-semibold text-[#0F1F63]">3. Gate activo</p>
                <p className="mt-1 text-xs text-slate-500">Solo tu numero registrado puede operar.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {OPERALLY_WHATSAPP_URL ? (
                <Link href={OPERALLY_WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex-1">
                  <Button className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] font-semibold text-white hover:opacity-90">
                    Abrir WhatsApp
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button disabled className="h-14 flex-1 rounded-2xl bg-slate-200 text-slate-500">
                  WhatsApp de Operaly pendiente
                </Button>
              )}

              <Button
                onClick={handleContinue}
                variant="outline"
                className="h-14 flex-1 rounded-2xl border-[#DCE7F5] font-semibold text-[#0F1F63]"
              >
                Ir al dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
              Si aun no recibes la bienvenida, puedes continuar al dashboard. El backend la reintentara desde la cola/worker sin abrir una conversacion dentro del dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConnectWhatsAppPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#25D366]" />
        </div>
      }
    >
      <ConnectWhatsAppContent />
    </Suspense>
  )
}
