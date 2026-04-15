import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MessageCircle,
  Mic,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"

const outcomes = [
  "Agenda y recordatorios",
  "Audios entendidos",
  "Archivos y casos",
  "Contactos y envios",
  "Llamadas salientes",
  "Automatizaciones",
]

const proofCards = [
  {
    icon: MessageCircle,
    title: "Vive en WhatsApp",
    text: "Le escribes o hablas como a una persona. Operaly entiende, confirma y ejecuta.",
  },
  {
    icon: ShieldCheck,
    title: "Dashboard de control",
    text: "No es un chat: ves agenda, archivos, pagos, integraciones y configuracion.",
  },
  {
    icon: LockKeyhole,
    title: "Tu data queda trazada",
    text: "Cada accion deja huella: mensajes, pagos, agenda, archivos, casos y automatizaciones.",
  },
]

const useCases = [
  {
    icon: CalendarDays,
    title: "No olvides nada",
    text: "Agenda, tareas, saludos diarios y cierre del dia con pendientes claros.",
  },
  {
    icon: FileText,
    title: "Recupera contexto",
    text: "Sube PDFs, imagenes o documentos y luego pregunta por ellos desde WhatsApp.",
  },
  {
    icon: PhoneCall,
    title: "Delega acciones",
    text: "Pide llamadas, envios a contactos, follow-ups o reservas con confirmacion.",
  },
]

const trust = [
  "7 dias gratis",
  "Sin tarjeta para empezar",
  "Mercado Pago",
  "Cancela cuando quieras",
]

type LandingLocale = "es" | "en" | "de" | "pt" | "fr"

const copy: Record<LandingLocale, {
  badge: string
  headlineA: string
  headlineB: string
  subtitle: string
  primary: string
  secondary: string
  proofTitle: string
  proofText: string
}> = {
  es: {
    badge: "Tu asistente personal operativo por WhatsApp",
    headlineA: "Deja de cargar todo en tu cabeza.",
    headlineB: "Delegalo por WhatsApp.",
    subtitle: "Operaly agenda, recuerda, analiza archivos, prepara envios y hace seguimiento sin que tengas que abrir otra app.",
    primary: "Probar 7 dias gratis",
    secondary: "Ver planes",
    proofTitle: "No guarda notas. Te ayuda a cerrar pendientes.",
    proofText: "Si una accion es ambigua o sensible, Operaly confirma antes de ejecutar. Humano por fuera, trazable por dentro.",
  },
  en: {
    badge: "Your personal operating assistant on WhatsApp",
    headlineA: "Stop carrying everything in your head.",
    headlineB: "Delegate it on WhatsApp.",
    subtitle: "Operaly schedules, reminds, analyzes files, prepares sends and follows up without another app to learn.",
    primary: "Start 7 days free",
    secondary: "See plans",
    proofTitle: "It does not store notes. It helps you close loops.",
    proofText: "When something is sensitive or unclear, Operaly asks before acting. Human outside, traceable inside.",
  },
  de: {
    badge: "Dein operativer Assistent in WhatsApp",
    headlineA: "Hör auf, alles im Kopf zu behalten.",
    headlineB: "Delegiere es in WhatsApp.",
    subtitle: "Operaly plant, erinnert, analysiert Dateien, bereitet Nachrichten vor und verfolgt Aufgaben ohne neue App.",
    primary: "7 Tage kostenlos testen",
    secondary: "Preise ansehen",
    proofTitle: "Keine Notizen-App. Operaly erledigt offene Punkte.",
    proofText: "Bei sensiblen oder unklaren Aktionen fragt Operaly vorher nach. Menschlich aussen, nachvollziehbar innen.",
  },
  pt: {
    badge: "Seu assistente operacional no WhatsApp",
    headlineA: "Pare de carregar tudo na cabeça.",
    headlineB: "Delegue pelo WhatsApp.",
    subtitle: "Operaly agenda, lembra, analisa arquivos, prepara envios e acompanha pendencias sem outra app.",
    primary: "Testar 7 dias gratis",
    secondary: "Ver planos",
    proofTitle: "Nao guarda notas. Ajuda voce a concluir pendencias.",
    proofText: "Se algo for ambiguo ou sensivel, Operaly confirma antes de agir. Humano por fora, rastreavel por dentro.",
  },
  fr: {
    badge: "Votre assistant operationnel dans WhatsApp",
    headlineA: "Arretez de tout garder en tete.",
    headlineB: "Deleguez-le sur WhatsApp.",
    subtitle: "Operaly planifie, rappelle, analyse les fichiers, prepare les envois et suit vos actions sans nouvelle app.",
    primary: "Essai gratuit 7 jours",
    secondary: "Voir les offres",
    proofTitle: "Ce n'est pas une app de notes. Operaly vous aide a conclure.",
    proofText: "Si une action est sensible ou ambigue, Operaly confirme avant d'agir. Humain dehors, tracable dedans.",
  },
}

export function CommercialLanding({ locale = "es" }: { locale?: string }) {
  const t = copy[(locale as LandingLocale) in copy ? (locale as LandingLocale) : "en"]

  return (
    <>
      <section className="relative overflow-hidden bg-[#F6F8FC] pt-28">
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#0F1F63_1px,transparent_1px),linear-gradient(90deg,#0F1F63_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute left-1/2 top-0 h-[640px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,211,102,0.20),rgba(59,130,246,0.16)_36%,rgba(124,58,237,0.10)_58%,transparent_72%)] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#25D366]/25 bg-white/80 px-4 py-2 text-sm font-semibold text-[#047857] shadow-sm">
              <Sparkles className="h-4 w-4" />
              {t.badge}
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.055em] text-[#0F1F63] sm:text-6xl lg:text-7xl">
              {t.headlineA}
              <span className="mt-3 block bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
                {t.headlineB}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {t.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-8 text-base font-bold text-white shadow-[0_18px_45px_-16px_rgba(37,211,102,0.7)] transition hover:scale-[1.02]"
              >
                {t.primary}
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#precios"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#DCE7F5] bg-white px-8 text-base font-bold text-[#0F1F63] shadow-sm transition hover:border-[#3B82F6]/40"
              >
                {t.secondary}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {trust.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7F5] bg-white px-3 py-1.5 text-sm font-medium text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[42px] bg-gradient-to-br from-[#25D366]/20 via-[#3B82F6]/18 to-[#7C3AED]/16 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/85 p-4 shadow-[0_34px_90px_-30px_rgba(15,31,99,0.35)] backdrop-blur">
              <div className="rounded-[28px] border border-[#DCE7F5] bg-[#0F1F63] p-5 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366]">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Operaly en WhatsApp</p>
                      <p className="text-xs text-white/60">online ahora</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#25D366]/15 px-3 py-1 text-xs font-bold text-[#86EFAC]">
                    24/7
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="mr-10 rounded-3xl rounded-bl-md bg-white/10 p-4 text-sm leading-relaxed text-white/90">
                    Operaly, agenda reunion con Ana el jueves 4pm y recuerdame 10 min antes.
                  </div>
                  <div className="ml-10 rounded-3xl rounded-br-md bg-[#25D366] p-4 text-sm font-medium text-white">
                    Listo. Lo agregue a tu agenda y creare el recordatorio 10 minutos antes.
                  </div>
                  <div className="mr-10 rounded-3xl rounded-bl-md bg-white/10 p-4 text-sm leading-relaxed text-white/90">
                    Tambien envia este PDF a Carlos con un mensaje profesional.
                  </div>
                  <div className="ml-10 rounded-3xl rounded-br-md bg-white p-4 text-sm font-semibold text-[#0F1F63]">
                    Te sugiero este mensaje antes de enviarlo. Confirmas?
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { icon: Mic, label: "Voz" },
                    { icon: FileText, label: "Docs" },
                    { icon: Zap, label: "Auto" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-center">
                      <item.icon className="mx-auto h-4 w-4 text-[#86EFAC]" />
                      <p className="mt-1 text-xs font-semibold text-white/80">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-y border-[#DCE7F5] bg-white/70 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-3 px-4 text-sm font-semibold text-[#0F1F63] sm:px-6 lg:px-8">
            {outcomes.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#25D366]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {proofCards.map((card) => (
              <article key={card.title} className="rounded-[28px] border border-[#DCE7F5] bg-[#F8FBFF] p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <card.icon className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <h2 className="text-xl font-bold text-[#0F1F63]">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="funciones" className="bg-[#F6F8FC] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#3B82F6]">Que hace</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.035em] text-[#0F1F63] sm:text-5xl">
                {t.proofTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              {t.proofText}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {useCases.map((useCase) => (
              <article key={useCase.title} className="group overflow-hidden rounded-[30px] border border-[#DCE7F5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#EFF6FF] to-[#ECFDF5]">
                  <useCase.icon className="h-6 w-6 text-[#0F1F63]" />
                </div>
                <h3 className="text-2xl font-black tracking-[-0.025em] text-[#0F1F63]">{useCase.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{useCase.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
