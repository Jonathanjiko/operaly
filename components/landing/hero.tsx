"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowRight, Bell, CalendarClock, CheckCircle2,
  Lock, Mic, PhoneCall, Send, Sparkles, Star,
  Zap, Brain, Clock, Users,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

const commandPills = [
  "Operaly, recuérdame llamar al notario mañana a las 9 am",
  "Envía este PDF y un audio a mi esposa cuando salga de la reunión",
  "Resume mis pendientes del día y léemelos por audio",
]

const stats = [
  { value: "4.9", label: "Valoración", icon: Star },
  { value: "< 2min", label: "Configuración", icon: Clock },
  { value: "24/7", label: "Disponible", icon: Zap },
  { value: "100%", label: "WhatsApp nativo", icon: Brain },
]

export function Hero() {
  const [activeCommand, setActiveCommand] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCommand((prev) => (prev + 1) % commandPills.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(15,31,99,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,31,99,1)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-1/2 top-0 h-[680px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(124,58,237,0.10)_35%,rgba(6,182,212,0.08)_55%,transparent_72%)] blur-3xl" />
      <div className="absolute -left-28 top-40 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10),transparent_70%)] blur-3xl" />
      <div className="absolute -right-24 top-56 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_70%)] blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24">
        <div>
          {/* Badge urgencia */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-gradient-to-r from-[#7C3AED]/10 to-[#3B82F6]/10 px-4 py-2 text-sm font-semibold text-[#5B21B6] shadow-sm backdrop-blur mb-6">
            <Sparkles className="h-4 w-4 text-[#7C3AED]" />
            <span>El asistente que opera por ti en WhatsApp</span>
            <span className="ml-1 rounded-full bg-[#EF4444] px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wide">Nuevo</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-[#0F1F63] sm:text-6xl lg:text-7xl">
            Tu cerebro tiene{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                demasiado.
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-40" />
            </span>
            <br />
            <span className="mt-2 block">Operaly carga el resto.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Agenda, llamadas, archivos, recordatorios, mensajes a terceros y análisis de documentos —
            todo desde WhatsApp. Sin apps nuevas. Sin fricción.
          </p>

          {/* Pain points */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            {[
              "✓ Cero apps nuevas que aprender",
              "✓ Funciona en tu WhatsApp actual",
              "✓ Para profesionales con agenda apretada",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-4 py-2 text-sm font-medium text-[#1E40AF]"
              >
                {item}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-14 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] px-9 text-base font-bold text-white shadow-[0_18px_45px_-15px_rgba(59,130,246,0.7)] hover:opacity-95 hover:scale-[1.02] transition-all"
              asChild
            >
              <a href="/register">
                Probar 7 días gratis — sin tarjeta
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <a
              href="#dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#0F1F63] transition-colors"
            >
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] border-2 border-white" />
                ))}
              </div>
              <span>Ver cómo funciona →</span>
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-4 h-4 text-[#3B82F6] mx-auto mb-1" />
                <p className="text-xl font-bold text-[#0F1F63]">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Card */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-[#7C3AED]/20 via-[#3B82F6]/15 to-[#06B6D4]/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-4 shadow-[0_30px_80px_-18px_rgba(15,31,99,0.22)] backdrop-blur-xl">
            <div className="rounded-[26px] border border-[#E6EAF5] bg-[#F8FBFF] p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8EDF8] pb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/operaly-logo.png"
                    alt="Operaly"
                    width={72}
                    height={72}
                    className="h-10 w-auto mix-blend-multiply"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0F1F63]">Operaly Assistant</p>
                    <p className="text-xs text-muted-foreground">Siempre activo en tu WhatsApp</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#059669]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  24/7 operativo
                </span>
              </div>

              {/* Commands animados */}
              <div className="mt-4 space-y-2.5">
                {commandPills.map((command, index) => (
                  <div
                    key={command}
                    className={`rounded-2xl border px-4 py-3 shadow-sm transition-all duration-500 ${
                      index === activeCommand
                        ? "border-[#3B82F6]/30 bg-[#EFF6FF] scale-[1.01]"
                        : index === 1
                        ? "ml-6 border-[#DDE7FF] bg-white opacity-70"
                        : "mr-6 border-[#E6ECF8] bg-white/80 opacity-70"
                    }`}
                  >
                    <p className="text-sm font-medium text-[#0F1F63]">{command}</p>
                    {index === activeCommand && (
                      <p className="text-xs text-[#3B82F6] mt-1 font-medium">Procesando... ✓</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Mini dashboard */}
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#E6ECF8] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                    <CalendarClock className="h-4 w-4 text-[#3B82F6]" />
                    Hoy
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center justify-between rounded-xl bg-[#F8FBFF] px-3 py-2">
                      <span className="text-muted-foreground">Audiencia 10:00 AM</span>
                      <span className="font-semibold text-[#3B82F6]">Lista</span>
                    </li>
                    <li className="flex items-center justify-between rounded-xl bg-[#F8FBFF] px-3 py-2">
                      <span className="text-muted-foreground">Llamar restaurante 4PM</span>
                      <span className="font-semibold text-[#7C3AED]">Prog.</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#E6ECF8] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                    <Lock className="h-4 w-4 text-[#7C3AED]" />
                    Baúl privado
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-muted-foreground">Contraseña SAT · protegida</div>
                    <div className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-muted-foreground">PDF contrato · listo para enviar</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { icon: Mic, label: "Voz" },
                  { icon: Bell, label: "Alertas" },
                  { icon: PhoneCall, label: "Llamadas" },
                  { icon: Send, label: "Envíos" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#E6ECF8] bg-white px-2 py-3 text-center shadow-sm">
                    <item.icon className="mx-auto h-4 w-4 text-[#3B82F6]" />
                    <p className="mt-1.5 text-[10px] font-semibold text-[#0F1F63]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -right-4 top-8 hidden lg:block">
            <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1F63]">Profesionales activos</p>
                  <p className="text-[10px] text-[#10B981] font-semibold">usando Operaly hoy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom urgency bar */}
      <div className="relative border-t border-[#3B82F6]/10 bg-gradient-to-r from-[#3B82F6]/5 via-[#7C3AED]/5 to-[#06B6D4]/5 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span className="font-medium text-[#0F1F63]">Sin instalación</span> — funciona en tu WhatsApp actual
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span className="font-medium text-[#0F1F63]">7 días gratis</span> — sin tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span className="font-medium text-[#0F1F63]">Cancela cuando quieras</span> — sin permanencia
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
