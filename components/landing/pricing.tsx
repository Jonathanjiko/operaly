"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  Check,
  FileText,
  Mail,
  Mic,
  Search,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OPERLAY_PLANS } from "@/lib/plans"
import { usePricingCurrency } from "@/hooks/usePricingCurrency"

type FeatureCard = {
  title: string
  short: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
}

type PricingTexts = {
  eyebrow: string
  title: string
  subtitle: string
  monthly: string
  trialSpan: string
  mostChosen: string
  startHere: string
  selectedEyebrow: string
  selectedHint: string
  detailBadge: string
  proLabel: string
  trialLabel: string
  plusLabel: string
  faqEyebrow: string
  faqTitle: string
  faqSubtitle: string
  modalEyebrow: string
  modalTitle: string
  modalBodyOne: string
  modalBodyTwo: string
  modalCta: string
}

const pricingCopy: Record<"es" | "en", PricingTexts> = {
  es: {
    eyebrow: "Tu liberación, tu plan",
    title: "Empiece gratis. Luego escale solo donde ya sienta valor real.",
    subtitle:
      "Trial entra fuerte. Pro resalta como el camino más completo. Y al pasar el cursor, abajo se activan los atributos que realmente se desbloquean.",
    monthly: "por mes",
    trialSpan: "7 días para sentir el producto",
    mostChosen: "Más elegido",
    startHere: "Empiece aquí",
    selectedEyebrow: "Se activa con el plan elegido",
    selectedHint:
      "Pase el cursor por cada plan. Abajo se activan sus mejores atributos, con más señales visuales, módulos y profundidad para decidir mejor.",
    detailBadge: "Lo mejor aquí",
    proLabel: "El más completo",
    trialLabel: "La entrada ideal",
    plusLabel: "Más capacidad",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Todo lo importante, sin vueltas.",
    faqSubtitle:
      "Respondimos las dudas básicas y comerciales que más importan antes de registrarse o cambiar de plan.",
    modalEyebrow: "Operaly love mark",
    modalTitle: "Más claridad, menos peso mental y una mejor sensación de control.",
    modalBodyOne:
      "Operaly está pensado para quitarle ruido al día: ordena lo importante, ejecuta lo claro y deja visibles los siguientes pasos sin hacerlo perder tiempo.",
    modalBodyTwo:
      "Por eso cada plan no solo suma capacidad. También cambia la forma en que usted vive agenda, correos, contactos, seguimiento y automatización.",
    modalCta: "Probar Operaly",
  },
  en: {
    eyebrow: "Your relief, your plan",
    title: "Start free. Upgrade only when you already feel real value.",
    subtitle:
      "Trial hooks hard. Pro stands out as the fullest path. And as you hover, the strongest attributes below switch into focus.",
    monthly: "per month",
    trialSpan: "7 days to feel the product",
    mostChosen: "Most chosen",
    startHere: "Start here",
    selectedEyebrow: "What unlocks with this plan",
    selectedHint:
      "Hover each plan. The strongest benefits below shift with more visual signals, modules and depth to help the decision feel easier.",
    detailBadge: "Best here",
    proLabel: "Most complete",
    trialLabel: "Best entry point",
    plusLabel: "More capacity",
    faqEyebrow: "Frequently asked questions",
    faqTitle: "The important answers, without the fluff.",
    faqSubtitle:
      "We answered the most basic and commercial questions that matter before someone signs up or upgrades.",
    modalEyebrow: "Operaly love mark",
    modalTitle: "More clarity, less mental weight and a stronger sense of control.",
    modalBodyOne:
      "Operaly is built to remove noise from the day: it sorts what matters, executes what is clear and keeps the next steps visible without wasting your time.",
    modalBodyTwo:
      "That is why each plan does more than add capacity. It changes how agenda, email, contacts, follow-up and automation feel in real life.",
    modalCta: "Try Operaly",
  },
}

const localizedPlanCards: Record<"es" | "en", Record<string, { title: string; description: string; cta: string; features: string[] }>> = {
  es: {
    trial: {
      title: "Trial",
      description: "Prueba gratis de 7 días con Google incluido y todos los módulos base listos para sentir el producto de verdad.",
      cta: "Prueba gratis",
      features: [
        "250 mensajes IA",
        "5 min de voz y llamadas",
        "0.5 GB de almacenamiento",
        "100 contactos y 2 automatizaciones",
        "Google Suite incluido durante trial",
      ],
    },
    core: {
      title: "Core",
      description: "La base estable para operar todos los días con más capacidad, más orden y un uso ya serio.",
      cta: "Elegir Core",
      features: [
        "1200 mensajes IA",
        "10 min de voz y llamadas",
        "3 GB de almacenamiento",
        "500 contactos y 10 automatizaciones",
        "Google incluido desde Pro",
      ],
    },
    pro: {
      title: "Pro",
      description: "La ruta más fuerte para vivir agenda, correos, documentos y seguimiento con Google incluido y mejor margen.",
      cta: "Elegir Pro",
      features: [
        "3000 mensajes IA",
        "30 min de voz y llamadas",
        "5 GB de almacenamiento",
        "1000 contactos y 15 automatizaciones",
        "Google Suite incluido",
      ],
    },
    pro_plus: {
      title: "Pro Plus",
      description: "La capa más amplia para quien ya quiere usar Operaly con más volumen, más llamadas y más automatizaciones.",
      cta: "Elegir Pro Plus",
      features: [
        "5000 mensajes IA",
        "60 min de voz y llamadas",
        "10 GB de almacenamiento",
        "2000 contactos y 30 automatizaciones",
        "Google Suite incluido",
      ],
    },
  },
  en: {
    trial: {
      title: "Trial",
      description: "A 7-day free start with Google included and the core modules ready so users can feel the product for real.",
      cta: "Start free trial",
      features: [
        "250 AI messages",
        "5 min of voice and calls",
        "0.5 GB of storage",
        "100 contacts and 2 automations",
        "Google Suite included during trial",
      ],
    },
    core: {
      title: "Core",
      description: "The stable base to run every day with more capacity, more order and a more serious daily flow.",
      cta: "Choose Core",
      features: [
        "1200 AI messages",
        "10 min of voice and calls",
        "3 GB of storage",
        "500 contacts and 10 automations",
        "Google included from Pro",
      ],
    },
    pro: {
      title: "Pro",
      description: "The strongest path to live inside agenda, email, files and follow-up with Google included and more room.",
      cta: "Choose Pro",
      features: [
        "3000 AI messages",
        "30 min of voice and calls",
        "5 GB of storage",
        "1000 contacts and 15 automations",
        "Google Suite included",
      ],
    },
    pro_plus: {
      title: "Pro Plus",
      description: "The widest layer for people who want more volume, more calls and more automation all day long.",
      cta: "Choose Pro Plus",
      features: [
        "5000 AI messages",
        "60 min of voice and calls",
        "10 GB of storage",
        "2000 contacts and 30 automations",
        "Google Suite included",
      ],
    },
  },
}

const detailSets: Record<"es" | "en", Record<string, FeatureCard[]>> = {
  es: {
    trial: [
      {
        title: "Empieza sin fricción",
        short: "7 días gratis, sin tarjeta para comenzar.",
        detail:
          "Trial deja ver el valor real de Operaly desde el primer audio. Puede usar módulos base, probar Google y decidir con contexto si ya le ordena el día.",
        icon: Sparkles,
      },
      {
        title: "Google incluido",
        short: "Gmail, Calendar y Drive listos desde el inicio.",
        detail:
          "La prueba ya incluye Google para que correos, agenda y documentos se conecten desde el principio sin bloquear la parte más atractiva del producto.",
        icon: Mail,
      },
      {
        title: "Agenda y recordatorios",
        short: "Salud, pendientes y seguimiento desde el primer uso.",
        detail:
          "Puede crear agenda, recordatorios, listas y seguimientos desde WhatsApp o desde el panel para sentir un uso real y no una demo vacía.",
        icon: CalendarClock,
      },
      {
        title: "Audios con acción",
        short: "Prueba voz, llamadas y ejecución directa.",
        detail:
          "Trial también sirve para validar audios, llamadas y acciones simples sin perder tiempo. La idea es que la primera impresión ya se sienta útil.",
        icon: Mic,
      },
      {
        title: "Contactos y contexto",
        short: "Retoma personas, datos y siguientes pasos.",
        detail:
          "Desde la prueba ya puede buscar personas, revisar contexto y moverse entre contactos, agenda y documentos sin romper el hilo.",
        icon: Users,
      },
    ],
    core: [
      {
        title: "Base estable",
        short: "Más capacidad para vivir el día con orden.",
        detail:
          "Core ya sirve para operar cada día con agenda, tareas, listas, documentos, contactos y recordatorios sin dar todavía el salto grande.",
        icon: Sparkles,
      },
      {
        title: "Más voz y mensajes",
        short: "Más espacio para delegar más seguido.",
        detail:
          "Sube la capacidad de uso diario y deja un margen más cómodo para trabajar con audio, seguimiento y automatizaciones más frecuentes.",
        icon: Mic,
      },
      {
        title: "Listas y agenda",
        short: "Todo más claro desde el panel y WhatsApp.",
        detail:
          "Core ayuda a ordenar lo pendiente y a reducir el caos diario, incluso sin Google incluido todavía, porque el flujo base ya se siente sólido.",
        icon: CalendarClock,
      },
      {
        title: "Documentos y seguimiento",
        short: "Más estructura sin más ruido.",
        detail:
          "Documentos, casos y contexto siguen conectados para que usted retome asuntos sin perder tiempo navegando entre demasiadas pantallas.",
        icon: FileText,
      },
      {
        title: "Camino a Pro",
        short: "Google se desbloquea al subir.",
        detail:
          "Si ya siente que Core le quedó corto y necesita Gmail, Calendar y Drive dentro del mismo flujo, el salto correcto es Pro.",
        icon: Search,
      },
    ],
    pro: [
      {
        title: "El punto más atractivo",
        short: "Google incluido y más espacio para operar de verdad.",
        detail:
          "Pro es donde Operaly se siente más completo para la mayoría: correos, agenda, documentos, contactos, llamadas y seguimiento en la misma línea.",
        icon: Sparkles,
      },
      {
        title: "Correos con acción",
        short: "Busca, resume y ejecuta desde el mismo hilo.",
        detail:
          "Con Google incluido, Pro permite usar Gmail, Calendar y Drive como parte viva del flujo, no como una promesa futura ni una función aparte.",
        icon: Mail,
      },
      {
        title: "Más automatización",
        short: "Más minutos, más mensajes y más movimiento diario.",
        detail:
          "Si ya usa bastante audio, seguimiento operativo y agenda viva, Pro da margen suficiente para no sentirse frenado a mitad de semana.",
        icon: Zap,
      },
      {
        title: "Agenda clara",
        short: "Prioridades, salud y próximos pasos conectados.",
        detail:
          "El salto a Pro también se siente en agenda y recordatorios porque el flujo completo con Google le da más contexto y más continuidad.",
        icon: CalendarClock,
      },
      {
        title: "Documentos y casos",
        short: "Más continuidad entre archivos, contactos y envíos.",
        detail:
          "Archivos, contratos, contactos y acciones sensibles quedan más amarrados para que la experiencia se vea más premium y más útil.",
        icon: FileText,
      },
    ],
    pro_plus: [
      {
        title: "Operaly a máxima capacidad",
        short: "Para vivir dentro del producto todo el día.",
        detail:
          "Pro Plus abre el techo para agendas más intensas y operaciones donde agenda, correos, documentos, llamadas y seguimiento se mueven de forma continua.",
        icon: Sparkles,
      },
      {
        title: "Más volumen sin romper ritmo",
        short: "Más voz, más mensajes y más automatizaciones activas.",
        detail:
          "Cuando el flujo no para, Pro Plus da más margen para mantener velocidad, seguimiento y contexto sin revisar límites tan seguido.",
        icon: Mic,
      },
      {
        title: "Google incluido y más margen",
        short: "Todo listo para equipos o agendas más pesadas.",
        detail:
          "Combina la integración de Google con un techo mucho más amplio para contactos, archivos y acciones recurrentes en el tiempo.",
        icon: Mail,
      },
      {
        title: "Seguimiento más fuerte",
        short: "Más espacio para casos, tareas y continuidad real.",
        detail:
          "Sirve mejor cuando ya hay más volumen de contactos, documentos y seguimientos simultáneos en el día a día.",
        icon: Users,
      },
      {
        title: "Más aire para crecer",
        short: "La capa más holgada para crecer sin fricción.",
        detail:
          "Pro Plus no solo suma números. También deja respirar una operación más intensa sin que todo se sienta apretado.",
        icon: Search,
      },
    ],
  },
  en: {
    trial: [
      {
        title: "A smooth start",
        short: "7 free days and no card needed to begin.",
        detail:
          "Trial exposes real Operaly value from the first voice note. You can use the core modules, try Google and decide with context if it already improves your day.",
        icon: Sparkles,
      },
      {
        title: "Google included",
        short: "Gmail, Calendar and Drive ready from the start.",
        detail:
          "The trial already includes Google so email, agenda and files connect from the beginning without blocking the most attractive part of the experience.",
        icon: Mail,
      },
      {
        title: "Agenda and reminders",
        short: "Health, pending items and follow-up from day one.",
        detail:
          "You can create agenda items, reminders, lists and follow-up from WhatsApp or from the panel to feel real usage, not an empty teaser.",
        icon: CalendarClock,
      },
      {
        title: "Voice with action",
        short: "Try voice, calls and direct execution.",
        detail:
          "Trial also works to validate voice notes, calls and simple actions without wasting time. The point is for the first impression to already feel useful.",
        icon: Mic,
      },
      {
        title: "Contacts and context",
        short: "Bring back people, data and next steps.",
        detail:
          "From the trial you can already search people, review context and move between contacts, agenda and files without breaking the thread.",
        icon: Users,
      },
    ],
    core: [
      {
        title: "Stable base",
        short: "More room to run the day with order.",
        detail:
          "Core is already enough to operate every day with agenda, tasks, lists, files, contacts and reminders without making the bigger jump yet.",
        icon: Sparkles,
      },
      {
        title: "More voice and messages",
        short: "More room to delegate more often.",
        detail:
          "It expands daily capacity and gives a more comfortable buffer for voice, follow-up and more frequent automation.",
        icon: Mic,
      },
      {
        title: "Lists and agenda",
        short: "Everything clearer from the panel and WhatsApp.",
        detail:
          "Core helps organize pending work and reduce daily chaos even without Google yet, because the base flow is already solid.",
        icon: CalendarClock,
      },
      {
        title: "Files and follow-up",
        short: "More structure without more noise.",
        detail:
          "Files, cases and context stay connected so people can resume matters without wasting time across too many screens.",
        icon: FileText,
      },
      {
        title: "Path to Pro",
        short: "Google unlocks when you upgrade.",
        detail:
          "If Core already feels short and you need Gmail, Calendar and Drive in the same flow, Pro is the right next move.",
        icon: Search,
      },
    ],
    pro: [
      {
        title: "The strongest sweet spot",
        short: "Google included and more room to really operate.",
        detail:
          "Pro is where Operaly feels most complete for most users: email, agenda, files, contacts, calls and follow-up in one line.",
        icon: Sparkles,
      },
      {
        title: "Email with action",
        short: "Search, summarize and execute from the same thread.",
        detail:
          "With Google included, Pro lets Gmail, Calendar and Drive work as a living part of the flow, not as a future promise or a separate extra.",
        icon: Mail,
      },
      {
        title: "More automation",
        short: "More minutes, more messages and more daily movement.",
        detail:
          "If you already use a lot of voice, operational follow-up and a living agenda, Pro gives enough room to avoid feeling constrained midweek.",
        icon: Zap,
      },
      {
        title: "Clear agenda",
        short: "Priorities, health and next steps connected.",
        detail:
          "The jump to Pro also feels stronger in agenda and reminders because the complete flow with Google adds continuity and context.",
        icon: CalendarClock,
      },
      {
        title: "Files and cases",
        short: "More continuity between files, contacts and sends.",
        detail:
          "Files, contracts, contacts and sensitive actions stay more connected so the experience feels more premium and more useful.",
        icon: FileText,
      },
    ],
    pro_plus: [
      {
        title: "Operaly at full capacity",
        short: "For people who want to live inside the product all day.",
        detail:
          "Pro Plus raises the ceiling for heavier agendas and operations where agenda, email, files, calls and follow-up move all the time.",
        icon: Sparkles,
      },
      {
        title: "More volume without breaking rhythm",
        short: "More voice, more messages and more active automation.",
        detail:
          "When the flow never slows down, Pro Plus gives more room to keep speed, follow-up and context without checking limits so often.",
        icon: Mic,
      },
      {
        title: "Google included and wider room",
        short: "Ready for bigger agendas or heavier usage.",
        detail:
          "It combines Google integration with a wider ceiling for contacts, files and recurring actions over time.",
        icon: Mail,
      },
      {
        title: "Stronger follow-up",
        short: "More space for cases, tasks and real continuity.",
        detail:
          "It works best when there is already more volume in contacts, files and simultaneous follow-up through the day.",
        icon: Users,
      },
      {
        title: "More air to grow",
        short: "The widest layer to grow without friction.",
        detail:
          "Pro Plus does more than add numbers. It lets a heavier operation breathe without feeling tight.",
        icon: Search,
      },
    ],
  },
}

const faqByLocale: Record<"es" | "en", { question: string; answer: string }[]> = {
  es: [
    {
      question: "¿Necesito aprender otra app para usar Operaly?",
      answer:
        "No. Operaly vive primero en WhatsApp y se apoya en el panel solo cuando conviene ver más claro, revisar el uso, cambiar de plan o mover configuraciones importantes.",
    },
    {
      question: "¿Qué pasa cuando el trial termina?",
      answer:
        "Puede pasar a un plan superior si ya sintió el valor real. El trial está pensado para que use Operaly de verdad y tome la decisión con contexto, no a ciegas.",
    },
    {
      question: "¿Google viene incluido en todos los planes?",
      answer:
        "Google viene incluido durante el trial y desde Pro en adelante. En Core, la forma correcta de activarlo es subir a Pro.",
    },
    {
      question: "¿Cómo me registro?",
      answer:
        "Puede entrar por el botón de prueba gratis, crear su cuenta en minutos y empezar a usar Operaly sin tarjeta durante el trial.",
    },
    {
      question: "¿Necesito tarjeta para empezar?",
      answer:
        "No para iniciar el trial. La idea es que primero use Operaly y sienta el valor real antes de tomar una decisión de pago.",
    },
    {
      question: "¿Los extras de voz y mensajes se renuevan solos?",
      answer:
        "No. Los extras de voz y mensajes son pagos únicos con vigencia de 30 días. El almacenamiento adicional sí se suma como cargo mensual aparte del plan.",
    },
    {
      question: "¿Puedo usar Operaly solo desde WhatsApp?",
      answer:
        "Sí, y esa es una de sus fortalezas. El panel está para darle más claridad y control cuando haga falta, pero el uso puede empezar perfectamente desde WhatsApp.",
    },
    {
      question: "¿Cuál es el plan más recomendable?",
      answer:
        "Para la mayoría, Trial es la mejor entrada y Pro es la ruta más potente cuando ya quieren vivir el producto con Google incluido y más capacidad.",
    },
  ],
  en: [
    {
      question: "Do I need to learn another app to use Operaly?",
      answer:
        "No. Operaly lives first in WhatsApp and only leans on the panel when it helps to see things more clearly, review usage, change plan or adjust important settings.",
    },
    {
      question: "What happens when the trial ends?",
      answer:
        "You can move to a higher plan if you already felt real value. The trial is built so you use Operaly for real and decide with context, not blindly.",
    },
    {
      question: "Is Google included in every plan?",
      answer:
        "Google is included during the trial and from Pro onward. In Core, the right way to unlock it is by upgrading to Pro.",
    },
    {
      question: "How do I sign up?",
      answer:
        "You can tap the free trial button, create your account in minutes and begin using Operaly without a card during the trial period.",
    },
    {
      question: "Do I need a card to begin?",
      answer:
        "Not to start the trial. The point is to let people feel real value first before making a payment decision.",
    },
    {
      question: "Do voice and message extras renew automatically?",
      answer:
        "No. Voice and message extras are one-time purchases with a 30-day validity. Additional storage is the part that is added as a monthly charge on top of the plan.",
    },
    {
      question: "Can I use Operaly only from WhatsApp?",
      answer:
        "Yes, and that is one of its strengths. The panel is there to add clarity and control when needed, but the experience can begin perfectly from WhatsApp.",
    },
    {
      question: "Which plan is the smartest choice?",
      answer:
        "For most people, Trial is the best entry and Pro is the strongest path once they want to live inside the product with Google included and more room.",
    },
  ],
}

export function Pricing({ locale = "es" }: { locale?: string }) {
  const { pricing, loading, isPeru } = usePricingCurrency()
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null)
  const isSpanish = locale === "es"
  const t = isSpanish ? pricingCopy.es : pricingCopy.en
  const localizedPlans = isSpanish ? localizedPlanCards.es : localizedPlanCards.en
  const detailGroups = isSpanish ? detailSets.es : detailSets.en
  const faqItems = isSpanish ? faqByLocale.es : faqByLocale.en

  const activePlan = useMemo(
    () => OPERLAY_PLANS.find((plan) => plan.code === selectedPlan) ?? OPERLAY_PLANS[0],
    [selectedPlan]
  )

  const activeDetails = detailGroups[activePlan.code] ?? []

  return (
    <section id="planes" className="relative bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F9FF_100%)] py-24 md:py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#3B82F6]">
            {t.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0F1F63] sm:text-5xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {OPERLAY_PLANS.map((plan) => {
            const isActive = activePlan.code === plan.code
            const isPopular = plan.code === "pro"
            const isTrial = plan.code === "trial"
            const localized = localizedPlans[plan.code]
            const formattedPrice =
              plan.price === 0
                ? "Gratis"
                : loading
                  ? "..."
                  : pricing.formatCatalogMoney(plan.price, plan.currency)

            return (
              <div
                key={plan.code}
                onMouseEnter={() => setSelectedPlan(plan.code)}
                onFocus={() => setSelectedPlan(plan.code)}
                onClick={() => setSelectedPlan(plan.code)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelectedPlan(plan.code)
                  }
                }}
                className={`group relative flex min-h-[450px] flex-col overflow-hidden rounded-[34px] border p-6 text-left transition-all duration-300 ${
                  isActive
                    ? "scale-[1.02] border-transparent bg-[linear-gradient(180deg,#0C153A_0%,#101C5F_40%,#1A2570_100%)] text-white shadow-[0_34px_90px_-38px_rgba(15,31,99,0.9)]"
                    : "border-[#DCE7F5] bg-white text-[#0F1F63] shadow-sm hover:-translate-y-1.5 hover:border-[#3B82F6]/30 hover:shadow-[0_24px_70px_-40px_rgba(15,31,99,0.45)]"
                }`}
              >
                <div
                  className={`absolute inset-0 opacity-80 ${
                    isActive
                      ? isTrial
                        ? "bg-[radial-gradient(circle_at_top_right,rgba(37,211,102,0.38),transparent_35%)]"
                        : isPopular
                          ? "bg-[radial-gradient(circle_at_top_right,rgba(243,93,180,0.42),transparent_35%),radial-gradient(circle_at_left,rgba(110,167,255,0.30),transparent_40%)]"
                          : "bg-[radial-gradient(circle_at_top_right,rgba(255,195,0,0.32),transparent_32%)]"
                      : "hidden"
                  }`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${
                        isActive ? "bg-white/12 text-white/84" : "bg-[#EEF6FF] text-[#2563EB]"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {localized.title}
                    </span>
                    {isPopular ? (
                      <span className="rounded-full bg-gradient-to-r from-[#8B7BFF] to-[#F35DB4] px-3 py-1 text-xs font-bold text-white">
                        {t.mostChosen}
                      </span>
                    ) : isTrial ? (
                      <span className="rounded-full bg-gradient-to-r from-[#25D366] to-[#06B6D4] px-3 py-1 text-xs font-bold text-white">
                        {t.startHere}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-8">
                    <p className={`text-5xl font-black tracking-[-0.05em] ${isActive ? "text-white" : "text-[#0F1F63]"}`}>
                      {formattedPrice}
                    </p>
                    <p className={`mt-2 text-sm ${isActive ? "text-white/70" : "text-slate-500"}`}>
                      {plan.price === 0 ? t.trialSpan : t.monthly}
                    </p>
                    {!loading && !isPeru && plan.price > 0 ? (
                      <p className={`mt-2 text-xs ${isActive ? "text-white/60" : "text-[#0369A1]"}`}>
                        Cobro real en soles: {pricing.formatPen(pricing.toPenAmount(plan.price, plan.currency))}
                      </p>
                    ) : null}
                  </div>

                  <p className={`mt-5 text-sm leading-7 ${isActive ? "text-white/78" : "text-slate-600"}`}>
                    {localized.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {localized.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-[#A7F3D0]" : "text-[#10B981]"}`} />
                        <span className={`text-sm leading-6 ${isActive ? "text-white/82" : "text-slate-600"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mt-auto pt-8">
                  <Link
                    href={`/register?plan=${plan.code}`}
                    className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition duration-300 ${
                      isActive
                        ? "bg-white text-[#0F1F63] shadow-[0_16px_40px_-18px_rgba(255,255,255,0.6)]"
                        : isTrial
                          ? "bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] text-white hover:shadow-[0_20px_40px_-20px_rgba(37,211,102,0.6)]"
                          : isPopular
                            ? "bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] text-white hover:shadow-[0_20px_40px_-20px_rgba(139,123,255,0.7)]"
                            : "bg-[#0F1F63] text-white hover:bg-[#13256F]"
                    }`}
                  >
                    {localized.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 overflow-hidden rounded-[34px] border border-[#DCE7F5] bg-[linear-gradient(180deg,#0A1232_0%,#111C55_100%)] p-6 text-white shadow-[0_34px_100px_-46px_rgba(15,31,99,0.85)] md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                {t.selectedEyebrow}
              </p>
              <h3 className="mt-3 text-4xl font-black tracking-[-0.04em]">
                {localizedPlans[activePlan.code].title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                {t.selectedHint}
              </p>
            </div>
            <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/82">
              {activePlan.code === "trial"
                ? t.trialLabel
                : activePlan.code === "pro"
                  ? t.proLabel
                  : t.plusLabel}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-max gap-4 pb-2">
              {activeDetails.map((detail) => (
                <button
                  key={detail.title}
                  type="button"
                  onClick={() => setSelectedFeature(detail)}
                  className="group w-[270px] shrink-0 rounded-[28px] border border-white/12 bg-white/8 p-5 text-left transition duration-300 hover:-translate-y-1 hover:bg-white/12"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A7F3D0]">
                    <detail.icon className="h-4 w-4" />
                    {t.detailBadge}
                  </div>
                  <p className="mt-4 text-lg font-bold text-white">{detail.title}</p>
                  <p className="mt-3 text-sm leading-6 text-white/72">{detail.short}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="preguntas" className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#3B82F6]">{t.faqEyebrow}</p>
            <h3 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0F1F63]">
              {t.faqTitle}
            </h3>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="rounded-[32px] border border-[#DCE7F5] bg-white p-6 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`} className="border-[#E2E8F0]">
                  <AccordionTrigger className="py-5 text-base font-semibold text-[#0F1F63] transition hover:text-[#3B82F6] hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-slate-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedFeature)} onOpenChange={(open) => !open && setSelectedFeature(null)}>
        <DialogContent className="max-w-4xl overflow-hidden rounded-[36px] border-none bg-[linear-gradient(135deg,#E9F1FF_0%,#F8FBFF_52%,#FFF2FA_100%)] p-0 shadow-[0_34px_90px_-30px_rgba(15,31,99,0.5)]">
          <div className="grid gap-6 p-8 md:grid-cols-[0.92fr_1.08fr] md:p-10">
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6] shadow-sm">
                  <Image src="/images/operaly-logo.png" alt="Operaly" width={80} height={80} className="h-7 w-auto" />
                  Operaly
                </div>
                <DialogHeader className="mt-6 space-y-4 text-left">
                  <DialogTitle className="text-4xl font-black tracking-[-0.04em] text-[#0F1F63]">
                    {selectedFeature?.title}
                  </DialogTitle>
                  <DialogDescription className="text-base leading-8 text-slate-600">
                    {selectedFeature?.detail}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/70 bg-white/76 p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#0F1F63]">
                  {t.modalBodyOne}
                </p>
              </div>
            </div>

            <div className="rounded-[32px] bg-[linear-gradient(180deg,#0F1F63_0%,#1B2B79_100%)] p-6 text-white shadow-[0_24px_70px_-30px_rgba(15,31,99,0.8)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                {t.modalEyebrow}
              </p>
              <h4 className="mt-4 text-3xl font-black leading-tight">
                {t.modalTitle}
              </h4>
              <div className="mt-6 space-y-4 text-sm leading-7 text-white/78">
                <p>{t.modalBodyTwo}</p>
                <p>
                  {isSpanish
                    ? "Cada plan empuja un uso distinto: entrada más amable, base estable o una experiencia más completa con Google y mejor margen."
                    : "Each plan pushes a different feeling: gentler entry, more stable base or a fuller experience with Google and more room."}
                </p>
              </div>
              <Link
                href="/register"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#0F1F63]"
              >
                {t.modalCta}
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
