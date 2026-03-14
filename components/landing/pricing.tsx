"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Briefcase, Building2 } from "lucide-react"

const professionalPlans = [
  {
    name: "Starter",
    price: 29,
    description: "Ideal para profesionales independientes.",
    features: [
      "Asistente IA Sofía por WhatsApp",
      "Envío de mensajes a terceros por encargo",
      "Memoria conversacional de clientes",
      "Gestión de contactos y casos",
      "Subida de documentos privados",
      "Análisis inteligente de documentos",
      "Agenda y recordatorios automáticos",
      "Resumen de pendientes al iniciar el día",
      "Resumen de agenda al finalizar el día",
      "Dashboard privado para documentos y clientes",
    ],
    limits: [
      "Hasta 300 conversaciones IA/mes",
      "Hasta 1GB de documentos y archivos",
    ],
    cta: "Probar 7 días gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: 49,
    description: "Incluye todo Starter +",
    features: [
      "Análisis avanzado de documentos",
      "Organización avanzada de casos",
      "Seguimiento automático de clientes",
      "Automatización de recordatorios",
      "Búsqueda inteligente dentro de documentos",
    ],
    limits: [
      "Hasta 900 conversaciones IA/mes",
      "Hasta 5GB de documentos y archivos",
    ],
    cta: "Probar 7 días gratis",
    popular: true,
  },
  {
    name: "Expert",
    price: 79,
    description: "Incluye todo Pro +",
    features: [
      "Automatizaciones avanzadas",
      "Workflows inteligentes",
      "Memoria ampliada de casos",
    ],
    limits: [
      "Hasta 2,500 conversaciones IA/mes",
      "Hasta 20GB de documentos y archivos",
    ],
    cta: "Probar 7 días gratis",
    popular: false,
  },
]

const businessPlans = [
  {
    name: "Business Starter",
    price: 29,
    description: "Para pequeños negocios.",
    features: [
      "Agente de ventas IA Sofía",
      "Atención automática por WhatsApp",
      "CRM básico",
      "Catálogo básico de productos o servicios",
      "Envío de cotizaciones",
      "Dashboard de ventas",
    ],
    limits: [
      "Hasta 300 conversaciones/mes",
      "Hasta 1GB de catálogo y archivos",
    ],
    cta: "Probar 7 días gratis",
    popular: false,
  },
  {
    name: "Business Pro",
    price: 79,
    description: "Incluye todo Starter +",
    features: [
      "CRM completo de ventas",
      "Pipeline de seguimiento de clientes",
      "Catálogo avanzado con variantes",
      "Gestión de reservas o pedidos",
      "Generación automática de links de pago",
      "Automatizaciones comerciales",
      "Reportes de ventas",
      "Notificaciones al dueño del negocio",
    ],
    limits: [
      "Hasta 1,200 conversaciones/mes",
      "Hasta 5GB de catálogo y archivos",
    ],
    cta: "Probar 7 días gratis",
    popular: true,
    hasOmnichannel: true,
  },
  {
    name: "Business Growth",
    price: 149,
    description: "Incluye todo Pro +",
    features: [
      "Seguimiento automático de clientes",
      "Recomendaciones inteligentes",
      "Campañas automáticas",
      "Analítica avanzada",
    ],
    limits: [
      "Hasta 3,500 conversaciones/mes",
      "Hasta 20GB de catálogo y archivos",
    ],
    cta: "Probar 7 días gratis",
    popular: false,
    hasOmnichannel: true,
  },
  {
    name: "Business Scale",
    price: 299,
    description: "Incluye todo Growth +",
    features: [
      "Múltiples agentes IA",
      "Multi sucursal",
      "Integraciones API avanzadas",
      "Analítica empresarial",
    ],
    limits: [
      "Hasta 10,000 conversaciones/mes",
    ],
    cta: "Contactar ventas",
    popular: false,
    hasOmnichannel: true,
  },
]

export function Pricing() {
  const [activeTab, setActiveTab] = useState<"professionals" | "business">("professionals")
  
  const plans = activeTab === "professionals" ? professionalPlans : businessPlans
  const accentColor = activeTab === "professionals" ? "#3B82F6" : "#34D399"

  return (
    <section id="precios" className="py-24 md:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Free trial banner */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F1F63] via-[#3B82F6] to-[#06B6D4] p-[1px]">
            <div className="relative bg-[#0F1F63]/95 backdrop-blur-sm rounded-2xl px-8 py-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#06B6D4]" />
                  <span className="text-xl font-bold text-white">Prueba Operaly gratis durante 7 días</span>
                </div>
                <span className="text-white/70">Sin tarjeta de crédito.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-sm font-semibold mb-4">
            Precios
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F1F63] text-balance">
            Planes simples y transparentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Todos los planes incluyen a <strong>Sofía</strong>, tu asistente IA con memoria conversacional.
          </p>
          <p className="mt-3 text-base text-[#0F1F63]/70 font-medium">
            WhatsApp + Redes sociales en un solo sistema de atención inteligente.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-secondary/80 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab("professionals")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "professionals"
                  ? "bg-white text-[#3B82F6] shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Para Profesionales
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "business"
                  ? "bg-white text-[#34D399] shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Para Negocios
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className={`grid gap-6 lg:gap-8 max-w-7xl mx-auto items-end ${
          activeTab === "business" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"
        }`}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "lg:scale-105 z-10" : ""
              }`}
            >
              {/* Outer glow for popular plan */}
              {plan.popular && (
                <div className="absolute -inset-4 bg-gradient-to-br from-[#7C3AED]/30 via-[#3B82F6]/30 to-[#06B6D4]/30 rounded-[2rem] blur-2xl opacity-60" />
              )}
              
              {/* Gradient border wrapper for popular plan */}
              <div
                className={`relative rounded-3xl ${
                  plan.popular
                    ? "p-[2px] bg-gradient-to-br from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] shadow-2xl shadow-[#7C3AED]/30"
                    : ""
                }`}
              >
                <div
                  className={`relative bg-card rounded-3xl flex flex-col h-full ${
                    plan.popular
                      ? "p-8 lg:p-10"
                      : "p-6 lg:p-8 border border-border shadow-sm"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-lg shadow-[#7C3AED]/30">
                      <Sparkles className="w-4 h-4" />
                      Más popular
                    </div>
                  )}

                  {/* Plan header */}
                  <div className={`text-center mb-6 ${plan.popular ? "pt-4" : ""}`}>
                    <h3 
                      className="text-xl font-bold mb-2"
                      style={{ color: accentColor }}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-3">
                      <span className="text-5xl font-bold text-[#0F1F63]">
                        ${plan.price}
                      </span>
                      <span className="text-lg text-muted-foreground">/ mes</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Limits */}
                  <div className="mb-6 p-3 rounded-xl bg-secondary/50 border border-border/50">
                    {plan.limits.map((limit) => (
                      <p key={limit} className="text-xs text-muted-foreground text-center">
                        {limit}
                      </p>
                    ))}
                  </div>

                  {/* Omnichannel badge for Business Pro+ */}
                  {plan.hasOmnichannel && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 via-[#3B82F6]/10 to-[#06B6D4]/10 border border-[#7C3AED]/20">
                      <p className="text-xs font-semibold text-[#7C3AED] mb-3">Canales integrados:</p>
                      <div className="flex items-center gap-2">
                        {/* WhatsApp */}
                        <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center" title="WhatsApp">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        {/* Instagram */}
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E4405F] to-[#C13584] flex items-center justify-center" title="Instagram">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        {/* Facebook Messenger */}
                        <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center" title="Facebook Messenger">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                          </svg>
                        </div>
                        {/* TikTok */}
                        <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center" title="TikTok">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div 
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <Check 
                            className="w-3 h-3" 
                            style={{ color: accentColor }}
                          />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full rounded-full h-14 text-base font-bold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white shadow-lg shadow-[#7C3AED]/25 hover:shadow-xl hover:shadow-[#7C3AED]/30 hover:scale-[1.02]"
                        : "bg-[#0F1F63] hover:bg-[#0F1F63]/90 text-white"
                    }`}
                    asChild
                  >
                    <a href="/register">{plan.cta}</a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion text */}
        <div className="text-center mt-12">
          <p className="text-lg font-semibold text-[#0F1F63]">
            Empieza gratis hoy. No necesitas tarjeta de crédito.
          </p>
        </div>

        {/* Enterprise note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Necesitas más conversaciones o un plan personalizado?{" "}
          <a href="#contacto" className="text-[#3B82F6] hover:underline font-medium">
            Contáctanos
          </a>
        </p>
      </div>
    </section>
  )
}
