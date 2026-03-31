import { ArrowRight, Sparkles } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F1F63] via-[#1E3A8A] to-[#0EA5E9]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:68px_68px]" />
      <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),transparent_65%)] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
          <Sparkles className="h-4 w-4" />
          Operaly Assistant
        </span>
        <h2 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          Tu vida ya es lo bastante compleja.
          <span className="block text-[#C7D2FE]">Tu sistema no debería serlo.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/80">
          Empieza con Operaly y convierte tu WhatsApp en un asistente personal serio: ordenado, discreto, ejecutivo y siempre disponible.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-[#0F1F63] shadow-[0_20px_45px_-22px_rgba(255,255,255,0.8)] transition hover:-translate-y-0.5"
          >
            Probar 7 días gratis
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/login"
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/15"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    </section>
  )
}
