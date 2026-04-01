"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plug, ExternalLink, ChevronRight, Check,
  AlertCircle, RefreshCw, Zap, Lock,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { Button } from "@/components/ui/button"

// Google brand colors SVG icons inline
const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
)

const GmailIcon = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h48V192l160 112 160-112v256h48c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM256 272 96 160h320L256 272z" fill="#EA4335"/>
  </svg>
)

const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <rect x="5" y="10" width="90" height="85" rx="8" fill="white" stroke="#DADCE0" strokeWidth="4"/>
    <rect x="5" y="10" width="90" height="25" rx="4" fill="#1A73E8"/>
    <rect x="5" y="30" width="90" height="5" fill="#1A73E8"/>
    <text x="50" y="75" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#1A73E8">31</text>
    <rect x="25" y="2" width="10" height="18" rx="5" fill="#EA4335"/>
    <rect x="65" y="2" width="10" height="18" rx="5" fill="#EA4335"/>
  </svg>
)

const INTEGRATIONS = [
  {
    id:          "google_drive",
    name:        "Google Drive",
    desc:        "Accede a tus archivos desde Operaly. Sube, busca, comparte y analiza documentos directamente por WhatsApp.",
    icon:        GoogleDriveIcon,
    status:      "addon",
    addonLabel:  "Requiere add-on Google",
    features:    ["Subir archivos a Drive", "Buscar documentos por nombre", "Analizar PDFs y hojas de cálculo"],
    comingSoon:  false,
  },
  {
    id:          "gmail",
    name:        "Gmail",
    desc:        "Lee y responde correos desde Operaly. Recibe resúmenes de tu bandeja y redacta respuestas con IA.",
    icon:        GmailIcon,
    status:      "soon",
    features:    ["Leer correos importantes", "Redactar respuestas con IA", "Resúmenes diarios de bandeja"],
    comingSoon:  true,
  },
  {
    id:          "google_calendar",
    name:        "Google Calendar",
    desc:        "Sincroniza tu agenda de Google con Operaly. Crea eventos, recibe recordatorios y consulta tu calendario por WhatsApp.",
    icon:        GoogleCalendarIcon,
    status:      "soon",
    features:    ["Crear eventos desde WhatsApp", "Ver agenda del día", "Recordatorios inteligentes"],
    comingSoon:  true,
  },
]

export default function IntegracionesPage() {
  const [loading, setLoading]           = useState(true)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [connecting, setConnecting]     = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      const { data: limits } = await supabase
        .from("tenant_effective_limits")
        .select("google_enabled")
        .eq("client_id", cid).maybeSingle()
      setGoogleEnabled(Boolean(limits?.google_enabled ?? false))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (id: string) => {
    setConnecting(id)
    await new Promise(r => setTimeout(r, 800))
    alert("Google OAuth estará disponible en breve. Tu cuenta ya está configurada para recibirlo.")
    setConnecting(null)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />Cargando integraciones...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Integraciones</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Conecta tus herramientas de trabajo con Operaly
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#3B82F6] flex items-center justify-center">
          <Plug className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Google Suite header */}
      <div className="bg-gradient-to-r from-[#4285F4]/5 via-[#34A853]/5 to-[#EA4335]/5 rounded-2xl border border-[#4285F4]/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-1">
            {["#4285F4","#34A853","#FBBC05","#EA4335"].map(c => (
              <div key={c} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div>
            <p className="font-semibold text-sm text-[#0F1F63]">Suite de Google</p>
            <p className="text-xs text-muted-foreground">Drive · Gmail · Calendar — próximamente conectados</p>
          </div>
          {googleEnabled ? (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
              <Check className="w-3 h-3" /> Add-on activo
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
              <Lock className="w-3 h-3" /> Requiere add-on
            </div>
          )}
        </div>
      </div>

      {/* Integration cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map(integration => {
          const Icon = integration.icon
          const isBlocked = !googleEnabled && !integration.comingSoon
          return (
            <div
              key={integration.id}
              className={`bg-card rounded-2xl border p-5 transition-all ${
                isBlocked ? "border-border opacity-75" : "border-border hover:border-[#3B82F6]/20 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl border border-border bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#0F1F63]">{integration.name}</h3>
                    {integration.comingSoon && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 uppercase tracking-wide">
                        Próximo
                      </span>
                    )}
                    {!integration.comingSoon && !googleEnabled && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/20 text-[#7C3AED] uppercase tracking-wide">
                        Add-on
                      </span>
                    )}
                    {googleEnabled && !integration.comingSoon && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/5 border border-[#10B981]/20 text-[#10B981]">
                        Disponible
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{integration.desc}</p>

                  {/* Features */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {integration.features.map(f => (
                      <span key={f} className="text-xs px-2 py-1 rounded-lg bg-secondary border border-border text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {integration.comingSoon ? (
                    <button
                      disabled
                      className="h-9 px-4 rounded-xl text-xs font-medium bg-secondary text-muted-foreground cursor-not-allowed border border-border"
                    >
                      Próximamente
                    </button>
                  ) : isBlocked ? (
                    <Link href="/precios">
                      <button className="h-9 px-4 rounded-xl text-xs font-medium border border-[#7C3AED]/30 bg-[#7C3AED]/5 text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors">
                        Activar add-on
                      </button>
                    </Link>
                  ) : connecting === integration.id ? (
                    <button disabled className="h-9 px-4 rounded-xl text-xs font-medium bg-[#3B82F6] text-white opacity-70">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="h-9 px-4 rounded-xl text-xs font-medium bg-[#0F1F63] text-white hover:bg-[#1a2f7a] transition-colors flex items-center gap-1.5"
                    >
                      Conectar <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info footer */}
      <div className="bg-secondary/50 rounded-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              Las integraciones de Google se conectan mediante OAuth seguro — Operaly nunca almacena tus contraseñas.
              El add-on de Google se puede activar desde el panel de Analíticas o escribiéndole a Operaly por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
