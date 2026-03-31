"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Lock,
  Mic,
  PhoneCall,
  Send,
  Sparkles,
} from "lucide-react"
import Image from "next/image"

const commandPills = [
  "Operaly, recuérdame llamar al notario mañana a las 9 am",
  "Envía este PDF y un audio a mi esposa cuando salga de la reunión",
  "Resume mis pendientes del día y léemelos por audio",
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(15,31,99,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,31,99,1)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-1/2 top-0 h-[680px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(124,58,237,0.10)_35%,rgba(6,182,212,0.08)_55%,transparent_72%)] blur-3xl" />
      <div className="absolute -left-28 top-40 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10),transparent_70%)] blur-3xl" />
      <div className="absolute -right-24 top-56 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_70%)] blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/15 bg-white/80 px-4 py-2 text-sm font-semibold text-[#5B21B6] shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Operaly Assistant · Tu asistente personal dentro de WhatsApp
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-[#0F1F63] sm:text-6xl lg:text-7xl">
            Menos caos mental.
            <span className="mt-2 block bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
              Más control real sobre tu vida, tus casos y tus pendientes.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Operaly organiza tu agenda, recuerda todo, programa tareas, manda archivos, llama por ti,
            guarda información sensible y te devuelve claridad desde el mismo WhatsApp que ya usas todos los días.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Para personas desorganizadas con demasiado en la cabeza",
              "Ideal para abogados, consultores, médicos y profesionales intensos",
              "Agenda, archivos, recordatorios, llamadas y seguimiento en un solo lugar",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#0F1F63] shadow-sm backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] px-9 text-base font-semibold text-white shadow-[0_18px_45px_-15px_rgba(59,130,246,0.7)] hover:opacity-95"
              asChild
            >
              <a href="/register">
                Probar 7 días gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-full border-white/70 bg-white/75 px-9 text-base font-semibold text-[#0F1F63] shadow-sm backdrop-blur hover:bg-white"
              asChild
            >
              <a href="#dashboard">Ver dashboard</a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              Configuración rápida
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              Dashboard privado
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              Integración con Google Calendar y Drive
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-[#7C3AED]/20 via-[#3B82F6]/15 to-[#06B6D4]/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-4 shadow-[0_30px_80px_-18px_rgba(15,31,99,0.22)] backdrop-blur-xl">
            <div className="rounded-[26px] border border-[#E6EAF5] bg-[#F8FBFF] p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[#E8EDF8] pb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/operaly-logo.png"
                    alt="Operaly"
                    width={72}
                    height={72}
                    className="h-11 w-auto mix-blend-multiply"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0F1F63]">Operaly Assistant</p>
                    <p className="text-xs text-muted-foreground">Siempre activo en tu WhatsApp</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#059669]">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  24/7 operativo
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {commandPills.map((command, index) => (
                  <div
                    key={command}
                    className={`rounded-2xl border px-4 py-3 shadow-sm ${
                      index === 1
                        ? "ml-6 border-[#DDE7FF] bg-white"
                        : "mr-6 border-[#E6ECF8] bg-white/80"
                    }`}
                  >
                    <p className="text-sm font-medium text-[#0F1F63]">{command}</p>
                  </div>
                ))}

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#E6ECF8] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                      <CalendarClock className="h-4 w-4 text-[#3B82F6]" />
                      Hoy
                    </div>
                    <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-center justify-between rounded-xl bg-[#F8FBFF] px-3 py-2">
                        Audiencia 10:00 AM <span className="font-medium text-[#3B82F6]">Lista</span>
                      </li>
                      <li className="flex items-center justify-between rounded-xl bg-[#F8FBFF] px-3 py-2">
                        Llamar a restaurante 4:00 PM <span className="font-medium text-[#7C3AED]">Programado</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#E6ECF8] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                      <Lock className="h-4 w-4 text-[#7C3AED]" />
                      Baúl privado
                    </div>
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <div className="rounded-xl bg-[#F8FBFF] px-3 py-2">Contraseña SAT · protegida</div>
                      <div className="rounded-xl bg-[#F8FBFF] px-3 py-2">PDF contrato · listo para enviar</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    { icon: Mic, label: "Notas por voz" },
                    { icon: Bell, label: "Recordatorios" },
                    { icon: PhoneCall, label: "Llamadas" },
                    { icon: Send, label: "Envíos a terceros" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-[#E6ECF8] bg-white px-3 py-4 text-center shadow-sm">
                      <item.icon className="mx-auto h-5 w-5 text-[#3B82F6]" />
                      <p className="mt-2 text-xs font-semibold text-[#0F1F63]">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
