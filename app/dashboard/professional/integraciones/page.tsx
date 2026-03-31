"use client"

import { useState } from "react"
import { Plug, Mail, HardDrive, Calendar, Lock } from "lucide-react"

const INTEGRATIONS = [
  {
    id:      "google_drive",
    name:    "Google Drive",
    desc:    "Accede y gestiona tus archivos desde Operaly. Sube, busca y comparte documentos directamente.",
    icon:    HardDrive,
    color:   "#34D399",
    soon:    false,
    addon:   true,
    addonLabel: "Requiere add-on Google",
  },
  {
    id:      "gmail",
    name:    "Gmail",
    desc:    "Lee y responde correos desde Operaly. Recibe resúmenes de tu bandeja y redacta con IA.",
    icon:    Mail,
    color:   "#EF4444",
    soon:    true,
  },
  {
    id:      "google_calendar",
    name:    "Google Calendar",
    desc:    "Sincroniza tu agenda de Google con Operaly. Crea eventos y recibe recordatorios inteligentes.",
    icon:    Calendar,
    color:   "#3B82F6",
    soon:    true,
  },
]

export default function IntegracionesPage() {
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId)
    // Google OAuth flow will go here
    // For now: placeholder
    await new Promise((r) => setTimeout(r, 800))
    alert("Próximamente: integración con " + integrationId + ". Por favor vuelve pronto.")
    setConnecting(null)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
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

      {/* Cards */}
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
                  <div className="flex items-center gap-2">
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
                {connecting === integration.id ? "Conectando..." : integration.soon ? "Próximo" : "Conectar"}
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-secondary/50 rounded-2xl border border-border p-5">
        <p className="text-sm text-muted-foreground">
          ¿Necesitas una integración que no ves aquí? Escríbenos por WhatsApp a Operaly y lo evaluamos para el siguiente ciclo de desarrollo.
        </p>
      </div>
    </div>
  )
}
