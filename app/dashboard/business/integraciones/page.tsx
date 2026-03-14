"use client"

import { Button } from "@/components/ui/button"
import { 
  Check, ExternalLink, Settings, AlertCircle, Clock
} from "lucide-react"

// Integration icons
const WhatsAppIcon = () => (
  <svg className="w-8 h-8" fill="#25D366" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#FCAF45" />
        <stop offset="50%" stopColor="#F77737" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-8 h-8" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg className="w-8 h-8" fill="#000000" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const GmailIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const IzipayIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#00B140] flex items-center justify-center text-white font-bold text-xs">
    IZI
  </div>
)

const integrations = [
  { 
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Conecta tu número de WhatsApp Business para atender clientes",
    icon: WhatsAppIcon,
    status: "connected",
    details: "+51 999 123 456"
  },
  { 
    id: "instagram",
    name: "Instagram",
    description: "Recibe y responde mensajes de Instagram Direct",
    icon: InstagramIcon,
    status: "available",
    plan: "Business Pro"
  },
  { 
    id: "facebook",
    name: "Facebook Messenger",
    description: "Integra tu página de Facebook para mensajes",
    icon: FacebookIcon,
    status: "available",
    plan: "Business Pro"
  },
  { 
    id: "tiktok",
    name: "TikTok",
    description: "Responde comentarios y mensajes de TikTok",
    icon: TikTokIcon,
    status: "coming_soon"
  },
  { 
    id: "gmail",
    name: "Gmail",
    description: "Gestiona correos desde Operaly",
    icon: GmailIcon,
    status: "available"
  },
  { 
    id: "izipay",
    name: "Izipay",
    description: "Acepta pagos con tarjeta directamente",
    icon: IzipayIcon,
    status: "coming_soon"
  },
]

const statusConfig = {
  connected: { label: "Conectado", color: "#34D399", icon: Check },
  available: { label: "Disponible", color: "#3B82F6", icon: null },
  coming_soon: { label: "Próximamente", color: "#F59E0B", icon: Clock },
}

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F63]">Integraciones</h1>
        <p className="text-muted-foreground">Conecta tus canales de comunicación y pagos</p>
      </div>

      {/* Connected integrations */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Conectado</h2>
        <div className="grid gap-4">
          {integrations.filter(i => i.status === "connected").map((integration) => {
            const Icon = integration.icon
            const status = statusConfig[integration.status as keyof typeof statusConfig]
            const StatusIcon = status.icon

            return (
              <div 
                key={integration.id}
                className="bg-card rounded-2xl border border-[#34D399]/30 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-[#0F1F63]">{integration.name}</h3>
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${status.color}15`, color: status.color }}
                      >
                        {StatusIcon && <StatusIcon className="w-3 h-3" />}
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                    {integration.details && (
                      <p className="text-sm font-medium text-[#047857]">{integration.details}</p>
                    )}
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Available integrations */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Disponibles</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.filter(i => i.status === "available").map((integration) => {
            const Icon = integration.icon

            return (
              <div 
                key={integration.id}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-[#3B82F6]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0F1F63] mb-1">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                    {integration.plan && (
                      <p className="text-xs text-[#7C3AED] font-medium mb-3">
                        Requiere plan {integration.plan}
                      </p>
                    )}
                    <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl">
                      Conectar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Próximamente</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.filter(i => i.status === "coming_soon").map((integration) => {
            const Icon = integration.icon

            return (
              <div 
                key={integration.id}
                className="bg-card rounded-2xl border border-dashed border-border p-6 opacity-70"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0F1F63]">{integration.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
                        Próximamente
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
