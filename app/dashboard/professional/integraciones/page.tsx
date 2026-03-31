"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plug,
  Mail,
  HardDrive,
  Calendar,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

const INTEGRATIONS = [
  {
    id: "google_drive",
    name: "Google Drive",
    desc: "Accede y gestiona tus archivos desde Operaly. Sube, busca y comparte documentos directamente.",
    icon: HardDrive,
    color: "#34D399",
    soon: false,
    addon: true,
    addonLabel: "Requiere add-on Google",
  },
  {
    id: "gmail",
    name: "Gmail",
    desc: "Lee y responde correos desde Operaly. Recibe resúmenes de tu bandeja y redacta con IA.",
    icon: Mail,
    color: "#EF4444",
    soon: true,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    desc: "Sincroniza tu agenda de Google con Operaly. Crea eventos y recibe recordatorios inteligentes.",
    icon: Calendar,
    color: "#3B82F6",
    soon: true,
  },
]

export default function IntegracionesPage() {
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState("")
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const cid = await getCurrentClientId()
      setClientId(cid)

      const { data: limits, error } = await supabase
        .from("tenant_effective_limits")
        .select("google_enabled")
        .eq("client_id", cid)
        .maybeSingle()

      if (error) {
        console.error("Error cargando tenant_effective_limits:", error)
      }

      setGoogleEnabled(Boolean(limits?.google_enabled ?? false))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integrationId: string) => {
    if (!clientId || !googleEnabled) return

    setConnecting(integrationId)
    setFeedback("")

    try {
      // Placeholder conservador: aquí debe entrar el OAuth real cuando conectes backend.
      await new Promise((r) => setTimeout(r, 800))

      setFeedback(
        integrationId === "google_drive"
          ? "La conexión OAuth de Google todavía no está cableada en este frontend/backend. La UI ya quedó lista para enchufarla."
          : `La integración ${integrationId} todavía está marcada como próxima.`
      )
    } catch (err) {
      console.error(err)
      setFeedback("No se pudo iniciar la conexión.")
    } finally {
      setConnecting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Cargando integraciones...
      </div>
    )
  }

  if (!googleEnabled) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1F63]">Integraciones</h1>
            <p className="text-muted-foreground mt-1">
              Conecta tus herramientas de trabajo con Operaly.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#3B82F6] flex items-center justify-center">
            <Plug className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#7C3AED]" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#0F1F63]">
              Integraciones Google bloqueadas
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Tu plan actual no tiene habilitadas las integraciones de Google. Cuando se
              activen, podrás conectar Drive, Calendar y futuras automatizaciones
              sincronizadas.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Google Drive</p>
              <p className="text-sm text-muted-foreground mt-1">
                Consultar y usar archivos del usuario desde Operaly.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Google Calendar</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ver y sincronizar eventos del calendario del usuario.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="font-medium text-[#0F1F63]">Correo y flujo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preparar la base para correo y automatizaciones conectadas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/precios">
              <Button className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
                Ver planes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/professional">
              <Button variant="outline" className="rounded-xl">
                Volver al dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Integraciones</h1>
          <p className="text-muted-foreground mt-1">
            Conecta tus herramientas de trabajo con Operaly.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#3B82F6] flex items-center justify-center">
          <Plug className="w-6 h-6 text-white" />
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-sm text-[#1D4ED8]">
          {feedback}
        </div>
      )}

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon

          return (
            <div
              key={integration.id}
              className="bg-card rounded-2xl border border-border p-6 flex items-start justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${integration.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: integration.color }} />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#0F1F63]">{integration.name}</h3>

                    {integration.soon && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                        Próximamente
                      </span>
                    )}

                    {integration.addon && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/20 text-[#7C3AED] font-medium">
                        Add-on
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">{integration.desc}</p>

                  {integration.addonLabel && (
                    <p className="text-xs text-[#7C3AED] mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {integration.addonLabel}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={integration.soon || connecting === integration.id}
                onClick={() => handleConnect(integration.id)}
                className={`flex-shrink-0 h-10 px-5 rounded-xl text-sm font-medium transition-all ${
                  integration.soon
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-[#0F1F63] text-white hover:bg-[#1a2f7a]"
                }`}
              >
                {connecting === integration.id ? (
                  <span className="inline-flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </span>
                ) : integration.soon ? (
                  "Próximo"
                ) : (
                  "Conectar"
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-secondary/50 rounded-2xl border border-border p-5">
        <p className="text-sm text-muted-foreground">
          La interfaz ya está lista para el gating por plan. En cuanto enchufes el flujo
          OAuth real de Google, esta pantalla ya tiene el punto exacto donde iniciar la
          conexión.
        </p>
      </div>
    </div>
  )
}
