"use client"

import { useState } from "react"
import { Settings, User, Building2, Bell, Shield, Palette, Globe, CreditCard, Link2, MessageSquare, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const tabs = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "business", label: "Negocio", icon: Building2 },
  { id: "channels", label: "Canales", icon: MessageSquare },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "billing", label: "Facturación", icon: CreditCard },
]

const channels = [
  { 
    id: "whatsapp", 
    name: "WhatsApp Business", 
    connected: true, 
    phone: "+51 999 888 777",
    color: "bg-[#25D366]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      </svg>
    )
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    connected: true, 
    handle: "@minegocio",
    color: "bg-gradient-to-br from-[#E4405F] to-[#C13584]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
      </svg>
    )
  },
  { 
    id: "messenger", 
    name: "Facebook Messenger", 
    connected: false, 
    color: "bg-[#1877F2]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0z"/>
      </svg>
    )
  },
  { 
    id: "tiktok", 
    name: "TikTok", 
    connected: false, 
    color: "bg-black",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )
  },
]

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("channels")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F63]">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-card rounded-xl border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-[#3B82F6]/10 to-[#06B6D4]/10 text-[#3B82F6]" 
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "channels" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-[#0F1F63] mb-2">Canales de comunicación</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Conecta tus redes sociales para que Sofía pueda responder desde todos tus canales.
                </p>

                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${channel.color} flex items-center justify-center`}>
                          {channel.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{channel.name}</p>
                          {channel.connected ? (
                            <p className="text-sm text-muted-foreground">
                              {channel.phone || channel.handle}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">No conectado</p>
                          )}
                        </div>
                      </div>
                      {channel.connected ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-sm text-[#34D399]">
                            <Check className="w-4 h-4" />
                            Conectado
                          </span>
                          <Button variant="outline" size="sm">Configurar</Button>
                        </div>
                      ) : (
                        <Button size="sm" className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
                          Conectar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sofia config */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-[#0F1F63] mb-2">Configuración de Sofía</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Personaliza cómo Sofía responde a tus clientes.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre del asistente</label>
                    <Input defaultValue="Sofía" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tono de respuesta</label>
                    <div className="flex gap-2">
                      {["Profesional", "Amigable", "Casual"].map((tone) => (
                        <Button 
                          key={tone} 
                          variant={tone === "Amigable" ? "default" : "outline"} 
                          size="sm"
                          className={tone === "Amigable" ? "bg-[#0F1F63]" : ""}
                        >
                          {tone}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Idiomas</label>
                    <div className="flex flex-wrap gap-2">
                      {["Español", "English", "Português"].map((lang, i) => (
                        <span 
                          key={lang} 
                          className={`px-3 py-1.5 rounded-full text-sm ${
                            i === 0 
                              ? "bg-[#3B82F6]/10 text-[#3B82F6] font-medium" 
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-[#0F1F63] mb-6">Información personal</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                    <Input defaultValue="Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input defaultValue="juan@minegocio.com" type="email" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
                  <Input defaultValue="+51 999 888 777" />
                </div>
                <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-[#0F1F63] mb-6">Información del negocio</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nombre del negocio</label>
                  <Input defaultValue="Mi Negocio" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industria</label>
                  <Input defaultValue="Restaurante" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Dirección</label>
                  <Input defaultValue="Av. Principal 123, Lima" />
                </div>
                <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-[#0F1F63] mb-6">Preferencias de notificaciones</h2>
              <div className="space-y-4">
                {[
                  { label: "Nuevos mensajes", desc: "Recibe una notificación cuando llegue un mensaje nuevo" },
                  { label: "Nuevos pedidos", desc: "Notificación cuando se registre un nuevo pedido" },
                  { label: "Reservas confirmadas", desc: "Cuando Sofía confirme una reserva" },
                  { label: "Resumen diario", desc: "Recibe un resumen de actividad cada día" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full ${i < 3 ? "bg-[#3B82F6]" : "bg-secondary"} relative cursor-pointer`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 ${i < 3 ? "right-0.5" : "left-0.5"} shadow-sm transition-all`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-[#0F1F63] mb-2">Plan actual</h2>
                <div className="flex items-center justify-between mt-4 p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 border border-[#7C3AED]/20">
                  <div>
                    <p className="font-semibold text-[#0F1F63]">Business Pro</p>
                    <p className="text-sm text-muted-foreground">$79/mes - 1,200 conversaciones</p>
                  </div>
                  <Button variant="outline">Cambiar plan</Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Uso del mes</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Conversaciones</span>
                      <span className="text-sm font-medium">847 / 1,200</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-full" style={{ width: "70%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Almacenamiento</span>
                      <span className="text-sm font-medium">2.3 GB / 5 GB</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#34D399] to-[#06B6D4] rounded-full" style={{ width: "46%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
