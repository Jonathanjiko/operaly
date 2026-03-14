"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Building2, ArrowRight, Users, Calendar, FileText, MessageSquare, ShoppingCart, BarChart3 } from "lucide-react"

export default function SelectAccountTypePage() {
  const router = useRouter()

  const handleSelect = (type: "professional" | "business") => {
    router.push(`/onboarding?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#3B82F6]/10 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={160}
              height={160}
              className="h-16 w-auto mx-auto mb-8"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F1F63] mb-4">
            ¿Cómo usarás Operaly?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Elige la opción que mejor se adapte a ti para personalizar tu experiencia.
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Professional */}
          <button
            onClick={() => handleSelect("professional")}
            className="group relative bg-card rounded-3xl p-8 md:p-10 border border-border shadow-sm hover:shadow-2xl hover:border-[#3B82F6]/30 transition-all duration-300 text-left"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>

              <h2 className="text-2xl font-bold text-[#0F1F63] mb-2">
                Profesional
              </h2>
              <p className="text-[#1E40AF] font-medium mb-4">
                Tu asistente personal inteligente
              </p>
              <p className="text-muted-foreground mb-6">
                Usa Operaly para organizar clientes, documentos, agenda y recordatorios desde WhatsApp.
              </p>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: Users, label: "Gestión de clientes" },
                  { icon: Calendar, label: "Agenda y recordatorios" },
                  { icon: FileText, label: "Análisis de documentos" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-[#3B82F6]" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
                {["Abogados", "Médicos", "Consultores", "Coaches"].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>

          {/* Business */}
          <button
            onClick={() => handleSelect("business")}
            className="group relative bg-card rounded-3xl p-8 md:p-10 border border-border shadow-sm hover:shadow-2xl hover:border-[#34D399]/30 transition-all duration-300 text-left"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#34D399]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#06B6D4]">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>

              <h2 className="text-2xl font-bold text-[#0F1F63] mb-2">
                Negocio
              </h2>
              <p className="text-[#047857] font-medium mb-4">
                Tu agente de ventas y atención al cliente
              </p>
              <p className="text-muted-foreground mb-6">
                Usa Operaly como agente inteligente de ventas y servicio al cliente para tu negocio.
              </p>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: MessageSquare, label: "Atención automatizada 24/7" },
                  { icon: ShoppingCart, label: "Ventas por WhatsApp" },
                  { icon: BarChart3, label: "CRM y analítica" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-[#34D399]" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
                {["Retail", "Restaurantes", "Servicios", "E-commerce"].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-[#34D399]/10 text-[#34D399]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* Back link */}
        <p className="text-center mt-8 text-sm text-muted-foreground">
          <Link href="/register" className="hover:underline">
            ← Volver al registro
          </Link>
        </p>
      </div>
    </div>
  )
}
