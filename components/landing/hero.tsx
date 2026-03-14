"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic background with subtle radial gradients */}
      <div className="absolute inset-0 bg-background">
        {/* Primary radial gradient - top center */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] opacity-50"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)'
          }}
        />
        
        {/* Secondary radial gradient - left */}
        <div 
          className="absolute top-1/4 -left-48 w-[700px] h-[700px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, rgba(59,130,246,0.03) 50%, transparent 70%)'
          }}
        />
        
        {/* Tertiary radial gradient - right */}
        <div 
          className="absolute top-1/3 -right-48 w-[600px] h-[600px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)'
          }}
        />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(15,31,99,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,31,99,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
        {/* Logo with enhanced multi-layer glow */}
        <div className="relative inline-block mb-12">
          {/* Outermost glow - animated pulse */}
          <div 
            className="absolute -inset-20 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite] opacity-50"
            style={{
              background: 'conic-gradient(from 0deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15), rgba(6,182,212,0.15), rgba(52,211,153,0.15), rgba(124,58,237,0.15))'
            }}
          />
          {/* Middle glow layer */}
          <div 
            className="absolute -inset-12 rounded-full blur-2xl opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(6,182,212,0.2) 50%, transparent 70%)'
            }}
          />
          {/* Inner glow layer */}
          <div 
            className="absolute -inset-6 rounded-full blur-xl opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(124,58,237,0.15) 60%, transparent 80%)'
            }}
          />
          <Image 
            src="/images/operaly-logo.png" 
            alt="Operaly" 
            width={220} 
            height={220}
            className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mx-auto object-contain mix-blend-multiply"
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F1F63] leading-[1.15]">
          <span className="block mb-2">Convierte WhatsApp en tu</span>
          <span className="block bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            asistente inteligente
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          <span className="font-semibold text-[#7C3AED]">Sofía</span> organiza tus clientes, conversaciones, tareas y ventas automáticamente desde WhatsApp.
        </p>

        {/* Engagement badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "Tu IA que nunca olvida nada",
            "Un agente de ventas que nunca falla",
            "Todo desde WhatsApp"
          ].map((phrase) => (
            <span 
              key={phrase}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm text-sm font-medium text-[#0F1F63]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              {phrase}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Button 
            size="lg" 
            className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:from-[#2563EB] hover:to-[#0891B2] rounded-full shadow-lg shadow-[#3B82F6]/20 hover:shadow-xl hover:shadow-[#3B82F6]/25 transition-all duration-300 hover:-translate-y-0.5 group"
            asChild
          >
            <a href="/register">
              Probar 7 días gratis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-10 text-base font-semibold rounded-full border-2 border-border/80 hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/5 transition-all duration-300"
            asChild
          >
            <a href="#como-funciona">
              Ver cómo funciona
            </a>
          </Button>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] border-2 border-background shadow-sm"
                />
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-foreground">+2,500</span>
              <span className="text-muted-foreground ml-1">profesionales activos</span>
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-border" />
          
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-amber-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-foreground">4.9</span>
              <span className="text-muted-foreground ml-1">de 500+ reseñas</span>
            </div>
          </div>
        </div>

        {/* Multilanguage note */}
        <p className="mt-10 text-sm text-muted-foreground">
          Operaly funciona en cualquier idioma automáticamente
        </p>
      </div>
    </section>
  )
}
