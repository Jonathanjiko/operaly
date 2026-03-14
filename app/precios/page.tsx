"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles, Zap, ArrowRight, ChevronDown } from "lucide-react"

const professionalPlans = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    period: "mes",
    description: "Explora las funciones básicas de Sofía",
    features: [
      { text: "50 consultas con Sofía", included: true },
      { text: "Calendario básico", included: true },
      { text: "Almacenamiento 500MB", included: true },
      { text: "1 usuario", included: true },
      { text: "Gestión de casos", included: false },
      { text: "Documentos inteligentes", included: false },
    ],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    id: "professional",
    name: "Profesional",
    price: 29,
    period: "mes",
    description: "Para profesionales independientes",
    features: [
      { text: "500 consultas con Sofía", included: true },
      { text: "Calendario avanzado", included: true },
      { text: "Almacenamiento 5GB", included: true },
      { text: "1 usuario", included: true },
      { text: "Gestión de casos ilimitada", included: true },
      { text: "Documentos inteligentes", included: true },
    ],
    cta: "Comenzar prueba gratis",
    popular: true,
  },
  {
    id: "team",
    name: "Equipo",
    price: 59,
    period: "mes",
    description: "Para equipos y estudios",
    features: [
      { text: "Consultas ilimitadas", included: true },
      { text: "Calendario con múltiples agendas", included: true },
      { text: "Almacenamiento 25GB", included: true },
      { text: "Hasta 5 usuarios", included: true },
      { text: "Gestión de casos ilimitada", included: true },
      { text: "Documentos inteligentes + plantillas", included: true },
    ],
    cta: "Comenzar prueba gratis",
    popular: false,
  },
]

const businessPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    period: "mes",
    description: "Para emprendedores",
    features: [
      { text: "500 conversaciones Sofía", included: true },
      { text: "WhatsApp Business", included: true },
      { text: "CRM básico", included: true },
      { text: "Catálogo de productos", included: true },
      { text: "Instagram y Facebook", included: false },
      { text: "Campañas de marketing", included: false },
    ],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    id: "pro",
    name: "Business Pro",
    price: 79,
    period: "mes",
    description: "Para negocios en crecimiento",
    features: [
      { text: "2000 conversaciones Sofía", included: true },
      { text: "WhatsApp + Instagram + Facebook", included: true },
      { text: "CRM completo + Pipeline", included: true },
      { text: "Catálogo ilimitado", included: true },
      { text: "Campañas de marketing", included: true },
      { text: "Analíticas avanzadas", included: true },
    ],
    cta: "Comenzar prueba gratis",
    popular: true,
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    period: "mes",
    description: "Para equipos de ventas",
    features: [
      { text: "Conversaciones ilimitadas", included: true },
      { text: "Todos los canales", included: true },
      { text: "CRM + Automatizaciones", included: true },
      { text: "Hasta 10 agentes", included: true },
      { text: "API access", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    cta: "Contactar ventas",
    popular: false,
  },
]

const addOns = [
  { id: "audio", name: "Audio IA (+60 min)", price: 20, description: "Transcripción y resumen de reuniones" },
  { id: "conversations", name: "+2000 conversaciones", price: 15, description: "Conversaciones adicionales por mes" },
  { id: "social", name: "Redes sociales", price: 25, description: "Instagram, Facebook, TikTok" },
  { id: "storage", name: "+10GB almacenamiento", price: 10, description: "Espacio adicional para archivos" },
  { id: "staff", name: "Usuario adicional", price: 15, description: "Por cada miembro extra del equipo" },
]

const faqs = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratea la diferencia."
  },
  {
    q: "¿Qué incluye la prueba gratis?",
    a: "La prueba gratis de 14 días incluye acceso completo a todas las funciones del plan que elijas, sin necesidad de tarjeta de crédito."
  },
  {
    q: "¿Cómo funciona la facturación?",
    a: "Facturamos mensualmente al inicio de cada período. Aceptamos tarjetas de crédito/débito y puedes cancelar en cualquier momento."
  },
  {
    q: "¿Sofía aprende de mis conversaciones?",
    a: "Sí, Sofía mejora continuamente con cada interacción, aprendiendo tu estilo, productos y respuestas frecuentes para dar respuestas más precisas."
  },
]

export default function PricingPage() {
  const [planType, setPlanType] = useState<"professional" | "business">("business")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const currentPlans = planType === "professional" ? professionalPlans : businessPlans

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/images/operaly-logo.png" alt="Operaly" width={120} height={120} className="h-8 w-auto" />
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="rounded-xl">Iniciar sesión</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#34D399]/10 via-[#06B6D4]/10 to-[#3B82F6]/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#34D399]" />
            <span className="text-sm font-medium text-[#0F1F63]">Planes y precios</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F1F63] mb-4 text-balance">
            Elige el plan perfecto para tu negocio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Comienza gratis y escala según creces. Sin compromisos, cancela cuando quieras.
          </p>

          {/* Plan type toggle */}
          <div className="inline-flex bg-secondary rounded-2xl p-1 mb-12">
            <button
              onClick={() => setPlanType("business")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                planType === "business" 
                  ? "bg-card text-[#0F1F63] shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Negocios y Comercios
            </button>
            <button
              onClick={() => setPlanType("professional")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                planType === "professional" 
                  ? "bg-card text-[#0F1F63] shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profesionales
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {currentPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-card rounded-3xl border p-8 relative ${
                  plan.popular 
                    ? "border-[#34D399] shadow-xl shadow-[#34D399]/10" 
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#34D399] to-[#06B6D4] text-white text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Más popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-[#0F1F63] mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[#0F1F63]">S/ {plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-[#34D399] flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full rounded-xl h-12 ${
                    plan.popular 
                      ? "bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F1F63] mb-4">Add-ons disponibles</h2>
            <p className="text-muted-foreground">Personaliza tu plan con funciones adicionales</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {addOns.map((addon) => (
              <div key={addon.id} className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-[#0F1F63] mb-1">{addon.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{addon.description}</p>
                <p className="text-lg font-bold text-[#047857]">+S/ {addon.price}/mes</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F1F63] mb-4">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-[#0F1F63]">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${
                    openFaq === index ? "rotate-180" : ""
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] rounded-3xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para conocer a Sofía?
            </h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
              Comienza tu prueba gratuita de 14 días. Sin tarjeta de crédito.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#047857] hover:bg-white/90 rounded-xl h-14 px-8 text-lg">
                Comenzar ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/images/operaly-logo.png" alt="Operaly" width={100} height={100} className="h-6 w-auto" />
          <p className="text-sm text-muted-foreground">2026 Operaly. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
