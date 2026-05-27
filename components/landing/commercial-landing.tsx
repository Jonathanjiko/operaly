"use client"

import { useMemo } from "react"
import Image from "next/image"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  Mic,
  Search,
  ShieldCheck,
} from "lucide-react"

type LandingLocale = "es" | "en" | "de" | "pt" | "fr" | "it"

type HeroCopy = {
  overload: string
  overloadWords: string[]
  overloadTitle: string
  badge: string
  title: string
  titleAccent: string
  subtitle: string
  positioning: string
  primary: string
  secondary: string
  dashboard: string
  socialProof: string
  chatTitle: string
  online: string
  userLabel: string
  agentLabel: string
  panelLabel: string
  panelTitle: string
  panelBadge: string
  proofTitle: string
  proofItems: string[]
  integrationsTitle: string
  integrationsSubtitle: string
  modules: {
    title: string
    description: string
  }[]
}

const heroCopy: Record<LandingLocale, HeroCopy> = {
  es: {
    overload: "Eso es sobrecarga.",
    overloadWords: [
      "Llega tarde",
      "Le escriben de más",
      "Pierde el hilo",
      "Busca por todos lados",
      "Olvida cosas",
      "No sabe qué sigue",
      "Olvidó pagar al banco",
      "No pagó la luz",
      "Perdió un cliente",
      "Faltó a la cita médica",
      "No entró a clases",
      "Se olvidó de la lista de compras",
      "Demasiados pendientes de casa",
      "Perdió la reserva del hotel",
      "Perdió la reserva del restaurante",
      "Falló una presentación",
      "Se olvidó de comprar algo",
      "Perdió la cita con un cliente",
    ],
    overloadTitle: "DESORDEN",
    badge: "Operaly le facilita la vida desde WhatsApp",
    title: "El desorden, la presión y la carga mental",
    titleAccent: "sí tienen salida con Operaly.",
    subtitle:
      "Audios, agenda, correos, contactos, documentos, recordatorios y seguimiento en una sola experiencia clara, rápida y útil.",
    positioning:
      "Hecho para profesionales independientes, personas ocupadas y agendas donde un olvido cuesta tiempo, dinero o reputación.",
    primary: "Prueba gratis",
    secondary: "Ver planes",
    dashboard: "Entrar",
    socialProof: "Empiece a delegar desde el primer audio.",
    chatTitle: "Operaly en WhatsApp",
    online: "activo",
    userLabel: "Usted",
    agentLabel: "Operaly",
    panelLabel: "Panel Operaly",
    panelTitle: "Todo claro sin cambiar de ritmo.",
    panelBadge: "claro y rápido",
    proofTitle: "Lo mejor de Operaly",
    proofItems: [
      "Revisa correos, agenda y contactos desde un mismo hilo.",
      "Ordena tareas, listas, documentos y casos sin hacerlo saltar entre pantallas.",
      "Le confirma qué resolvió y qué conviene revisar después.",
    ],
    integrationsTitle: "Funciona con lo que usted ya usa",
    integrationsSubtitle: "WhatsApp, Gmail, Calendar y Drive en la misma conversación.",
    modules: [
      {
        title: "Agenda sin fricción",
        description: "Prioridades, salud, pendientes y próximos pasos en la misma vista.",
      },
      {
        title: "Correos que sí aterrizan",
        description: "Busca por tema, contacto o asunto y le deja claro qué importa.",
      },
      {
        title: "Contactos y contexto",
        description: "Retoma personas, historial y acciones sin perder el hilo.",
      },
      {
        title: "Documentos y seguimiento",
        description: "Archivos, contratos y casos conectados con la acción siguiente.",
      },
    ],
  },
  en: {
    overload: "That is overload.",
    overloadWords: [
      "Running late",
      "Too many messages",
      "Losing the thread",
      "Searching everywhere",
      "Forgetting things",
      "Not knowing what is next",
    ],
    overloadTitle: "OVERLOAD",
    badge: "Operaly makes daily work lighter from WhatsApp",
    title: "Disorder, pressure and mental load",
    titleAccent: "do have a way out with Operaly.",
    subtitle:
      "Audio, agenda, email, contacts, files, reminders and follow-up in one clear, fast and useful experience.",
    positioning:
      "Built for busy professionals, independent operators and people whose day loses money or momentum when something slips.",
    primary: "Start free trial",
    secondary: "See plans",
    dashboard: "Sign in",
    socialProof: "Start delegating from the very first voice note.",
    chatTitle: "Operaly on WhatsApp",
    online: "online",
    userLabel: "You",
    agentLabel: "Operaly",
    panelLabel: "Operaly panel",
    panelTitle: "Everything clear without changing your rhythm.",
    panelBadge: "clear and fast",
    proofTitle: "Why Operaly feels different",
    proofItems: [
      "Checks email, agenda and contacts from the same thread.",
      "Keeps tasks, lists, files and cases tidy without making you jump between tabs.",
      "Confirms what got done and what deserves attention next.",
    ],
    integrationsTitle: "Works with what you already use",
    integrationsSubtitle: "WhatsApp, Gmail, Calendar and Drive in the same conversation.",
    modules: [
      { title: "Agenda with order", description: "Health, priorities and next steps in the same place." },
      { title: "Email that lands", description: "Searches by topic, person or subject and shows what matters." },
      { title: "Contacts with memory", description: "Keeps people, context and actions connected." },
      { title: "Files with follow-up", description: "Contracts, documents and cases tied to the next move." },
    ],
  },
  de: {
    overload: "Das ist Überlastung.",
    overloadWords: ["Zu spät", "Zu viele Nachrichten", "Faden verloren", "Überall suchen", "Zu viel im Kopf", "Nächster Schritt unklar"],
    overloadTitle: "ÜBERLASTUNG",
    badge: "Operaly entlastet Ihren Alltag direkt aus WhatsApp",
    title: "Unordnung, Druck und mentale Last",
    titleAccent: "haben mit Operaly einen Ausweg.",
    subtitle:
      "Audio, Agenda, E-Mails, Kontakte, Dateien, Erinnerungen und Nachverfolgung in einer klaren und schnellen Erfahrung.",
    positioning:
      "Gebaut für stark beschäftigte Profis und unabhängige Betreiber, bei denen ein Versäumnis Zeit, Geld oder Vertrauen kostet.",
    primary: "Gratis testen",
    secondary: "Pläne ansehen",
    dashboard: "Anmelden",
    socialProof: "Delegieren Sie schon ab der ersten Sprachnachricht.",
    chatTitle: "Operaly in WhatsApp",
    online: "aktiv",
    userLabel: "Sie",
    agentLabel: "Operaly",
    panelLabel: "Operaly Panel",
    panelTitle: "Alles klar, ohne den Rhythmus zu verlieren.",
    panelBadge: "klar und schnell",
    proofTitle: "Warum Operaly hängen bleibt",
    proofItems: [
      "Prüft E-Mails, Agenda und Kontakte im selben Verlauf.",
      "Ordnet Aufgaben, Listen, Dateien und Fälle ohne unnötige Sprünge.",
      "Bestätigt, was erledigt ist und was als Nächstes wichtig ist.",
    ],
    integrationsTitle: "Arbeitet mit dem, was Sie schon nutzen",
    integrationsSubtitle: "WhatsApp, Gmail, Calendar und Drive in derselben Unterhaltung.",
    modules: [
      { title: "Agenda mit Ordnung", description: "Gesundheit, Prioritäten und Nächstes in derselben Ansicht." },
      { title: "E-Mails mit Klarheit", description: "Sucht nach Thema, Person oder Betreff und filtert das Wichtige." },
      { title: "Kontakte mit Kontext", description: "Verbindet Personen, Verlauf und nächste Schritte." },
      { title: "Dateien mit Folgeaktion", description: "Dokumente, Verträge und Fälle sauber verbunden." },
    ],
  },
  pt: {
    overload: "Isso é sobrecarga.",
    overloadWords: ["Chega atrasado", "Mensagens demais", "Perde o fio", "Procura em todo lugar", "Esquece tudo", "Não sabe o próximo passo"],
    overloadTitle: "SOBRECARGA",
    badge: "Operaly facilita seu dia a dia pelo WhatsApp",
    title: "Desordem, pressão e carga mental",
    titleAccent: "têm saída com Operaly.",
    subtitle:
      "Áudios, agenda, e-mails, contatos, arquivos, lembretes e acompanhamento numa experiência clara, rápida e útil.",
    positioning:
      "Feito para profissionais independentes e pessoas ocupadas, quando um esquecimento custa tempo, dinheiro ou reputação.",
    primary: "Teste grátis",
    secondary: "Ver planos",
    dashboard: "Entrar",
    socialProof: "Comece a delegar desde o primeiro áudio.",
    chatTitle: "Operaly no WhatsApp",
    online: "ativo",
    userLabel: "Você",
    agentLabel: "Operaly",
    panelLabel: "Painel Operaly",
    panelTitle: "Tudo claro sem mudar seu ritmo.",
    panelBadge: "claro e rápido",
    proofTitle: "Por que Operaly fica",
    proofItems: [
      "Revisa e-mails, agenda e contatos no mesmo fio.",
      "Organiza tarefas, listas, arquivos e casos sem espalhar sua atenção.",
      "Confirma o que foi resolvido e o que vale olhar depois.",
    ],
    integrationsTitle: "Funciona com o que você já usa",
    integrationsSubtitle: "WhatsApp, Gmail, Calendar e Drive na mesma conversa.",
    modules: [
      { title: "Agenda sem fricção", description: "Saúde, prioridades e próximos passos na mesma tela." },
      { title: "E-mails com foco", description: "Busca por tema, contato ou assunto e destaca o que importa." },
      { title: "Contatos com contexto", description: "Retoma pessoas, histórico e ações sem perder o fio." },
      { title: "Documentos com seguimento", description: "Arquivos, contratos e casos conectados." },
    ],
  },
  fr: {
    overload: "C'est de la surcharge.",
    overloadWords: ["Toujours en retard", "Trop de messages", "Le fil se perd", "Vous cherchez partout", "Vous oubliez", "La suite n'est pas claire"],
    overloadTitle: "SURCHARGE",
    badge: "Operaly vous simplifie la vie depuis WhatsApp",
    title: "Le désordre, la pression et la charge mentale",
    titleAccent: "ont une vraie sortie avec Operaly.",
    subtitle:
      "Audio, agenda, e-mails, contacts, fichiers, rappels et suivi dans une expérience claire, rapide et utile.",
    positioning:
      "Pensé pour les indépendants et les professionnels très occupés, quand un oubli coûte du temps, de l'argent ou de la crédibilité.",
    primary: "Essai gratuit",
    secondary: "Voir les offres",
    dashboard: "Se connecter",
    socialProof: "Commencez à déléguer dès le premier audio.",
    chatTitle: "Operaly sur WhatsApp",
    online: "actif",
    userLabel: "Vous",
    agentLabel: "Operaly",
    panelLabel: "Panneau Operaly",
    panelTitle: "Tout reste clair sans casser votre rythme.",
    panelBadge: "clair et rapide",
    proofTitle: "Pourquoi Operaly marque",
    proofItems: [
      "Lit vos e-mails, votre agenda et vos contacts depuis le même fil.",
      "Range tâches, listes, fichiers et dossiers sans vous disperser.",
      "Confirme ce qui a été fait et ce qu'il vaut mieux revoir ensuite.",
    ],
    integrationsTitle: "Fonctionne avec ce que vous utilisez déjà",
    integrationsSubtitle: "WhatsApp, Gmail, Calendar et Drive dans la même conversation.",
    modules: [
      { title: "Agenda sans friction", description: "Santé, priorités et suite du jour dans la même vue." },
      { title: "E-mails plus clairs", description: "Recherche par sujet, personne ou objet et sort l'essentiel." },
      { title: "Contacts avec contexte", description: "Retrouve personnes, historique et prochaines actions." },
      { title: "Documents reliés", description: "Fichiers, contrats et dossiers reliés à la prochaine étape." },
    ],
  },
  it: {
    overload: "Questa è sovraccarico.",
    overloadWords: ["Arriva tardi", "Troppi messaggi", "Perde il filo", "Cerca ovunque", "Si dimentica", "Non sa cosa viene dopo"],
    overloadTitle: "DISORDINE",
    badge: "Operaly le semplifica la vita da WhatsApp",
    title: "Disordine, pressione e carico mentale",
    titleAccent: "hanno una vera uscita con Operaly.",
    subtitle:
      "Audio, agenda, email, contatti, file, promemoria e follow-up in un'esperienza chiara, rapida e utile.",
    positioning:
      "Pensato per professionisti indipendenti e persone molto occupate, quando una dimenticanza costa tempo, denaro o fiducia.",
    primary: "Prova gratis",
    secondary: "Vedi piani",
    dashboard: "Accedi",
    socialProof: "Inizi a delegare già dal primo audio.",
    chatTitle: "Operaly su WhatsApp",
    online: "attivo",
    userLabel: "Lei",
    agentLabel: "Operaly",
    panelLabel: "Pannello Operaly",
    panelTitle: "Tutto chiaro senza cambiare ritmo.",
    panelBadge: "chiaro e rapido",
    proofTitle: "Perché Operaly resta",
    proofItems: [
      "Controlla email, agenda e contatti nello stesso filo.",
      "Ordina attività, liste, file e casi senza disperdere l'attenzione.",
      "Conferma cosa è pronto e cosa conviene rivedere dopo.",
    ],
    integrationsTitle: "Funziona con quello che usa già",
    integrationsSubtitle: "WhatsApp, Gmail, Calendar e Drive nella stessa conversazione.",
    modules: [
      { title: "Agenda senza attrito", description: "Salute, priorità e prossimi passi nella stessa vista." },
      { title: "Email più chiare", description: "Cerca per tema, contatto o oggetto e mette a fuoco l'essenziale." },
      { title: "Contatti con memoria", description: "Riprende persone, cronologia e azioni senza perdere il filo." },
      { title: "Documenti collegati", description: "File, contratti e casi collegati alla prossima azione." },
    ],
  },
}

const integrations = [
  { name: "WhatsApp", src: "/brands/whatsapp.svg" },
  { name: "Gmail", src: "/brands/gmail.svg" },
  { name: "Calendar", src: "/brands/google-calendar.svg" },
  { name: "Drive", src: "/brands/google-drive.svg" },
]

const dotSections = [
  { href: "#producto", label: "Inicio" },
  { href: "#planes", label: "Planes" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
]

function getCopy(locale?: string) {
  const normalized = (locale || "es") as LandingLocale
  return heroCopy[normalized] || heroCopy.es
}

export function CommercialLanding({ locale = "es" }: { locale?: string }) {
  const t = useMemo(() => getCopy(locale), [locale])

  const messages = useMemo(
    () => [
      {
        side: "left" as const,
        icon: Search,
        label: t.userLabel,
        text:
          locale === "es"
            ? "Operaly, revise mis correos de MAFRE, deje claro lo importante y luego recuérdeme llamar mañana."
            : "Operaly, review my MAFRE emails, make the important parts clear, and then remind me to call tomorrow.",
      },
      {
        side: "right" as const,
        icon: Mic,
        label: t.agentLabel,
        text:
          locale === "es"
            ? "Ya lo entendí. Primero le ordeno lo importante y luego le dejo listo el recordatorio."
            : "I got it. First I will sort what matters, then I will leave the reminder ready.",
      },
      {
        side: "left" as const,
        icon: FileText,
        label: t.userLabel,
        text:
          locale === "es"
            ? "Y si encuentra el contrato, envíeselo a Carlos."
            : "And if you find the contract, send it to Carlos.",
      },
      {
        side: "right" as const,
        icon: ShieldCheck,
        label: t.agentLabel,
        text:
          locale === "es"
            ? "Perfecto. Si es el correcto, sigo con el envío."
            : "Perfect. If that is the right one, I will continue with the send.",
      },
    ],
    [locale, t.agentLabel, t.userLabel]
  )

  return (
    <section
      id="producto"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#09112B_0%,#102A73_28%,#EDF5FF_76%,#FFFFFF_100%)] pt-24 sm:pt-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(37,211,102,0.18),transparent_26%)]" />
      <div className="absolute inset-x-0 top-0 h-[760px] opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 xl:flex">
        {dotSections.map((dot) => (
          <a
            key={dot.href}
            href={dot.href}
            className="pointer-events-auto group flex items-center gap-3"
            aria-label={dot.label}
          >
            <span className="h-4.5 w-4.5 rounded-full border-2 border-white/70 bg-white/40 shadow-[0_0_30px_rgba(255,255,255,0.32)] transition duration-300 group-hover:scale-125 group-hover:bg-white" />
            <span className="rounded-full bg-[#09112B]/78 px-3 py-1 text-xs font-semibold text-white/90 opacity-0 backdrop-blur transition group-hover:opacity-100">
              {dot.label}
            </span>
          </a>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12">
          <div className="pt-8 text-white">
            <div className="hidden mt-8 flex flex-wrap gap-2">
              {[
                locale === "es" ? "7 días gratis" : "7 days free",
                locale === "es" ? "Sin tarjeta para empezar" : "No card to begin",
                locale === "es" ? "WhatsApp + panel privado" : "WhatsApp + private panel",
                locale === "es" ? "Más claridad desde el primer audio" : "More clarity from the first voice note",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition duration-300 hover:border-white/40 hover:bg-white/14"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#86EFAC]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="hidden mt-8 grid max-w-[54rem] gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {t.modules.map((module, index) => (
                <div
                  key={module.title}
                  className="rounded-[28px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(232,240,255,0.95))] p-6 shadow-[0_24px_44px_-24px_rgba(15,31,99,0.7)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-white/32"
                  style={{ animation: `float-card 6.4s ease-in-out ${index * 0.18}s infinite` }}
                >
                  <p className="text-base font-bold leading-6 text-[#0F1F63]">{module.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{module.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="pt-4 text-white">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/12 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_48px_-26px_rgba(15,31,99,0.82)] backdrop-blur-xl">
                <Image src="/brands/whatsapp.svg" alt="WhatsApp" width={24} height={24} className="h-6 w-6" />
                {t.badge}
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl lg:text-[4.4rem]">
                {t.title}
                <span className="mt-3 block bg-gradient-to-r from-[#25D366] via-[#7DD3FC] to-[#F472B6] bg-clip-text text-transparent">
                  {t.titleAccent}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
                {t.subtitle}
              </p>
              <p className="mt-4 max-w-[40rem] text-sm leading-7 text-[#C9D7FF] sm:text-base">
                {t.positioning}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] px-8 text-base font-bold text-white shadow-[0_26px_60px_-24px_rgba(139,123,255,0.88)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-20px_rgba(139,123,255,0.95)]"
                >
                  {t.primary}
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#planes"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-white/28 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur transition duration-300 hover:border-white/50 hover:bg-white/14"
                >
                  {t.secondary}
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-white/18 bg-[#09112B]/62 px-8 text-base font-semibold text-white transition duration-300 hover:bg-[#09112B]/82"
                >
                  {t.dashboard}
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  locale === "es" ? "7 dÃ­as gratis" : "7 days free",
                  locale === "es" ? "Sin tarjeta para empezar" : "No card to begin",
                  locale === "es" ? "WhatsApp + panel privado" : "WhatsApp + private panel",
                  locale === "es" ? "MÃ¡s claridad desde el primer audio" : "More clarity from the first voice note",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition duration-300 hover:border-white/40 hover:bg-white/14"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#86EFAC]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-3xl pb-8">
            <div className="absolute inset-x-10 top-10 h-[560px] rounded-[44px] bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_62%)] blur-3xl" />
            <div
              className="relative overflow-hidden rounded-[42px] border border-white/18 bg-white/88 p-4 shadow-[0_44px_120px_-40px_rgba(9,17,43,0.65)] backdrop-blur-xl sm:p-5"
              style={{ animation: "breathe 7s ease-in-out infinite" }}
            >
              <div
                className="rounded-[32px] bg-[linear-gradient(180deg,#101B63_0%,#172873_100%)] p-6 text-white"
                style={{ animation: "float-soft 7.5s ease-in-out infinite" }}
              >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image src="/brands/whatsapp.svg" alt="WhatsApp" width={52} height={52} className="h-12 w-12" />
                      <div>
                        <p className="text-lg font-bold leading-tight">{t.chatTitle}</p>
                        <p className="mt-1 text-sm text-white/72">{t.socialProof}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#25D366]/18 px-3 py-1 text-xs font-bold text-[#BBF7D0]">
                      {t.online}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={`${message.label}-${index}`}
                        className={`rounded-[28px] p-4 shadow-sm ${
                          message.side === "left"
                            ? "mr-10 max-w-[82%] rounded-bl-lg bg-white/12 text-white/94"
                            : "ml-auto max-w-[82%] rounded-br-lg bg-[#25D366] text-white"
                        }`}
                        style={{ animation: `message-bob 5.2s ease-in-out ${index * 0.28}s infinite` }}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                          <message.icon className="h-3.5 w-3.5" />
                          {message.label}
                        </div>
                        <p className="text-[15px] leading-8">{message.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { icon: Mic, label: locale === "es" ? "Audio" : "Voice" },
                      { icon: Mail, label: locale === "es" ? "Correos" : "Email" },
                      { icon: CalendarClock, label: locale === "es" ? "Agenda" : "Agenda" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center transition duration-300 hover:border-white/24 hover:bg-white/12"
                      >
                        <item.icon className="mx-auto h-4 w-4 text-[#A7F3D0]" />
                        <p className="mt-1 text-xs font-semibold text-white/82">{item.label}</p>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>

          </div>

          <div className="pt-4 text-white">
            <div className="relative min-h-[640px] overflow-visible text-center">
              <p className="text-lg font-semibold uppercase tracking-[0.34em] text-white/88 sm:text-2xl">
                {t.overload}
              </p>
              <div className="relative mx-auto mt-12 flex max-w-[86rem] flex-wrap justify-center gap-x-2 gap-y-5 px-2">
                {t.overloadWords.map((pill, index) => (
                  <span
                    key={pill}
                    className="inline-flex rounded-full border border-white/16 bg-white/12 px-5 py-3 text-[15px] font-semibold text-white/92 shadow-[0_24px_54px_-28px_rgba(15,31,99,0.84)] backdrop-blur-xl"
                    style={{
                      transform: `translate(${[-64, 58, -92, 44, -36, 88, -76, 32, -48, 74, -20, 62, -82, 18, -54, 68, -26, 56][index % 18]}px, ${[28, -12, 30, -4, 24, -16, 18, 40, 6, 34, 10, 38, 16, 8, 26, -6, 14, 22][index % 18]}px) rotate(${[-24, 18, -20, 11, -15, 22, -19, 9, -17, 16, -11, 13, -21, 7, -14, 19, -8, 12][index % 18]}deg)`,
                      animation: `rain-pill 8.2s ease-in-out ${index * 0.18}s infinite`,
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <h2 className="mx-auto mt-20 w-full text-center text-[7.4rem] font-black leading-[0.74] tracking-[-0.12em] text-white/16 sm:text-[10rem] lg:text-[16rem]">
                {t.overloadTitle}
              </h2>
            </div>
          </div>

          <div className="grid gap-6">
            <div
              className="rounded-[30px] border border-[#D9E7FF] bg-white p-6 shadow-[0_24px_60px_-28px_rgba(9,17,43,0.38)]"
              style={{ animation: "float-soft 8s ease-in-out .2s infinite" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">
                    {t.panelLabel}
                  </p>
                  <p className="mt-2 max-w-[28rem] text-[2.35rem] font-black leading-[1.02] text-[#0F1F63]">
                    {t.panelTitle}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#ECF5FF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
                  {t.panelBadge}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {t.modules.map((module, index) => (
                  <div
                    key={module.title}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FF_100%)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-sm"
                    style={{ animation: `float-card 5.8s ease-in-out ${index * 0.2}s infinite` }}
                  >
                    <p className="text-xl font-bold leading-7 text-[#0F1F63]">{module.title}</p>
                    <p className="mt-3 max-w-[30rem] text-sm leading-7 text-slate-600">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[30px] border border-[#D9E7FF] bg-[linear-gradient(180deg,#0F1F63_0%,#18266B_100%)] p-6 text-white shadow-[0_24px_60px_-28px_rgba(9,17,43,0.42)]"
              style={{ animation: "float-soft 7.2s ease-in-out .4s infinite" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                {t.proofTitle}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {t.proofItems.map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/10 bg-white/6 p-4 text-sm leading-7 text-white/84">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#A7F3D0]" />
                      <span>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/register"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#0F1F63] transition duration-300 hover:scale-[1.02]"
              >
                {t.primary}
              </a>
            </div>
          </div>

        <div className="mt-12 rounded-[34px] border border-white/12 bg-white/88 p-5 shadow-[0_28px_70px_-40px_rgba(9,17,43,0.7)] backdrop-blur xl:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                {t.integrationsTitle}
              </p>
              <p className="mt-2 text-base text-slate-600">{t.integrationsSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 rounded-[22px] border border-[#D9E7FF] bg-white px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Image
                    src={integration.src}
                    alt={integration.name}
                    width={34}
                    height={34}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-sm font-semibold text-[#0F1F63]">{integration.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
          <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-full border border-white/20 bg-[#09112B]/88 p-2 shadow-[0_28px_70px_-28px_rgba(9,17,43,0.85)] backdrop-blur-xl">
            <a
              href="/register"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] px-4 text-sm font-bold text-white"
            >
              {t.primary}
            </a>
            <a
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/14 px-4 text-sm font-semibold text-white"
            >
              {t.dashboard}
            </a>
          </div>
        </div>
      </div>
      </div>

      <style jsx>{`
        @keyframes rain-pill {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(18px);
          }
        }

        @keyframes float-card {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes message-bob {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes breathe {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.01);
          }
        }

        @keyframes float-soft {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </section>
  )
}
