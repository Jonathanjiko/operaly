import { UserPlus, Smartphone, Sparkles } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Regístrate y configura tu cuenta",
    description: "Crea tu cuenta en Operaly y elige si lo usarás como profesional o como negocio.",
    gradient: "from-[#3B82F6] to-[#06B6D4]",
    iconBg: "bg-[#3B82F6]/10",
    iconColor: "text-[#3B82F6]",
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Conecta tu número de WhatsApp",
    description: "Registra tu número para que Sofía pueda asistirte o atender a tus clientes automáticamente.",
    gradient: "from-[#06B6D4] to-[#34D399]",
    iconBg: "bg-[#06B6D4]/10",
    iconColor: "text-[#06B6D4]",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Empieza a trabajar con Sofía",
    description: "Sofía organiza clientes, agenda, recordatorios y también puede vender, reservar y hacer seguimiento a tus clientes.",
    gradient: "from-[#34D399] to-[#3B82F6]",
    iconBg: "bg-[#34D399]/10",
    iconColor: "text-[#34D399]",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 md:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] text-sm font-semibold mb-4">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F1F63] text-balance">
            Cómo funciona Operaly
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Convierte WhatsApp en tu asistente inteligente o en tu agente de ventas en solo minutos.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Step number badge */}
              <div className={`absolute -top-4 left-8 px-4 py-1.5 rounded-full bg-gradient-to-r ${step.gradient} text-white text-sm font-bold shadow-lg`}>
                Paso {step.number}
              </div>

              {/* Connector line (hidden on mobile, shown on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-border to-transparent z-10" />
              )}

              <div className="pt-4">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.iconBg} mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#0F1F63] mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-semibold shadow-lg shadow-[#3B82F6]/25 hover:shadow-xl hover:shadow-[#3B82F6]/30 transition-all hover:-translate-y-0.5"
          >
            Comenzar ahora
          </a>
        </div>
      </div>
    </section>
  )
}
