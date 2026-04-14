"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plug, ExternalLink, Check, AlertCircle, RefreshCw, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { getDisplayPlanName } from "@/lib/plans"

const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
)

const GmailIcon = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h48V192l160 112 160-112v256h48c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM256 272 96 160h320L256 272z" fill="#EA4335" />
  </svg>
)

const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <rect x="5" y="10" width="90" height="85" rx="8" fill="white" stroke="#DADCE0" strokeWidth="4" />
    <rect x="5" y="10" width="90" height="25" rx="4" fill="#1A73E8" />
    <rect x="5" y="30" width="90" height="5" fill="#1A73E8" />
    <text x="50" y="75" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#1A73E8">31</text>
    <rect x="25" y="2" width="10" height="18" rx="5" fill="#EA4335" />
    <rect x="65" y="2" width="10" height="18" rx="5" fill="#EA4335" />
  </svg>
)

const INTEGRATIONS = [
  {
    id: "google_drive",
    name: "Google Drive",
    desc: "Accede a tus archivos desde Operaly. Sube, busca, comparte y analiza documentos desde el flujo operativo.",
    icon: GoogleDriveIcon,
    features: ["Subir archivos a Drive", "Buscar documentos por nombre", "Analizar PDFs y hojas de calculo"],
    comingSoon: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    desc: "Lee y responde correos desde Operaly. Recibe resumenes de tu bandeja y prepara borradores con IA.",
    icon: GmailIcon,
    features: ["Leer correos importantes", "Redactar respuestas con IA", "Resumenes diarios de bandeja"],
    comingSoon: true,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    desc: "Sincroniza tu agenda de Google con Operaly para crear eventos, revisar agenda y disparar recordatorios.",
    icon: GoogleCalendarIcon,
    features: ["Crear eventos desde dashboard", "Ver agenda del dia", "Recordatorios inteligentes"],
    comingSoon: true,
  },
]

export default function IntegracionesPage() {
  const [loading, setLoading] = useState(true)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [planCode, setPlanCode] = useState("trial")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()

      const { data: client } = await supabase
        .from("clients")
        .select("plan_code")
        .eq("id", cid)
        .maybeSingle()

      if (client?.plan_code) setPlanCode(client.plan_code)

      const { data: limits, error: limitsError } = await supabase.rpc("get_my_effective_limits")
      if (limitsError) throw limitsError

      setGoogleEnabled(Boolean(limits?.google_enabled ?? false))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (id: string) => {
    setConnecting(id)
    await new Promise((resolve) => setTimeout(resolve, 800))
    alert("Google OAuth estara disponible en breve. La conexion se gestionara desde este dashboard.")
    setConnecting(null)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Cargando integraciones...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Integraciones</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Conecta tus herramientas de trabajo con Operaly desde el dashboard administrativo</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34D399] to-[#3B82F6]">
          <Plug className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#4285F4]/20 bg-gradient-to-r from-[#4285F4]/5 via-[#34A853]/5 to-[#EA4335]/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-1">
            {["#4285F4", "#34A853", "#FBBC05", "#EA4335"].map((color) => (
              <div key={color} className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F1F63]">Suite de Google</p>
            <p className="text-xs text-muted-foreground">Drive, Gmail y Calendar se habilitan segun tu plan o add-ons, y se conectan desde aqui.</p>
          </div>
          {googleEnabled ? (
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]">
              <Check className="h-3 w-3" /> Add-on activo
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" /> Requiere add-on
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon
          const isBlocked = !googleEnabled && !integration.comingSoon

          return (
            <div
              key={integration.id}
              className={`rounded-2xl border bg-card p-5 transition-all ${
                isBlocked ? "border-border opacity-75" : "border-border hover:border-[#3B82F6]/20 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
                  <Icon />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-[#0F1F63]">{integration.name}</h3>
                    {integration.comingSoon ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Proximo
                      </span>
                    ) : googleEnabled ? (
                      <span className="rounded-full border border-[#10B981]/20 bg-[#10B981]/5 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                        Disponible
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
                        Add-on
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{integration.desc}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <span key={feature} className="rounded-lg border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {integration.comingSoon ? (
                    <button disabled className="h-9 cursor-not-allowed rounded-xl border border-border bg-secondary px-4 text-xs font-medium text-muted-foreground">
                      Proximamente
                    </button>
                  ) : isBlocked ? (
                    <Link href="/precios">
                      <button className="h-9 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/5 px-4 text-xs font-medium text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/10">
                        Activar add-on
                      </button>
                    </Link>
                  ) : connecting === integration.id ? (
                    <button disabled className="h-9 rounded-xl bg-[#3B82F6] px-4 text-xs font-medium text-white opacity-70">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0F1F63] px-4 text-xs font-medium text-white transition-colors hover:bg-[#1a2f7a]"
                    >
                      Conectar <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">
              Las integraciones de Google se conectan mediante OAuth seguro y se administran desde este dashboard. Tu plan actual es {getDisplayPlanName(planCode)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
