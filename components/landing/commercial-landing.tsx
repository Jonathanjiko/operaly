"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  FileText,
  Mail,
  MessageCircle,
  Mic,
  PhoneCall,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"

type LandingLocale = "es" | "en" | "de" | "pt" | "fr" | "it"

const copy: Record<
  LandingLocale,
  {
    badge: string
    titleA: string
    titleB: string
    subtitle: string
    primary: string
    secondary: string
    panel: string
  }
> = {
  es: {
    badge: "Operaly le facilita la vida desde WhatsApp",
    titleA: "Delegue desde un chat.",
    titleB: "Recupere su día con orden real.",
    subtitle:
      "Audios, agenda, correos, contactos, listas, documentos y recordatorios en una experiencia simple, rápida y clara.",
    primary: "Prueba gratis",
    secondary: "Ver planes",
    panel: "Entrar al panel",
  },
  en: {
    badge: "Operaly makes daily work lighter from WhatsApp",
    titleA: "Delegate from one chat.",
    titleB: "Get your day back with real order.",
    subtitle:
      "Audio, agenda, email, contacts, lists, files and reminders in one clear and fast workflow.",
    primary: "Start free trial",
    secondary: "See plans",
    panel: "Open dashboard",
  },
  de: {
    badge: "Operaly erleichtert Ihren Alltag direkt in WhatsApp",
    titleA: "Delegieren Sie aus einem Chat.",
    titleB: "Holen Sie sich Ihren Tag geordnet zurück.",
    subtitle:
      "Audio, Agenda, E-Mails, Kontakte, Listen, Dateien und Erinnerungen in einem klaren und schnellen Ablauf.",
    primary: "Gratis testen",
    secondary: "Preise ansehen",
    panel: "Dashboard öffnen",
  },
  pt: {
    badge: "Operaly facilita seu dia a dia pelo WhatsApp",
    titleA: "Delegue em um só chat.",
    titleB: "Recupere seu dia com ordem real.",
    subtitle:
      "Áudios, agenda, e-mails, contatos, listas, arquivos e lembretes numa experiência clara e rápida.",
    primary: "Teste grátis",
    secondary: "Ver planos",
    panel: "Entrar no painel",
  },
  fr: {
    badge: "Operaly vous simplifie la vie depuis WhatsApp",
    titleA: "Déléguez depuis un seul chat.",
    titleB: "Retrouvez votre journée avec plus d’ordre.",
    subtitle:
      "Audio, agenda, e-mails, contacts, listes, fichiers et rappels dans une expérience claire et rapide.",
    primary: "Essai gratuit",
    secondary: "Voir les offres",
    panel: "Entrer dans le tableau",
  },
  it: {
    badge: "Operaly le semplifica la vita da WhatsApp",
    titleA: "Deleghi da una sola chat.",
    titleB: "Riprenda il controllo della giornata.",
    subtitle:
      "Audio, agenda, email, contatti, liste, file e promemoria in un flusso rapido e chiaro.",
    primary: "Prova gratis",
    secondary: "Vedi piani",
    panel: "Apri pannello",
  },
}

const modules = [
  {
    id: "agenda",
    icon: CalendarClock,
    title: "Agenda clara",
    summary: "Ve lo urgente, lo de salud primero y lo siguiente del día sin perder tiempo.",
    detail:
      "Operaly ordena primero lo más delicado, deja visibles recordatorios y le permite mover lo importante sin perder el hilo del día.",
  },
  {
    id: "correos",
    icon: Mail,
    title: "Correos y búsquedas",
    summary: "Pida revisar correos, asuntos o remitentes y Operaly le deja lo importante claro.",
    detail:
      "Puede pedirle que busque un remitente, un asunto o un tema, que resuma lo útil y que le deje lista la siguiente acción.",
  },
  {
    id: "contactos",
    icon: Users,
    title: "Contactos y seguimiento",
    summary: "Encuentre personas, datos, historial y próximos pasos desde un solo lugar.",
    detail:
      "Sirve para ubicar personas rápido, retomar contexto y pasar de una consulta a una llamada, correo o recordatorio en pocos pasos.",
  },
  {
    id: "documentos",
    icon: FileText,
    title: "Documentos y casos",
    summary: "Contratos, archivos, notas y contexto conectados para seguir cada tema con orden.",
    detail:
      "Operaly conecta archivos, casos y seguimiento para que usted no termine saltando entre carpetas, mensajes y tareas sueltas.",
  },
]

const proofPoints = [
  "Audios, tareas y pendientes",
  "Correos, contactos y documentos",
  "Agenda clara para todo el día",
  "Listas, casos y seguimiento",
  "Llamadas y mensajes a terceros",
  "Control simple desde su panel",
]

const testimonials = [
  "Le mando un audio y me deja claro qué sigue, qué falta y qué ya quedó resuelto.",
  "Me ayuda con agenda, correos y listas sin hacerme perder tiempo entre pantallas.",
]

function getCopy(locale?: string) {
  const normalized = (locale || "es") as LandingLocale
  return copy[normalized] || copy.es
}

export function CommercialLanding({ locale = "es" }: { locale?: string }) {
  const t = getCopy(locale)
  const [activeModule, setActiveModule] = useState<string | null>(modules[0]?.id || null)
  const selectedModule = modules.find((module) => module.id === activeModule) || modules[0]

  return (
    <section
      id="producto"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F7FAFF_0%,#EFF5FF_48%,#FFFFFF_100%)] pt-28 sm:pt-32"
    >
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#0F1F63_1px,transparent_1px),linear-gradient(90deg,#0F1F63_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-1/2 top-24 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.22),rgba(59,130,246,0.14)_55%,transparent_70%)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#25D366]/20 bg-white/90 px-4 py-2 text-sm font-semibold text-[#047857] shadow-sm">
              <Image src="/brands/whatsapp.svg" alt="WhatsApp" width={22} height={22} className="h-5 w-5" />
              {t.badge}
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#0F1F63] sm:text-6xl lg:text-7xl">
              {t.titleA}
              <span className="mt-3 block bg-gradient-to-r from-[#25D366] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                {t.titleB}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
              {t.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-8 text-base font-bold text-white shadow-[0_20px_45px_-18px_rgba(37,211,102,0.72)] transition hover:scale-[1.02]"
              >
                {t.primary}
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-[#0F1F63] shadow-sm"
              >
                {t.panel}
              </a>
              <a
                href="#precios"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#0F1F63] px-8 text-base font-bold text-white"
              >
                {t.secondary}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "7 días gratis",
                "Sin tarjeta para empezar",
                "WhatsApp + panel privado",
                "Más claridad desde el primer audio",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7F5] bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              {[
                { name: "WhatsApp", src: "/brands/whatsapp.svg" },
                { name: "Gmail", src: "/brands/gmail.svg" },
                { name: "Calendar", src: "/brands/google-calendar.svg" },
                { name: "Drive", src: "/brands/google-drive.svg" },
                { name: "Contactos", src: "/brands/google-contacts.svg" },
              ].map((item) => (
                <div key={item.name} className="rounded-[24px] border border-[#DCE7F5] bg-white/90 px-3 py-4 text-center shadow-sm">
                  <Image src={item.src} alt={item.name} width={44} height={44} className="mx-auto h-11 w-11 object-contain" />
                  <p className="mt-2 text-xs font-bold text-[#0F1F63]">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[42px] bg-gradient-to-br from-[#25D366]/20 via-[#3B82F6]/15 to-[#7C3AED]/16 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/88 p-4 shadow-[0_34px_90px_-30px_rgba(15,31,99,0.35)] backdrop-blur">
              <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[30px] bg-[#0F1F63] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image src="/brands/whatsapp.svg" alt="WhatsApp" width={48} height={48} className="h-12 w-12" />
                      <div>
                        <p className="text-base font-bold">Operaly en WhatsApp</p>
                        <p className="text-xs text-white/65">Activo ahora</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#25D366]/15 px-3 py-1 text-xs font-bold text-[#86EFAC]">
                      en línea
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      {
                        side: "left",
                        icon: Search,
                        text: "Operaly, revise mis correos de MAFRE, deje lo importante claro y luego recuérdeme llamar mañana.",
                      },
                      {
                        side: "right",
                        icon: Mic,
                        text: "Ya entendí. Primero le ordeno los correos y luego le dejo listo el recordatorio.",
                      },
                      {
                        side: "left",
                        icon: PhoneCall,
                        text: "Y si encuentra el contrato, envíeselo a Carlos.",
                      },
                      {
                        side: "right",
                        icon: ShieldCheck,
                        text: "Perfecto. Si es el correcto, sigo con el envío.",
                      },
                    ].map((message, index) => (
                      <div
                        key={`${message.text}-${index}`}
                        className={`rounded-3xl p-4 text-sm leading-relaxed shadow-sm ${
                          message.side === "left"
                            ? "mr-9 rounded-bl-md bg-white/12 text-white/90 animate-pulse"
                            : "ml-9 rounded-br-md bg-white text-[#0F1F63]"
                        }`}
                        style={{ animationDelay: `${index * 220}ms` }}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                          <message.icon className="h-3.5 w-3.5" />
                          {message.side === "left" ? "Usuario" : "Operaly"}
                        </div>
                        {message.text}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { icon: Mic, label: "Audio" },
                      { icon: Mail, label: "Correos" },
                      { icon: CalendarClock, label: "Agenda" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-center">
                        <item.icon className="mx-auto h-4 w-4 text-[#86EFAC]" />
                        <p className="mt-1 text-xs font-semibold text-white/80">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-[#DCE7F5] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
                          Panel Operaly
                        </p>
                        <p className="mt-1 text-xl font-black text-[#0F1F63]">
                          Lo importante se ve rápido.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
                        claro y útil
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {modules.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setActiveModule(item.id)}
                          className={`rounded-2xl border p-4 text-left transition hover:shadow-sm ${
                            selectedModule.id === item.id
                              ? "border-[#3B82F6]/35 bg-[#EEF6FF]"
                              : "border-slate-200 bg-[#F8FBFF] hover:border-[#3B82F6]/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-[#0F1F63]">
                            <item.icon className="h-4 w-4 text-[#3B82F6]" />
                            <p className="text-sm font-semibold">{item.title}</p>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#DCE7F5] bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">Ventana rápida</p>
                    <div className="mt-4 rounded-[24px] border border-slate-200 bg-[#F8FBFF] p-4">
                      <div className="flex items-center gap-2 text-[#0F1F63]">
                        <selectedModule.icon className="h-4 w-4 text-[#3B82F6]" />
                        <p className="text-base font-bold">{selectedModule.title}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{selectedModule.detail}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1F63] shadow-sm">
                          Más claro
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1F63] shadow-sm">
                          Más rápido
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1F63] shadow-sm">
                          Menos vueltas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#DCE7F5] bg-[linear-gradient(180deg,#0F1F63_0%,#162875_100%)] p-5 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Lo mejor de Operaly</p>
                    <p className="mt-2 text-3xl font-black tracking-tight">Empiece a delegar desde el primer audio.</p>
                    <div className="mt-4 space-y-3 text-sm text-white/80">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="mt-0.5 h-4 w-4 text-[#86EFAC]" />
                        WhatsApp como canal principal, sin obligarlo a cambiar su rutina.
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 text-[#86EFAC]" />
                        Correos, contactos y búsquedas listas para actuar, no solo para mirar.
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarClock className="mt-0.5 h-4 w-4 text-[#86EFAC]" />
                        Agenda, recordatorios y seguimiento con prioridad visible.
                      </div>
                    </div>
                    <a
                      href="/register"
                      className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#0F1F63]"
                    >
                      Prueba gratis
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {testimonials.map((item, index) => (
            <div key={item} className="rounded-[28px] border border-[#DCE7F5] bg-white/92 p-5 shadow-sm">
              <p className="text-sm leading-7 text-slate-700">“{item}”</p>
              <p className="mt-3 text-sm font-semibold text-[#0F1F63]">
                {index === 0 ? "Profesional independiente" : "Dueño de negocio"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[30px] border border-[#DCE7F5] bg-white/85 p-4 shadow-sm">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-[#0F1F63]">
            {proofPoints.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#25D366]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
          <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-[0_24px_60px_-25px_rgba(15,31,99,0.45)] backdrop-blur">
            <a
              href="/register"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 text-sm font-bold text-white"
            >
              Prueba gratis
            </a>
            <a
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-[#0F1F63]"
            >
              Entrar
            </a>
          </div>
        </div>
      </div>

      <section id="como-funciona" className="mx-auto mt-20 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-[#DCE7F5] bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1F63] sm:text-4xl">
              Lo que el usuario hace todos los días, aquí ya se ve en serio.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Operaly escucha, ordena, resuelve y confirma. No lo deja con un mensaje suelto: le muestra qué entendió, qué hizo y qué sigue.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Mic,
                title: "Usted manda un audio",
                text: "Operaly transcribe, ordena y solo le pregunta la parte que haga falta aclarar.",
              },
              {
                icon: Search,
                title: "Operaly ejecuta",
                text: "Agenda, busca correos, revisa contactos, mueve listas, ubica documentos o llama donde corresponda.",
              },
              {
                icon: CircleHelp,
                title: "Y le deja claro el resultado",
                text: "Qué quedó listo, qué se envió y qué le conviene revisar a continuación.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[26px] border border-slate-200 bg-[#F8FBFF] p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <item.icon className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <p className="mt-4 text-lg font-bold text-[#0F1F63]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}
