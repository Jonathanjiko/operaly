"use client"

import { useState } from "react"
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Plug,
  Globe,
  Sparkles,
  ChevronRight,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const languages = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
]

export default function SettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("es")

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F63]">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      {/* Profile Section */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0F1F63] flex items-center gap-2">
            <User className="w-5 h-5 text-[#3B82F6]" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white text-2xl font-bold">
              JP
            </div>
            <div>
              <Button variant="outline">Cambiar foto</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input defaultValue="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="juan@ejemplo.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input defaultValue="+51 999 888 777" />
            </div>
            <div className="space-y-2">
              <Label>Profesión</Label>
              <Input defaultValue="Abogado" />
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      {/* Sofia Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0F1F63] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            Configuración de Sofía
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 to-[#3B82F6]/10 border border-[#7C3AED]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0F1F63]">Sofía activa</p>
                <p className="text-sm text-muted-foreground">Respondiendo automáticamente a tus clientes</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#34D399] animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tono de comunicación</Label>
            <div className="flex flex-wrap gap-2">
              {["Profesional", "Amigable", "Formal", "Cercano"].map((tone, i) => (
                <button
                  key={tone}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    i === 0 
                      ? "bg-[#3B82F6] text-white" 
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Instrucciones personalizadas</Label>
            <textarea 
              className="w-full h-24 p-3 rounded-xl bg-secondary/50 border-0 resize-none text-sm"
              placeholder="Ej: Siempre menciona que las consultas iniciales son gratuitas..."
              defaultValue="Responde de manera profesional pero cercana. Siempre ofrece agendar una cita de seguimiento."
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0F1F63] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#06B6D4]" />
            Idioma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  selectedLanguage === lang.code
                    ? "border-[#3B82F6] bg-[#3B82F6]/5"
                    : "border-border hover:border-[#3B82F6]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lang.name}</span>
                  {selectedLanguage === lang.code && (
                    <Check className="w-4 h-4 text-[#3B82F6]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-border/50 hover:border-[#3B82F6]/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F59E0B]/10">
                <Bell className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="font-medium text-[#0F1F63]">Notificaciones</p>
                <p className="text-sm text-muted-foreground">Configura tus alertas</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-[#3B82F6]/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#7C3AED]/10">
                <Shield className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="font-medium text-[#0F1F63]">Seguridad</p>
                <p className="text-sm text-muted-foreground">Contraseña y 2FA</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-[#3B82F6]/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                <CreditCard className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="font-medium text-[#0F1F63]">Suscripción</p>
                <p className="text-sm text-muted-foreground">Plan Professional Pro</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-[#3B82F6]/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#34D399]/10">
                <Plug className="w-5 h-5 text-[#34D399]" />
              </div>
              <div>
                <p className="font-medium text-[#0F1F63]">Integraciones</p>
                <p className="text-sm text-muted-foreground">WhatsApp conectado</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
