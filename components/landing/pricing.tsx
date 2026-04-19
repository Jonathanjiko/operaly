"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Sparkles, Star } from "lucide-react"
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

type PlanFeatureDetail = {
  title: string
  short: string
  detail: string
}

const PLAN_DETAILS: Record<string, PlanFeatureDetail[]> = {
  trial: [
    {
      title: "Empieza sin fricción",
      short: "7 días gratis, sin tarjeta para comenzar.",
      detail:
        "Trial deja ver el valor real de Operaly desde el primer audio. Puede usar los módulos base, probar Google y sentir si de verdad le ordena el día antes de pagar.",
    },
    {
      title: "Google incluido",
      short: "Gmail, Calendar y Drive listos desde el inicio.",
      detail:
        "El trial viene con la integración de Google activada para que vea el flujo completo de correos, agenda y documentos sin bloquear lo importante al principio.",
    },
    {
      title: "Uso real, no demo",
      short: "Mensajes, voz, llamadas y automatizaciones incluidas.",
      detail:
        "No es una prueba vacía. Puede probar audios, recordatorios, agenda, listas, contactos, baúl privado y llamadas dentro de un límite suficiente para sentir el producto.",
    },
  ],
  core: [
    {
      title: "Base estable para operar",
      short: "Más capacidad para vivir el día con orden.",
      detail:
        "Core ya sirve para trabajar todos los días con agenda, contactos, listas, documentos, seguimiento y recordatorios en serio, sin dar el salto grande todavía.",
    },
    {
      title: "Más espacio para resolver",
      short: "Más mensajes, más voz y más automatizaciones.",
      detail:
        "Sube la capacidad de uso diario para que usted delegue más y deje menos cosas sueltas sin perder el control del gasto mensual.",
    },
    {
      title: "Camino natural hacia Pro",
      short: "Google viene incluido a partir de Pro.",
      detail:
        "Si Core ya le quedó corto y quiere Gmail, Calendar y Drive integrados en su flujo, la ruta correcta es subir a Pro para tener una experiencia más completa.",
    },
  ],
  pro: [
    {
      title: "El punto más atractivo",
      short: "Google incluido y capacidad suficiente para operar de verdad.",
      detail:
        "Pro es el punto donde Operaly se siente más redondo: agenda, correos, contactos, documentos, llamadas y seguimiento con espacio suficiente para no quedarse corto a mitad de semana.",
    },
    {
      title: "Todo más conectado",
      short: "Gmail, Calendar y Drive trabajando en el mismo flujo.",
      detail:
        "Desde Pro, Google ya no es una promesa futura. Queda integrado como parte del plan para que todo lo importante se conecte mejor desde WhatsApp y desde el panel.",
    },
    {
      title: "Más margen, menos fricción",
      short: "Más minutos, más mensajes y más contactos activos.",
      detail:
        "Pro le deja trabajar con más soltura, especialmente si ya usa bastante audio, seguimiento operativo y búsquedas frecuentes sobre correos, agenda y documentos.",
    },
  ],
  pro_plus: [
    {
      title: "Operaly a máxima capacidad",
      short: "Para vivir dentro del producto todo el día.",
      detail:
        "Pro Plus abre el techo para quienes ya operan de forma intensiva y quieren usar Operaly como una capa central del trabajo diario, sin pensar tan seguido en límites.",
    },
    {
      title: "Más volumen sin romper ritmo",
      short: "Más voz, más mensajes y más automatizaciones activas.",
      detail:
        "Cuando la agenda, los correos, los documentos y el seguimiento se mueven todo el tiempo, Pro Plus da el margen para crecer sin frenar la operación.",
    },
    {
      title: "Google incluido y más margen",
      short: "Todo listo para equipos o agendas más pesadas.",
      detail:
        "Combina la integración de Google con una capacidad mucho más amplia para contactos, archivos y acciones recurrentes en el tiempo.",
    },
  ],
}

const PLAN_DETAILS_EN: Record<string, PlanFeatureDetail[]> = {
  trial: [
    {
      title: "A smooth start",
      short: "7 free days, no card required to begin.",
      detail:
        "Trial lets you feel the real value of Operaly from the first voice note. You can use the core modules, try Google and decide whether it truly helps organize your day before paying.",
    },
    {
      title: "Google included",
      short: "Gmail, Calendar and Drive ready from the start.",
      detail:
        "The trial comes with Google enabled so you can experience email, agenda and documents in the same flow without blocking the important part early.",
    },
    {
      title: "Real use, not a teaser",
      short: "Messages, voice, calls and automations included.",
      detail:
        "This is not an empty preview. You can try voice notes, reminders, agenda, lists, contacts, private vault and calls with enough room to truly feel the product.",
    },
  ],
  core: [
    {
      title: "A stable base",
      short: "More room to run your day with order.",
      detail:
        "Core is already enough to work daily with agenda, contacts, lists, documents, follow-up and reminders without making the bigger jump yet.",
    },
    {
      title: "More room to move",
      short: "More messages, more voice and more automations.",
      detail:
        "It raises daily capacity so you can delegate more, keep fewer things loose and still stay in control of monthly spending.",
    },
    {
      title: "The natural path to Pro",
      short: "Google is included from Pro onward.",
      detail:
        "If Core starts to feel short and you want Gmail, Calendar and Drive inside the flow, the right move is to upgrade to Pro.",
    },
  ],
  pro: [
    {
      title: "The strongest sweet spot",
      short: "Google included and enough capacity to work for real.",
      detail:
        "Pro is where Operaly feels more complete: agenda, email, contacts, documents, calls and follow-up with enough room to avoid feeling constrained midweek.",
    },
    {
      title: "Everything more connected",
      short: "Gmail, Calendar and Drive in the same flow.",
      detail:
        "From Pro onward, Google stops being a future promise and becomes part of the plan so the important pieces connect better from WhatsApp and the panel.",
    },
    {
      title: "More room, less friction",
      short: "More minutes, more messages and more active contacts.",
      detail:
        "Pro gives you more breathing room, especially when you already use voice a lot, frequent follow-up and repeated email or file searches.",
    },
  ],
  pro_plus: [
    {
      title: "Operaly at full capacity",
      short: "For people who want to live inside the product all day.",
      detail:
        "Pro Plus raises the ceiling for heavier operations that want Operaly as a central working layer without checking limits so often.",
    },
    {
      title: "More volume without breaking rhythm",
      short: "More voice, more messages and more active automations.",
      detail:
        "When agenda, email, documents and follow-up move all the time, Pro Plus gives the margin to grow without slowing the operation.",
    },
    {
      title: "Google included with wider room",
      short: "Ready for bigger agendas or heavier usage.",
      detail:
        "It combines Google integration with much more room for contacts, files and recurring actions over time.",
    },
  ],
}

const FAQ_ITEMS_ES = [
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
    question: "¿Los extras de voz y mensajes se renuevan solos?",
    answer:
      "No. Los extras de voz y mensajes son pagos únicos con una vigencia de 30 días. El almacenamiento adicional sí se suma como cargo mensual aparte del plan.",
  },
]

const FAQ_ITEMS_EN = [
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
      "Google is included during the trial and from Pro onward. In Core, the correct way to unlock it is by upgrading to Pro.",
  },
  {
    question: "Do voice and message extras renew automatically?",
    answer:
      "No. Voice and message extras are one-time purchases with a 30-day validity. Additional storage is the part that is added as a monthly charge on top of the plan.",
  },
]

const pricingCopy = {
  es: {
    eyebrow: "Tu liberación, tu plan",
    title: "Empiece gratis. Luego escale solo donde ya sienta valor real.",
    subtitle:
      "Menos ruido. Más claridad. Trial entra fuerte, Core ordena el día y Pro abre la versión más completa de Operaly.",
    selectedEyebrow: "Se activa con el plan elegido",
    selectedHint:
      "Pase el cursor por cada plan y vea cómo cambia la parte más valiosa. Si abre una tarjeta, verá una explicación más clara y más profunda sin perder el hilo.",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Todo lo importante, sin vueltas.",
    faqSubtitle:
      "Las dudas más comunes ya tienen respuesta clara para que la decisión se sienta más simple y rápida.",
    monthly: "por mes",
    trialSpan: "7 días para sentir el producto",
    mostChosen: "Más elegido",
    bestHere: "Lo mejor aquí",
    modalEyebrow: "Love mark Operaly",
    modalTitle: "Más claridad, menos peso mental y una mejor sensación de control.",
    modalBodyOne:
      "Operaly no quiere que abra diez pantallas para sentirse al día. Quiere que delegue mejor desde el canal donde ya vive.",
    modalBodyTwo:
      "Por eso cada plan empuja una experiencia concreta: menos fricción, más orden y una forma más humana de resolver lo pendiente.",
    modalCta: "Probar Operaly",
  },
  en: {
    eyebrow: "Your relief, your plan",
    title: "Start free. Upgrade only when you already feel real value.",
    subtitle:
      "Less noise. More clarity. Trial hooks first, Core stabilizes the day, and Pro opens the fullest Operaly experience.",
    selectedEyebrow: "What unlocks with this plan",
    selectedHint:
      "Hover each plan and watch the strongest value shift below. Open a card and you get a deeper summary without losing the thread.",
    faqEyebrow: "Frequently asked questions",
    faqTitle: "The important answers, without the fluff.",
    faqSubtitle:
      "The most common questions already have a clear answer so the decision feels faster and easier.",
    monthly: "per month",
    trialSpan: "7 days to feel the product",
    mostChosen: "Most chosen",
    bestHere: "Best here",
    modalEyebrow: "Operaly love mark",
    modalTitle: "More clarity, less mental weight and a stronger sense of control.",
    modalBodyOne:
      "Operaly is not built to make you open ten screens just to feel updated. It is built to help you delegate better from the channel you already use.",
    modalBodyTwo:
      "That is why each plan unlocks a concrete feeling: less friction, more order and a more human way to move what is pending.",
    modalCta: "Try Operaly",
  },
} as const

export function Pricing({ locale = "es" }: { locale?: string }) {
  const { pricing, loading, isPeru } = usePricingCurrency()
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [selectedFeature, setSelectedFeature] = useState<PlanFeatureDetail | null>(null)
  const isSpanish = locale === "es"
  const t = isSpanish ? pricingCopy.es : pricingCopy.en

  const activePlan = useMemo(
    () => OPERLAY_PLANS.find((plan) => plan.code === selectedPlan) ?? OPERLAY_PLANS[0],
    [selectedPlan]
  )

  const activeDetails = isSpanish ? PLAN_DETAILS[activePlan.code] ?? [] : PLAN_DETAILS_EN[activePlan.code] ?? []
  const faqItems = isSpanish ? FAQ_ITEMS_ES : FAQ_ITEMS_EN

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
                className={`group relative flex min-h-[420px] flex-col overflow-hidden rounded-[34px] border p-6 text-left transition-all duration-300 ${
                  isActive
                    ? "scale-[1.02] border-transparent bg-[linear-gradient(180deg,#0C153A_0%,#101C5F_40%,#1A2570_100%)] text-white shadow-[0_34px_90px_-38px_rgba(15,31,99,0.9)]"
                    : "border-[#DCE7F5] bg-white text-[#0F1F63] shadow-sm hover:-translate-y-1 hover:shadow-[0_24px_70px_-40px_rgba(15,31,99,0.45)]"
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
                      {plan.name}
                    </span>
                    {isPopular ? (
                      <span className="rounded-full bg-gradient-to-r from-[#8B7BFF] to-[#F35DB4] px-3 py-1 text-xs font-bold text-white">{t.mostChosen}</span>
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
                    {plan.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {plan.features.slice(0, 4).map((feature) => (
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
                    className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
                      isActive
                        ? "bg-white text-[#0F1F63]"
                        : isTrial
                          ? "bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] text-white"
                          : "bg-[#0F1F63] text-white"
                    }`}
                  >
                    {plan.code === "trial" ? "Prueba gratis" : plan.cta}
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
              <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">{activePlan.name}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                {t.selectedHint}
              </p>
            </div>
            <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/82">
              {activePlan.code === "trial" ? "Entrada más simple" : activePlan.code === "pro" ? "Camino más completo" : "Más capacidad"}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-full gap-4 pb-2">
              {activeDetails.map((detail) => (
                <button
                  key={detail.title}
                  type="button"
                  onClick={() => setSelectedFeature(detail)}
                  className="group min-w-[240px] flex-1 rounded-[28px] border border-white/12 bg-white/8 p-5 text-left transition hover:-translate-y-1 hover:bg-white/12"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A7F3D0]">
                    <Star className="h-3.5 w-3.5" />
                    {t.bestHere}
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
                  <AccordionTrigger className="py-5 text-base font-semibold text-[#0F1F63] hover:no-underline">
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
                  Operaly está diseñado para resolver primero lo cotidiano y después lo más sensible, sin ahogarlo en pasos innecesarios.
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
                <p>{t.modalBodyOne}</p>
                <p>{t.modalBodyTwo}</p>
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
