"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
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

type PublicPlan = {
  code: string
  price_pen?: number
  price_usd?: number
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
    eyebrow: "Tu liberaciÃ³n, tu plan",
    title: "Empiece gratis. Luego escale solo donde ya sienta valor real.",
    subtitle:
      "Trial entra fuerte. Pro resalta como el camino mÃ¡s completo. Y al pasar el cursor, abajo se activan los atributos que realmente se desbloquean.",
    monthly: "por mes",
    trialSpan: "7 dÃ­as para sentir el producto",
    mostChosen: "MÃ¡s elegido",
    startHere: "Empiece aquÃ­",
    selectedEyebrow: "Se activa con el plan elegido",
    selectedHint:
      "Pase el cursor por cada plan. Abajo se activan sus mejores atributos, con mÃ¡s seÃ±ales visuales, mÃ³dulos y profundidad para decidir mejor.",
    proLabel: "El mÃ¡s completo",
    trialLabel: "La entrada ideal",
    plusLabel: "MÃ¡s capacidad",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Todo lo importante, sin vueltas.",
    faqSubtitle:
      "Respondimos las dudas bÃ¡sicas y comerciales que mÃ¡s importan antes de registrarse o cambiar de plan.",
    modalEyebrow: "Operaly love mark",
    modalTitle: "MÃ¡s claridad, menos peso mental y una mejor sensaciÃ³n de control.",
    modalBodyOne:
      "Operaly estÃ¡ pensado para quitarle ruido al dÃ­a: ordena lo importante, ejecuta lo claro y deja visibles los siguientes pasos sin hacerlo perder tiempo.",
    modalBodyTwo:
      "Por eso cada plan no solo suma capacidad. TambiÃ©n cambia la forma en que usted vive agenda, correos, contactos, seguimiento y automatizaciÃ³n.",
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
      description: "Prueba gratis de 7 dÃ­as con Google incluido y todos los mÃ³dulos base listos para sentir el producto de verdad.",
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
      description: "La base estable para operar todos los dÃ­as con mÃ¡s capacidad, mÃ¡s orden y un uso ya serio.",
      cta: "Elegir Core",
      features: [
        "1200 mensajes IA",
        "10 min de voz y llamadas",
        "3 GB de almacenamiento",
        "500 contactos y 10 automatizaciones",
        "Google Suite incluido",
      ],
    },
    pro: {
      title: "Pro",
      description: "La ruta mÃ¡s fuerte para vivir agenda, correos, documentos y seguimiento con Google incluido y mejor margen.",
      cta: "Elegir Pro",
      features: [
        "3000 mensajes IA",
        "60 min de voz y llamadas",
        "5 GB de almacenamiento",
        "1000 contactos y 20 automatizaciones",
        "Google Suite incluido",
      ],
    },
    pro_plus: {
      title: "Pro Plus",
      description: "La capa mÃ¡s amplia para quien ya quiere usar Operaly con mÃ¡s volumen, mÃ¡s llamadas y mÃ¡s automatizaciones.",
      cta: "Elegir Pro Plus",
      features: [
        "8000 mensajes IA",
        "180 min de voz y llamadas",
        "20 GB de almacenamiento",
        "2000 contactos y 50 automatizaciones",
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
        "Google Suite included",
      ],
    },
    pro: {
      title: "Pro",
      description: "The strongest path to live inside agenda, email, files and follow-up with Google included and more room.",
      cta: "Choose Pro",
      features: [
        "3000 AI messages",
        "60 min of voice and calls",
        "5 GB of storage",
        "1000 contacts and 20 automations",
        "Google Suite included",
      ],
    },
    pro_plus: {
      title: "Pro Plus",
      description: "The widest layer for people who want more volume, more calls and more automation all day long.",
      cta: "Choose Pro Plus",
      features: [
        "8000 AI messages",
        "180 min of voice and calls",
        "20 GB of storage",
        "2000 contacts and 50 automations",
        "Google Suite included",
      ],
    },
  },
}

const detailSets: Record<"es" | "en", Record<string, FeatureCard[]>> = {
  es: {
    trial: [
      {
        title: "Empieza sin fricciÃ³n",
        short: "7 dÃ­as gratis, sin tarjeta para comenzar.",
        detail:
          "Trial deja ver el valor real de Operaly desde el primer audio. Puede usar mÃ³dulos base, probar Google y decidir con contexto si ya le ordena el dÃ­a.",
        icon: Sparkles,
      },
      {
        title: "Google incluido",
        short: "Gmail, Calendar y Drive listos desde el inicio.",
        detail:
          "La prueba ya incluye Google para que correos, agenda y documentos se conecten desde el principio sin bloquear la parte mÃ¡s atractiva del producto.",
        icon: Mail,
      },
      {
        title: "Agenda y recordatorios",
        short: "Salud, pendientes y seguimiento desde el primer uso.",
        detail:
          "Puede crear agenda, recordatorios, listas y seguimientos desde WhatsApp o desde el panel para sentir un uso real y no una demo vacÃ­a.",
        icon: CalendarClock,
      },
      {
        title: "Audios con acciÃ³n",
        short: "Prueba voz, llamadas y ejecuciÃ³n directa.",
        detail:
          "Trial tambiÃ©n sirve para validar audios, llamadas y acciones simples sin perder tiempo. La idea es que la primera impresiÃ³n ya se sienta Ãºtil.",
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
        short: "MÃ¡s capacidad para vivir el dÃ­a con orden.",
        detail:
          "Core ya sirve para operar cada dÃ­a con agenda, tareas, listas, documentos, contactos y recordatorios sin dar todavÃ­a el salto grande.",
        icon: Sparkles,
      },
      {
        title: "MÃ¡s voz y mensajes",
        short: "MÃ¡s espacio para delegar mÃ¡s seguido.",
        detail:
          "Sube la capacidad de uso diario y deja un margen mÃ¡s cÃ³modo para trabajar con audio, seguimiento y automatizaciones mÃ¡s frecuentes.",
        icon: Mic,
      },
      {
        title: "Listas y agenda",
        short: "Todo mÃ¡s claro desde el panel y WhatsApp.",
        detail:
          "Core ayuda a ordenar lo pendiente y a reducir el caos diario, incluso sin Google incluido todavÃ­a, porque el flujo base ya se siente sÃ³lido.",
        icon: CalendarClock,
      },
      {
        title: "Documentos y seguimiento",
        short: "MÃ¡s estructura sin mÃ¡s ruido.",
        detail:
          "Documentos, casos y contexto siguen conectados para que usted retome asuntos sin perder tiempo navegando entre demasiadas pantallas.",
        icon: FileText,
      },
      {
        title: "Camino a Pro",
        short: "Google se desbloquea al subir.",
        detail:
          "Si ya siente que Core le quedÃ³ corto y necesita Gmail, Calendar y Drive dentro del mismo flujo, el salto correcto es Pro.",
        icon: Search,
      },
    ],
    pro: [
      {
        title: "El punto mÃ¡s atractivo",
        short: "Google incluido y mÃ¡s espacio para operar de verdad.",
        detail:
          "Pro es donde Operaly se siente mÃ¡s completo para la mayorÃ­a: correos, agenda, documentos, contactos, llamadas y seguimiento en la misma lÃ­nea.",
        icon: Sparkles,
      },
      {
        title: "Correos con acciÃ³n",
        short: "Busca, resume y ejecuta desde el mismo hilo.",
        detail:
          "Con Google incluido, Pro permite usar Gmail, Calendar y Drive como parte viva del flujo, no como una promesa futura ni una funciÃ³n aparte.",
        icon: Mail,
      },
      {
        title: "MÃ¡s automatizaciÃ³n",
        short: "MÃ¡s minutos, mÃ¡s mensajes y mÃ¡s movimiento diario.",
        detail:
          "Si ya usa bastante audio, seguimiento operativo y agenda viva, Pro da margen suficiente para no sentirse frenado a mitad de semana.",
        icon: Zap,
      },
      {
        title: "Agenda clara",
        short: "Prioridades, salud y prÃ³ximos pasos conectados.",
        detail:
          "El salto a Pro tambiÃ©n se siente en agenda y recordatorios porque el flujo completo con Google le da mÃ¡s contexto y mÃ¡s continuidad.",
        icon: CalendarClock,
      },
      {
        title: "Documentos y casos",
        short: "MÃ¡s continuidad entre archivos, contactos y envÃ­os.",
        detail:
          "Archivos, contratos, contactos y acciones sensibles quedan mÃ¡s amarrados para que la experiencia se vea mÃ¡s premium y mÃ¡s Ãºtil.",
        icon: FileText,
      },
    ],
    pro_plus: [
      {
        title: "Operaly a mÃ¡xima capacidad",
        short: "Para vivir dentro del producto todo el dÃ­a.",
        detail:
          "Pro Plus abre el techo para agendas mÃ¡s intensas y operaciones donde agenda, correos, documentos, llamadas y seguimiento se mueven de forma continua.",
        icon: Sparkles,
      },
      {
        title: "MÃ¡s volumen sin romper ritmo",
        short: "MÃ¡s voz, mÃ¡s mensajes y mÃ¡s automatizaciones activas.",
        detail:
          "Cuando el flujo no para, Pro Plus da mÃ¡s margen para mantener velocidad, seguimiento y contexto sin revisar lÃ­mites tan seguido.",
        icon: Mic,
      },
      {
        title: "Google incluido y mÃ¡s margen",
        short: "Todo listo para equipos o agendas mÃ¡s pesadas.",
        detail:
          "Combina la integraciÃ³n de Google con un techo mucho mÃ¡s amplio para contactos, archivos y acciones recurrentes en el tiempo.",
        icon: Mail,
      },
      {
        title: "Seguimiento mÃ¡s fuerte",
        short: "MÃ¡s espacio para casos, tareas y continuidad real.",
        detail:
          "Sirve mejor cuando ya hay mÃ¡s volumen de contactos, documentos y seguimientos simultÃ¡neos en el dÃ­a a dÃ­a.",
        icon: Users,
      },
      {
        title: "MÃ¡s aire para crecer",
        short: "La capa mÃ¡s holgada para crecer sin fricciÃ³n.",
        detail:
          "Pro Plus no solo suma nÃºmeros. TambiÃ©n deja respirar una operaciÃ³n mÃ¡s intensa sin que todo se sienta apretado.",
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
      question: "¿Necesito aprender otra aplicación para usar Operaly?",
      answer:
        "No. Operaly funciona directamente desde WhatsApp. Solo necesitas enviar un mensaje de texto o audio, como lo harías con cualquier persona. El dashboard web es opcional y complementa la experiencia.",
    },
    {
      question: "¿Qué pasa cuando termina el trial?",
      answer:
        "Cuando terminan los 7 días de prueba, tu cuenta queda en pausa. Tus datos se conservan. Puedes elegir un plan y continuar en cualquier momento desde tu dashboard en operaly.app/dashboard.",
    },
    {
      question: "¿Google está incluido en todos los planes?",
      answer:
        "Google Suite (Gmail, Calendar, Drive, Contacts) está incluido durante el trial y desde el plan Core en adelante. No requiere configuración adicional — solo conecta tu cuenta en el dashboard.",
    },
    {
      question: "¿Cómo me registro?",
      answer:
        "Ve a operaly.app/register, ingresa tu nombre, email y número de WhatsApp. En menos de 2 minutos Operaly te envía un mensaje de bienvenida y tu trial de 7 días comienza automáticamente.",
    },
    {
      question: "¿Necesito tarjeta para empezar?",
      answer:
        "No. El trial de 7 días es completamente gratis y no requiere tarjeta de crédito. Solo necesitas un número de WhatsApp activo.",
    },
    {
      question: "¿Los extras de voz y mensajes se renuevan automáticamente?",
      answer:
        "No. Los paquetes adicionales de voz y mensajes son compras puntuales por el mes en curso. No se renuevan automáticamente — tú decides cuándo agregarlos.",
    },
    {
      question: "¿Puedo usar Operaly solo desde WhatsApp?",
      answer:
        "Sí. WhatsApp es el canal principal de Operaly. El dashboard web complementa la experiencia con vistas visuales de tu agenda, contactos, documentos y automatizaciones, pero no es obligatorio.",
    },
    {
      question: "¿Cuál es el plan más inteligente?",
      answer:
        "Depende de tu uso. Para empezar, el Trial te da 7 días completos. Si ya sabes que Operaly es para ti, Pro es el punto donde el producto se siente más completo: Google incluido, 60 minutos de voz, 3000 mensajes y todas las funciones activas.",
    },
  ],
  en: [
    {
      question: "Do I need to learn another app to use Operaly?",
      answer:
        "No. Operaly works directly from WhatsApp. You only need to send a text or audio message as if you were talking to any person. The web dashboard is optional and complements the experience.",
    },
    {
      question: "What happens when the trial ends?",
      answer:
        "When the 7-day trial ends, your account is paused. Your data is preserved. You can choose a plan and continue anytime from operaly.app/dashboard.",
    },
    {
      question: "Is Google included in every plan?",
      answer:
        "Google Suite (Gmail, Calendar, Drive, Contacts) is included during the trial and from the Core plan onward. It does not require extra setup — just connect your account in the dashboard.",
    },
    {
      question: "How do I sign up?",
      answer:
        "Go to operaly.app/register, enter your name, email and WhatsApp number. In under 2 minutes Operaly sends your welcome message and your 7-day trial starts automatically.",
    },
    {
      question: "Do I need a card to begin?",
      answer:
        "No. The 7-day trial is completely free and does not require a credit card. You only need an active WhatsApp number.",
    },
    {
      question: "Do voice and message extras renew automatically?",
      answer:
        "No. Additional voice and message packages are one-time purchases for the current month. They do not renew automatically — you decide when to add them.",
    },
    {
      question: "Can I use Operaly only from WhatsApp?",
      answer:
        "Yes. WhatsApp is the main Operaly channel. The web dashboard complements the experience with visual views of your agenda, contacts, documents and automations, but it is not required.",
    },
    {
      question: "Which plan is the smartest choice?",
      answer:
        "It depends on your usage. To start, Trial gives you 7 full days. If you already know Operaly is for you, Pro is the point where the product feels most complete: Google included, 60 voice minutes, 3000 messages and every key function active.",
    },
  ],
}
export function Pricing({ locale = "es" }: { locale?: string }) {
  const { pricing, isPeru } = usePricingCurrency()
  const [publicPlans, setPublicPlans] = useState<Record<string, PublicPlan>>({})
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const isSpanish = locale === "es"
  const t = isSpanish ? pricingCopy.es : pricingCopy.en
  const localizedPlans = isSpanish ? localizedPlanCards.es : localizedPlanCards.en
  const detailGroups = isSpanish ? detailSets.es : detailSets.en
  const faqItems = isSpanish ? faqByLocale.es : faqByLocale.en

  useEffect(() => {
    const loadPublicPlans = async () => {
      try {
        const response = await fetch("/api/plans", {
          method: "GET",
          cache: "no-store",
        })
        const payload = (await response.json().catch(() => ({}))) as { plans?: PublicPlan[] }
        if (!response.ok || !payload.plans) return
        setPublicPlans(
          payload.plans.reduce<Record<string, PublicPlan>>((accumulator, plan) => {
            accumulator[plan.code] = plan
            return accumulator
          }, {})
        )
      } catch {
        setPublicPlans({})
      }
    }

    void loadPublicPlans()
  }, [])

  const displayPlans = useMemo(
    () =>
      OPERLAY_PLANS.map((plan) => {
        const publicPlan = publicPlans[plan.code]
        if (!publicPlan) return plan
        if (plan.code === "trial") {
          return {
            ...plan,
            price: 0,
            currency: isPeru ? "PEN" : "USD",
          }
        }

        return {
          ...plan,
          price: Number(isPeru ? publicPlan.price_pen ?? plan.price : publicPlan.price_usd ?? plan.price),
          currency: isPeru ? "PEN" : "USD",
        }
      }),
    [isPeru, publicPlans]
  )

  const activePlan = useMemo(
    () => displayPlans.find((plan) => plan.code === selectedPlan) ?? displayPlans[0],
    [displayPlans, selectedPlan]
  )

  const activeDetails = detailGroups[activePlan.code] ?? []
  const activeFeature = activeDetails[activeFeatureIndex] ?? activeDetails[0]

  const cycleFeature = (direction: "prev" | "next") => {
    if (!activeDetails.length) return
    setActiveFeatureIndex((current) => {
      if (direction === "prev") {
        return current === 0 ? activeDetails.length - 1 : current - 1
      }
      return current === activeDetails.length - 1 ? 0 : current + 1
    })
  }

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
          {displayPlans.map((plan) => {
            const isActive = activePlan.code === plan.code
            const isPopular = plan.code === "pro"
            const isTrial = plan.code === "trial"
            const localized = localizedPlans[plan.code]
            const formattedPrice =
              plan.price === 0
                ? pricing.formatCatalogMoney(plan.price, plan.currency)
                : pricing.formatCatalogMoney(plan.price, plan.currency)

            return (
              <div
                key={plan.code}
                onMouseEnter={() => setSelectedPlan(plan.code)}
                onFocus={() => setSelectedPlan(plan.code)}
                onClick={() => {
                  setSelectedPlan(plan.code)
                  setActiveFeatureIndex(0)
                }}
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
                    ? isPopular
                      ? "scale-[1.03] border-transparent bg-[linear-gradient(180deg,#0C153A_0%,#101C5F_35%,#301A66_100%)] text-white shadow-[0_34px_90px_-32px_rgba(81,63,175,0.95)]"
                      : isTrial
                        ? "scale-[1.02] border-transparent bg-[linear-gradient(180deg,#083227_0%,#11604B_45%,#167E7F_100%)] text-white shadow-[0_34px_90px_-32px_rgba(22,126,127,0.82)]"
                        : "scale-[1.02] border-transparent bg-[linear-gradient(180deg,#0C153A_0%,#101C5F_40%,#1A2570_100%)] text-white shadow-[0_34px_90px_-38px_rgba(15,31,99,0.9)]"
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
                    {!isPeru && plan.price > 0 ? (
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

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => cycleFeature("prev")}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white transition hover:scale-105 hover:bg-white/16"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => activeFeature && setSelectedFeature(activeFeature)}
              className="group flex flex-1 items-center gap-5 rounded-[30px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(103,80,255,0.12),rgba(243,93,180,0.10))] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/26"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/12">
                {activeFeature ? <activeFeature.icon className="h-8 w-8 text-[#A7F3D0]" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-black text-white">{activeFeature?.title}</p>
                <p className="mt-2 text-base font-semibold text-[#D8E4FF]">{activeFeature?.short}</p>
                <p className="mt-2 text-sm leading-7 text-white/72 line-clamp-2">{activeFeature?.detail}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => cycleFeature("next")}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white transition hover:scale-105 hover:bg-white/16"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {activeDetails.map((detail, index) => (
              <button
                key={detail.title}
                type="button"
                onClick={() => setActiveFeatureIndex(index)}
                className={`h-3.5 w-3.5 rounded-full transition ${
                  index === activeFeatureIndex ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.5)]" : "bg-white/28 hover:bg-white/45"
                }`}
                aria-label={detail.title}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {activeDetails.map((detail, index) => (
              <button
                key={detail.title}
                type="button"
                onClick={() => {
                  setActiveFeatureIndex(index)
                  setSelectedFeature(detail)
                }}
                className={`rounded-[22px] border p-4 text-left transition duration-300 ${
                  index === activeFeatureIndex
                    ? "border-white/24 bg-white/16"
                    : "border-white/10 bg-white/6 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <detail.icon className="h-4 w-4 text-[#A7F3D0]" />
                  <span className="text-sm font-bold text-white">{detail.title}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] border border-white/10 bg-white/6 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              {(activeDetails.slice(0, 3)).map((detail) => (
                <div key={detail.title} className="rounded-[20px] bg-white/8 p-4">
                  <div className="flex items-center gap-2">
                    <detail.icon className="h-4 w-4 text-[#A7F3D0]" />
                    <p className="text-sm font-bold text-white">{detail.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/72">{detail.short}</p>
                </div>
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
                    ? "Cada plan empuja un uso distinto: entrada mÃ¡s amable, base estable o una experiencia mÃ¡s completa con Google y mejor margen."
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

