"use client"

import { useState, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Smartphone, Check, ArrowRight, Shield, Zap, RefreshCw } from "lucide-react"

function ConnectWhatsAppContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountType = searchParams.get("type") || "business"
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)
    // Simulate connection
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
    }, 2000)
  }

  const handleContinue = () => {
    const dashboardPath = accountType === "professional" 
      ? "/dashboard/professional" 
      : "/dashboard/business"
    router.push(dashboardPath)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25D366]/10 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#3B82F6]/10 via-[#25D366]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={140}
            height={140}
            className="h-12 w-auto mx-auto mb-6"
          />
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-12">
          {!isConnected ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] mb-6 shadow-lg shadow-[#25D366]/30">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63] mb-3">
                  Conecta tu WhatsApp Business
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Conecta tu número de WhatsApp Business para que Sofía pueda comenzar a asistirte automáticamente.
                </p>
              </div>

              {/* QR Code mock */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <div className="w-56 h-56 bg-white rounded-2xl p-4 shadow-lg border border-border">
                      {/* Mock QR code pattern */}
                      <div className="w-full h-full bg-gradient-to-br from-[#0F1F63] to-[#1a2d7c] rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-2 grid grid-cols-8 gap-1">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-sm ${Math.random() > 0.5 ? "bg-white" : "bg-transparent"}`}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-[#25D366]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {isConnecting && (
                      <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-[#25D366] animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="font-semibold text-[#0F1F63]">Instrucciones:</h3>
                  <div className="space-y-3">
                    {[
                      "Abre WhatsApp en tu teléfono",
                      "Toca Menú o Configuración y selecciona WhatsApp Web",
                      "Escanea el código QR con tu teléfono",
                    ].map((instruction, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-sm font-medium shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-sm text-muted-foreground">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connect button */}
              <div className="text-center">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="h-14 px-10 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white font-semibold text-lg shadow-lg shadow-[#25D366]/30"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5 mr-2" />
                      Conectar WhatsApp
                    </>
                  )}
                </Button>
              </div>

              {/* Security note */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#3B82F6]" />
                    <span>Conexión segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#34D399]" />
                    <span>Encriptación de extremo a extremo</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Connected state */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] mb-8 shadow-xl shadow-[#34D399]/30">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63] mb-3">
                WhatsApp conectado exitosamente
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-10">
                Sofía ahora está lista para atender a tus clientes automáticamente desde WhatsApp.
              </p>

              <Button
                onClick={handleContinue}
                className="h-14 px-10 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white font-semibold text-lg"
              >
                Ir al Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* What's next */}
              <div className="mt-10 p-6 rounded-2xl bg-secondary/30 border border-border text-left">
                <h3 className="font-semibold text-[#0F1F63] mb-4">¿Qué sigue?</h3>
                <div className="space-y-3">
                  {[
                    "Configura tu perfil de negocio",
                    "Personaliza las respuestas de Sofía",
                    "Importa tus clientes existentes",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-[#34D399]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        {!isConnected && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            <Link 
              href={accountType === "professional" ? "/dashboard/professional" : "/dashboard/business"} 
              className="hover:underline"
            >
              Omitir por ahora
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function ConnectWhatsAppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366]"></div>
      </div>
    }>
      <ConnectWhatsAppContent />
    </Suspense>
  )
}
