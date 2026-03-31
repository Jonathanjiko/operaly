import { Bot, CalendarSync, Smartphone, Workflow } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Conectas tu WhatsApp y eliges tu perfil",
    description:
      "Operaly se adapta a tu profesión, tu forma de trabajar y el tipo de seguimiento que necesitas manejar cada día.",
    gradient: "from-[#3B82F6] to-[#06B6D4]",
  },
  {
    number: "02",
    icon: Bot,
    title: "Le delegas tareas reales con lenguaje natural",
    description:
      "Puedes pedirle recordatorios, resúmenes, research, llamadas, seguimiento de casos, envíos a terceros o gestión de pendientes por voz.",
    gradient: "from-[#7C3AED] to-[#3B82F6]",
  },
  {
    number: "03",
    icon: CalendarSync,
    title: "Todo se refleja en tu sistema privado",
    description:
      "Agenda, dashboard, archivos, notas, automatizaciones y consumos del plan quedan visibles para que tengas control sin fricción.",
    gradient: "from-[#06B6D4] to-[#34D399]",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-gradient-to-b from-background to-secondary/20 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#06B6D4]/10 px-4 py-1.5 text-sm font-semibold text-[#0891B2]">
            <Workflow className="h-4 w-4" />
            Cómo funciona
          </span>
          <h2 className="mt-5 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
            Lo suficientemente simple como para usarlo hoy.
            <span className="block">Lo suficientemente potente como para depender de él mañana.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            En pocos pasos conviertes tu WhatsApp en una capa operativa que recuerda, organiza, ejecuta y te devuelve foco.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-[30px] border border-border bg-white/85 p-8 shadow-[0_18px_50px_-25px_rgba(15,31,99,0.18)] backdrop-blur"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${step.gradient}`} />
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-14 translate-x-1/2 bg-gradient-to-r from-[#D8E2F3] to-transparent md:block" />
              )}
              <div className="mt-2 inline-flex rounded-full bg-[#F3F7FE] px-4 py-1.5 text-sm font-bold text-[#0F1F63]">
                Paso {step.number}
              </div>
              <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F2F7FF] to-white shadow-sm">
                <step.icon className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[#0F1F63]">{step.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] px-8 py-4 font-semibold text-white shadow-[0_18px_45px_-18px_rgba(59,130,246,0.7)] transition hover:opacity-95"
          >
            Comenzar ahora
          </a>
        </div>
      </div>
    </section>
  )
}
