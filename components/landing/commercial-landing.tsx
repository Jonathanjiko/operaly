import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderKanban,
  LockKeyhole,
  MessageCircle,
  Mic,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

const outcomes = [
  "Agenda y recordatorios claros",
  "Audios entendidos y confirmados",
  "Contactos, correos y documentos",
  "Casos y seguimientos trazables",
  "Llamadas y mensajes a terceros",
  "Dashboard privado para control real",
]

const proofCards = [
  {
    icon: MessageCircle,
    title: "Opera donde ya vive",
    text: "Operaly trabaja desde WhatsApp, no le obliga a aprender una app nueva para empezar a delegar.",
  },
  {
    icon: ShieldCheck,
    title: "Se controla desde dashboard",
    text: "Usted ve agenda, documentos, listas, integraciones, uso y plan sin perder el foco comercial.",
  },
  {
    icon: LockKeyhole,
    title: "Todo deja huella",
    text: "Mensajes, agenda, contexto, documentos y acciones quedan trazados para no perder el hilo.",
  },
]

const useCases = [
  {
    icon: CalendarDays,
    title: "Facilita su dia a dia",
    text: "Agenda, recuerda, resume y prioriza lo importante para que usted no cargue todo en la cabeza.",
  },
  {
    icon: FileText,
    title: "Recupera contexto rapido",
    text: "Revise documentos, casos, correos y notas desde una sola conversacion sin dar vueltas.",
  },
  {
    icon: PhoneCall,
    title: "Ejecuta y acompana",
    text: "Puede preparar envios, buscar informacion, seguir pendientes y ayudarle a cerrar acciones reales.",
  },
]

const fixtures = [
  {
    label: "WhatsApp operativo",
    value: "Audio, texto, listas, agenda y follow-ups",
  },
  {
    label: "Dashboard profesional",
    value: "Agenda, voz, asistente, integraciones y plan",
  },
  {
    label: "Marca viva",
    value: "Operaly siempre invita a usarlo y volver",
  },
]

const trust = [
  "7 dias gratis",
  "Sin tarjeta para empezar",
  "Mercado Pago",
  "Entre o pruebe en segundos",
]

type LandingLocale = "es" | "en" | "de" | "pt" | "fr"

const copy: Record<
  LandingLocale,
  {
    badge: string
    headlineA: string
    headlineB: string
    subtitle: string
    primary: string
    secondary: string
    dashboard: string
    proofTitle: string
    proofText: string
  }
> = {
  es: {
    badge: "Operaly le facilita la vida desde WhatsApp",
    headlineA: "Menos carga mental.",
    headlineB: "Mas accion clara en su dia.",
    subtitle:
      "Operaly agenda, recuerda, busca correos, revisa documentos, organiza listas y le ayuda a cerrar pendientes con contexto real.",
    primary: "Probar 7 dias gratis",
    secondary: "Ver planes",
    dashboard: "Entrar al dashboard",
    proofTitle: "No es solo un chat bonito. Es un sistema operativo personal.",
    proofText:
      "WhatsApp resuelve y el dashboard da control. Asi Operaly le acompana sin hacerlo perderse entre modulos.",
  },
  en: {
    badge: "Operaly makes daily work lighter from WhatsApp",
    headlineA: "Less mental load.",
    headlineB: "More clear action in your day.",
    subtitle:
      "Operaly schedules, reminds, searches email, reviews files, organizes lists and helps you close loops with real context.",
    primary: "Start 7 days free",
    secondary: "See plans",
    dashboard: "Open dashboard",
    proofTitle: "It is not just a pretty chat. It is your personal operating system.",
    proofText:
      "WhatsApp gets things moving and the dashboard gives control. That is how Operaly helps without losing the thread.",
  },
  de: {
    badge: "Operaly entlastet Ihren Alltag direkt in WhatsApp",
    headlineA: "Weniger mentale Last.",
    headlineB: "Mehr klare Aktionen im Tag.",
    subtitle:
      "Operaly plant, erinnert, durchsucht E-Mails, prueft Dateien, organisiert Listen und hilft Ihnen mit echtem Kontext.",
    primary: "7 Tage kostenlos testen",
    secondary: "Preise ansehen",
    dashboard: "Dashboard oeffnen",
    proofTitle: "Nicht nur ein Chat. Ihr persoenliches Betriebssystem.",
    proofText:
      "WhatsApp bewegt Dinge, das Dashboard gibt Kontrolle. So begleitet Operaly ohne den Faden zu verlieren.",
  },
  pt: {
    badge: "Operaly facilita seu dia a dia pelo WhatsApp",
    headlineA: "Menos carga mental.",
    headlineB: "Mais acao clara no seu dia.",
    subtitle:
      "Operaly agenda, lembra, busca emails, revisa arquivos, organiza listas e ajuda voce a concluir pendencias com contexto real.",
    primary: "Testar 7 dias gratis",
    secondary: "Ver planos",
    dashboard: "Entrar no dashboard",
    proofTitle: "Nao e so um chat bonito. E seu sistema operacional pessoal.",
    proofText:
      "WhatsApp executa e o dashboard da controle. Assim Operaly acompanha voce sem perder o fio.",
  },
  fr: {
    badge: "Operaly vous simplifie la vie depuis WhatsApp",
    headlineA: "Moins de charge mentale.",
    headlineB: "Plus d'action claire dans la journee.",
    subtitle:
      "Operaly planifie, rappelle, cherche les emails, relit les fichiers, organise les listes et aide a conclure avec du contexte.",
    primary: "Essai gratuit 7 jours",
    secondary: "Voir les offres",
    dashboard: "Entrer dans le dashboard",
    proofTitle: "Ce n'est pas juste un joli chat. C'est votre systeme operatif personnel.",
    proofText:
      "WhatsApp execute et le dashboard donne du controle. Operaly accompagne sans vous faire perdre le fil.",
  },
}

export function CommercialLanding({ locale = "es" }: { locale?: string }) {
  const t = copy[(locale as LandingLocale) in copy ? (locale as LandingLocale) : "en"]

  return (
    <>
      <section className="relative overflow-hidden bg-[#F6F8FC] pt-28">
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#0F1F63_1px,transparent_1px),linear-gradient(90deg,#0F1F63_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute left-1/2 top-0 h-[640px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,211,102,0.18),rgba(59,130,246,0.16)_36%,rgba(124,58,237,0.10)_58%,transparent_72%)] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#25D366]/25 bg-white/80 px-4 py-2 text-sm font-semibold text-[#047857] shadow-sm">
              <Sparkles className="h-4 w-4" />
              {t.badge}
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[0.96] tracking-[-0.055em] text-[#0F1F63] sm:text-6xl lg:text-7xl">
              {t.headlineA}
              <span className="mt-3 block bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
                {t.headlineB}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
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
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#DCE7F5] bg-white px-8 text-base font-bold text-[#0F1F63] shadow-sm transition hover:border-[#3B82F6]/40"
              >
                {t.dashboard}
              </a>
              <a
                href="#precios"
                className="inline-flex h-14 items-center justify-center rounded-full border border-transparent bg-[#0F1F63] px-8 text-base font-bold text-white shadow-sm transition hover:bg-[#162875]"
              >
                {t.secondary}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {trust.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7F5] bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {fixtures.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[#DCE7F5] bg-white/90 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">{item.label}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#0F1F63]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[42px] bg-gradient-to-br from-[#25D366]/20 via-[#3B82F6]/18 to-[#7C3AED]/16 blur-3xl" />
            <div className="relative space-y-4 rounded-[34px] border border-white/80 bg-white/85 p-4 shadow-[0_34px_90px_-30px_rgba(15,31,99,0.35)] backdrop-blur">
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
                    activo
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="mr-10 rounded-3xl rounded-bl-md bg-white/10 p-4 text-sm leading-relaxed text-white/90">
                    Operaly, revisa mis correos de MAFRE, resume lo importante y luego recordame llamar manana.
                  </div>
                  <div className="ml-10 rounded-3xl rounded-br-md bg-[#25D366] p-4 text-sm font-medium text-white">
                    Ya entendI el audio. Le muestro primero los correos relevantes y luego le dejo listo el recordatorio.
                  </div>
                  <div className="mr-10 rounded-3xl rounded-bl-md bg-white/10 p-4 text-sm leading-relaxed text-white/90">
                    Y si encuentro el contrato, enviaselo a Carlos.
                  </div>
                  <div className="ml-10 rounded-3xl rounded-br-md bg-white p-4 text-sm font-semibold text-[#0F1F63]">
                    Perfecto. Si el contrato correcto es el de MAFRE, sigo con ese envio.
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { icon: Mic, label: "Audio" },
                    { icon: FileText, label: "Docs" },
                    { icon: Zap, label: "Flujos" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-center">
                      <item.icon className="mx-auto h-4 w-4 text-[#86EFAC]" />
                      <p className="mt-1 text-xs font-semibold text-white/80">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-[#DCE7F5] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">Dashboard Operaly</p>
                      <p className="mt-1 text-lg font-bold text-[#0F1F63]">Control sin perder el foco</p>
                    </div>
                    <div className="rounded-2xl bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
                      tiempo real
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#F8FBFF] p-4">
                      <div className="flex items-center gap-2 text-[#0F1F63]">
                        <CalendarDays className="h-4 w-4 text-[#3B82F6]" />
                        <p className="text-sm font-semibold">Agenda viva</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">Prioridades, pendientes y Google Calendar en una sola vista.</p>
                    </div>
                    <div className="rounded-2xl bg-[#F8FBFF] p-4">
                      <div className="flex items-center gap-2 text-[#0F1F63]">
                        <FolderKanban className="h-4 w-4 text-[#7C3AED]" />
                        <p className="text-sm font-semibold">Casos y documentos</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">Todo el hilo con contexto, contactos y acciones siguientes.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#DCE7F5] bg-[linear-gradient(180deg,#0F1F63_0%,#162875_100%)] p-4 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Use Operaly hoy</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">Delegue desde el primer mensaje.</p>
                  <div className="mt-4 space-y-3 text-sm text-white/80">
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 text-[#86EFAC]" />
                      Contactos, correos y nombres parciales
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 text-[#86EFAC]" />
                      Documentos, contratos, listas y casos
                    </div>
                    <div className="flex items-start gap-2">
                      <Mic className="mt-0.5 h-4 w-4 text-[#86EFAC]" />
                      Audio, follow-up y confirmacion guiada
                    </div>
                  </div>
                  <a
                    href="/register"
                    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#0F1F63]"
                  >
                    Empezar a usar Operaly
                  </a>
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

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
          <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-[0_24px_60px_-25px_rgba(15,31,99,0.45)] backdrop-blur">
            <a
              href="/register"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 text-sm font-bold text-white"
            >
              Probar Operaly
            </a>
            <a
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-[#0F1F63]"
            >
              Entrar
            </a>
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
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#3B82F6]">Lo primero que hace por usted</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.035em] text-[#0F1F63] sm:text-5xl">
                {t.proofTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">{t.proofText}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="group overflow-hidden rounded-[30px] border border-[#DCE7F5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
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
