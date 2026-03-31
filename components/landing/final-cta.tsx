import { ArrowRight, Sparkles, CheckCircle2, Zap, Shield, Clock } from "lucide-react"

const urgencyPoints = [
  { icon: CheckCircle2, text: "7 días gratis — sin tarjeta" },
  { icon: Zap, text: "Activo en menos de 2 minutos" },
  { icon: Shield, text: "Cancela cuando quieras" },
  { icon: Clock, text: "Soporte real incluido" },
]

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background dramático */}
      <div className="absolute inset-0 bg-[#0A0F2E]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] [background-size:68px_68px]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.25),transparent_50%)]" />
      <div className="absolute right-0 bottom-0 h-full w-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.20),transparent_50%)]" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_65%)] blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur mb-8">
          <Sparkles className="h-4 w-4 text-[#06B6D4]" />
          Operaly — Tu asistente en WhatsApp
        </span>

        {/* Headline agresivo */}
        <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Cada día sin Operaly
          <br />
          <span className="bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#34D399] bg-clip-text text-transparent">
            es un día perdiendo tiempo
          </span>
          <br />
          en cosas que no importan.
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/70">
          Los mejores profesionales no trabajan más — trabajan con sistemas más inteligentes.
          Operaly es el sistema que ya debías tener.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-base font-bold text-[#0F1F63] shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transition-all hover:scale-[1.03] hover:shadow-[0_25px_70px_-12px_rgba(255,255,255,0.6)]"
          >
            Empezar gratis ahora
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="/precios"
            className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-10 py-5 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/15"
          >
            Ver planes y precios
          </a>
        </div>

        {/* Trust points */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {urgencyPoints.map((point) => (
            <div key={point.text} className="flex items-center gap-2 text-sm text-white/70">
              <point.icon className="h-4 w-4 text-[#34D399]" />
              {point.text}
            </div>
          ))}
        </div>

        {/* Urgency note */}
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-5 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />
          <p className="text-sm font-medium text-[#FCA5A5]">
            El precio de lanzamiento sube pronto — accede hoy con el precio más bajo
          </p>
        </div>
      </div>
    </section>
  )
}
