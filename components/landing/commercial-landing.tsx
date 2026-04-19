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
  pills: string[]
  badge: string
  title: string
  titleAccent: string
  subtitle: string
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
  modulesTitle: string
  modulesSubtitle: string
  modules: {
    title: string
    description: string
  }[]
}

const heroCopy: Record<LandingLocale, HeroCopy> = {
  es: {
    overload: "Eso es sobrecarga.",
    pills: ["Llega tarde", "Olvida cosas", "Pierde el hilo", "Busca por todos lados", "Le escriben de más", "No sabe qué sigue"],
    badge: "Operaly le facilita la vida desde WhatsApp",
    title: "No nació para cargarlo todo.",
    titleAccent: "Operaly sí.",
    subtitle:
      "Audios, agenda, correos, contactos, documentos, recordatorios y seguimiento en una sola experiencia clara, rápida y útil.",
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
    modulesTitle: "Lo mejor del uso diario",
    modulesSubtitle: "Tarjetas vivas para mostrar lo que Operaly sí resuelve de verdad.",
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
    pills: ["Running late", "Forgetting things", "Losing the thread", "Searching everywhere", "Too many messages", "Not knowing what is next"],
    badge: "Operaly makes daily work lighter from WhatsApp",
    title: "You were not made to carry everything.",
    titleAccent: "Operaly was.",
    subtitle:
      "Audio, agenda, email, contacts, files, reminders and follow-up in one clear, fast and useful experience.",
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
    proofTitle: "Why it sticks",
    proofItems: [
      "Checks email, agenda and contacts from the same thread.",
      "Keeps tasks, lists, files and cases tidy without making you jump between tabs.",
      "Confirms what got done and what deserves attention next.",
    ],
    modulesTitle: "Daily use that feels real",
    modulesSubtitle: "Living cards that show what Operaly actually solves.",
    modules: [
      { title: "Agenda with order", description: "Health, priorities and next steps in the same place." },
      { title: "Email that lands", description: "Searches by topic, person or subject and shows what matters." },
      { title: "Contacts with memory", description: "Keeps people, context and actions connected." },
      { title: "Files with follow-up", description: "Contracts, documents and cases tied to the next move." },
    ],
  },
  de: {
    overload: "Das ist Überlastung.",
    pills: ["Zu spät", "Zu viel im Kopf", "Faden verloren", "Überall suchen", "Zu viele Nachrichten", "Nächster Schritt unklar"],
    badge: "Operaly entlastet Ihren Alltag direkt aus WhatsApp",
    title: "Sie sind nicht dafür gemacht, alles zu tragen.",
    titleAccent: "Operaly schon.",
    subtitle:
      "Audio, Agenda, E-Mails, Kontakte, Dateien, Erinnerungen und Nachverfolgung in einer klaren und schnellen Erfahrung.",
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
    proofTitle: "Warum es überzeugt",
    proofItems: [
      "Prüft E-Mails, Agenda und Kontakte im selben Verlauf.",
      "Ordnet Aufgaben, Listen, Dateien und Fälle ohne unnötige Sprünge.",
      "Bestätigt, was erledigt ist und was als Nächstes wichtig ist.",
    ],
    modulesTitle: "Für den echten Alltag",
    modulesSubtitle: "Lebendige Karten, die zeigen, was Operaly wirklich löst.",
    modules: [
      { title: "Agenda mit Ordnung", description: "Gesundheit, Prioritäten und Nächstes in derselben Ansicht." },
      { title: "E-Mails mit Klarheit", description: "Sucht nach Thema, Person oder Betreff und filtert das Wichtige." },
      { title: "Kontakte mit Kontext", description: "Verbindet Personen, Verlauf und nächste Schritte." },
      { title: "Dateien mit Folgeaktion", description: "Dokumente, Verträge und Fälle sauber verbunden." },
    ],
  },
  pt: {
    overload: "Isso é sobrecarga.",
    pills: ["Chega atrasado", "Esquece tudo", "Perde o fio", "Procura em todo lugar", "Mensagens demais", "Não sabe o próximo passo"],
    badge: "Operaly facilita seu dia a dia pelo WhatsApp",
    title: "Você não nasceu para carregar tudo.",
    titleAccent: "Operaly nasceu.",
    subtitle:
      "Áudios, agenda, e-mails, contatos, arquivos, lembretes e acompanhamento numa experiência clara, rápida e útil.",
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
    proofTitle: "Por que funciona",
    proofItems: [
      "Revisa e-mails, agenda e contatos no mesmo fio.",
      "Organiza tarefas, listas, arquivos e casos sem espalhar sua atenção.",
      "Confirma o que foi resolvido e o que vale olhar depois.",
    ],
    modulesTitle: "O melhor do uso diário",
    modulesSubtitle: "Cartões vivos para mostrar o que Operaly realmente resolve.",
    modules: [
      { title: "Agenda sem fricção", description: "Saúde, prioridades e próximos passos na mesma tela." },
      { title: "E-mails com foco", description: "Busca por tema, contato ou assunto e destaca o que importa." },
      { title: "Contatos com contexto", description: "Retoma pessoas, histórico e ações sem perder o fio." },
      { title: "Documentos com seguimento", description: "Arquivos, contratos e casos conectados." },
    ],
  },
  fr: {
    overload: "C'est de la surcharge.",
    pills: ["Toujours en retard", "Vous oubliez", "Le fil se perd", "Vous cherchez partout", "Trop de messages", "La suite n'est pas claire"],
    badge: "Operaly vous simplifie la vie depuis WhatsApp",
    title: "Vous n'êtes pas fait pour tout porter.",
    titleAccent: "Operaly si.",
    subtitle:
      "Audio, agenda, e-mails, contacts, fichiers, rappels et suivi dans une expérience claire, rapide et utile.",
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
    proofTitle: "Ce qui fait la différence",
    proofItems: [
      "Lit vos e-mails, votre agenda et vos contacts depuis le même fil.",
      "Range tâches, listes, fichiers et dossiers sans vous disperser.",
      "Confirme ce qui a été fait et ce qu'il vaut mieux revoir ensuite.",
    ],
    modulesTitle: "Le meilleur du quotidien",
    modulesSubtitle: "Des cartes vivantes pour montrer ce qu'Operaly règle vraiment.",
    modules: [
      { title: "Agenda sans friction", description: "Santé, priorités et suite du jour dans la même vue." },
      { title: "E-mails plus clairs", description: "Recherche par sujet, personne ou objet et sort l'essentiel." },
      { title: "Contacts avec contexte", description: "Retrouve personnes, historique et prochaines actions." },
      { title: "Documents reliés", description: "Fichiers, contrats et dossiers reliés à la prochaine étape." },
    ],
  },
  it: {
    overload: "Questa è sovraccarico.",
    pills: ["Arriva tardi", "Si dimentica", "Perde il filo", "Cerca ovunque", "Troppi messaggi", "Non sa cosa viene dopo"],
    badge: "Operaly le semplifica la vita da WhatsApp",
    title: "Non è fatto per portare tutto.",
    titleAccent: "Operaly sì.",
    subtitle:
      "Audio, agenda, email, contatti, file, promemoria e follow-up in un'esperienza chiara, rapida e utile.",
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
    proofTitle: "Perché funziona",
    proofItems: [
      "Controlla email, agenda e contatti nello stesso filo.",
      "Ordina attività, liste, file e casi senza disperdere l'attenzione.",
      "Conferma cosa è pronto e cosa conviene rivedere dopo.",
    ],
    modulesTitle: "Il meglio dell'uso quotidiano",
    modulesSubtitle: "Schede vive per mostrare ciò che Operaly risolve davvero.",
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
  { name: "Contacts", src: "/brands/google-contacts.svg" },
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

  const floatingCards = useMemo(
    () => [
      {
        title: locale === "es" ? "Agenda clara" : "Clear agenda",
        description: locale === "es" ? "Salud, pendientes y próximos pasos en orden." : "Health, pending items and next steps in order.",
      },
      {
        title: locale === "es" ? "Correos útiles" : "Useful email",
        description: locale === "es" ? "Busca por contacto, asunto o tema." : "Search by contact, subject or topic.",
      },
      {
        title: locale === "es" ? "Documentos conectados" : "Connected files",
        description: locale === "es" ? "Contratos, casos y envíos sin perder contexto." : "Contracts, cases and sends without losing context.",
      },
      {
        title: locale === "es" ? "Seguimiento real" : "Real follow-up",
        description: locale === "es" ? "Confirma lo hecho y deja visible lo siguiente." : "Confirms what was done and what comes next.",
      },
    ],
    [locale]
  )

  return (
    <section
      id="producto"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#09112B_0%,#102A73_26%,#EAF3FF_72%,#FFFFFF_100%)] pt-24 sm:pt-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.26),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(37,211,102,0.18),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_52%)]" />
      <div className="absolute inset-x-0 top-0 h-[620px] opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
        {dotSections.map((dot) => (
          <a
            key={dot.href}
            href={dot.href}
            className="pointer-events-auto group flex items-center gap-3"
            aria-label={dot.label}
          >
            <span className="h-3.5 w-3.5 rounded-full border border-white/45 bg-white/18 shadow-[0_0_24px_rgba(255,255,255,0.18)] transition group-hover:scale-110 group-hover:bg-white" />
            <span className="rounded-full bg-[#09112B]/68 px-3 py-1 text-xs font-semibold text-white/85 opacity-0 backdrop-blur transition group-hover:opacity-100">
              {dot.label}
            </span>
          </a>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="pt-8 text-white">
            <div className="relative mb-10 min-h-[108px]">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">
                {t.overload}
              </p>
              <div className="relative mt-5 h-20">
                {t.pills.map((pill, index) => (
                  <span
                    key={pill}
                    className="absolute inline-flex rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-medium text-white/88 shadow-[0_18px_44px_-26px_rgba(15,31,99,0.75)] backdrop-blur"
                    style={{
                      left: `${(index % 3) * 26}%`,
                      top: `${(index % 2) * 34}px`,
                      animation: `float-pill 5.8s ease-in-out ${index * 0.22}s infinite`,
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_-26px_rgba(15,31,99,0.75)] backdrop-blur">
              <Image src="/brands/whatsapp.svg" alt="WhatsApp" width={24} height={24} className="h-6 w-6" />
              {t.badge}
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              {t.title}
              <span className="mt-3 block bg-gradient-to-r from-[#25D366] via-[#7DD3FC] to-[#F472B6] bg-clip-text text-transparent">
                {t.titleAccent}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
              {t.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] px-8 text-base font-bold text-white shadow-[0_24px_60px_-25px_rgba(139,123,255,0.8)] transition hover:scale-[1.02]"
              >
                {t.primary}
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#planes"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/26 bg-white/8 px-8 text-base font-semibold text-white backdrop-blur"
              >
                {t.secondary}
              </a>
              <a
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/16 bg-[#09112B]/58 px-8 text-base font-semibold text-white"
              >
                {t.dashboard}
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {[
                locale === "es" ? "7 días gratis" : "7 days free",
                locale === "es" ? "Sin tarjeta para empezar" : "No card to begin",
                locale === "es" ? "WhatsApp + panel privado" : "WhatsApp + private panel",
                locale === "es" ? "Más claridad desde el primer audio" : "More clarity from the first voice note",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-sm font-medium text-white/86 backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#86EFAC]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {t.modules.map((module, index) => (
                <div
                  key={module.title}
                  className="rounded-[24px] border border-white/12 bg-white/10 p-4 shadow-[0_18px_44px_-28px_rgba(15,31,99,0.75)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/14"
                  style={{ animation: `float-card 6s ease-in-out ${index * 0.18}s infinite` }}
                >
                  <p className="text-sm font-bold text-white">{module.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{module.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative pb-8 lg:pb-0">
            <div className="absolute inset-x-10 top-10 h-[520px] rounded-[44px] bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_62%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[42px] border border-white/18 bg-white/86 p-4 shadow-[0_44px_120px_-40px_rgba(9,17,43,0.65)] backdrop-blur-xl sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
                <div className="rounded-[30px] bg-[linear-gradient(180deg,#101B63_0%,#172873_100%)] p-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image src="/brands/whatsapp.svg" alt="WhatsApp" width={48} height={48} className="h-12 w-12" />
                      <div>
                        <p className="text-base font-bold">{t.chatTitle}</p>
                        <p className="text-xs text-white/65">{t.socialProof}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#25D366]/18 px-3 py-1 text-xs font-bold text-[#BBF7D0]">
                      {t.online}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={`${message.label}-${index}`}
                        className={`rounded-3xl p-4 shadow-sm ${
                          message.side === "left"
                            ? "mr-10 rounded-bl-md bg-white/12 text-white/92"
                            : "ml-10 rounded-br-md bg-[#25D366] text-white"
                        }`}
                        style={{ animation: `message-bob 4.8s ease-in-out ${index * 0.28}s infinite` }}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
                          <message.icon className="h-3.5 w-3.5" />
                          {message.label}
                        </div>
                        <p className="text-sm leading-7">{message.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { icon: Mic, label: locale === "es" ? "Audio" : "Voice" },
                      { icon: Mail, label: locale === "es" ? "Correos" : "Email" },
                      { icon: CalendarClock, label: locale === "es" ? "Agenda" : "Agenda" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
                        <item.icon className="mx-auto h-4 w-4 text-[#A7F3D0]" />
                        <p className="mt-1 text-xs font-semibold text-white/78">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-[#D9E7FF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">
                          {t.panelLabel}
                        </p>
                        <p className="mt-2 text-2xl font-black leading-tight text-[#0F1F63]">
                          {t.panelTitle}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#ECF5FF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
                        {t.panelBadge}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {floatingCards.map((card, index) => (
                        <div
                          key={card.title}
                          className="rounded-[24px] border border-slate-200 bg-[#F8FBFF] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-sm"
                          style={{ animation: `float-card 5.8s ease-in-out ${index * 0.26}s infinite` }}
                        >
                          <p className="text-sm font-bold text-[#0F1F63]">{card.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#D9E7FF] bg-[linear-gradient(180deg,#0F1F63_0%,#18266B_100%)] p-5 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                      {t.proofTitle}
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-white/82">
                      {t.proofItems.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#A7F3D0]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href="/register"
                      className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#0F1F63]"
                    >
                      {t.primary}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[34px] border border-white/12 bg-white/86 p-5 shadow-[0_28px_70px_-40px_rgba(9,17,43,0.7)] backdrop-blur xl:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                {t.modulesTitle}
              </p>
              <p className="mt-2 text-base text-slate-600">{t.modulesSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 rounded-[22px] border border-[#D9E7FF] bg-white px-4 py-3 shadow-sm"
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

      <style jsx>{`
        @keyframes float-pill {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(10px);
          }
        }

        @keyframes float-card {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes message-bob {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </section>
  )
}
