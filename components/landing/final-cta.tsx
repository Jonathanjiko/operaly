import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

const urgencyPoints = [
  "Prueba gratis y sin tarjeta para comenzar.",
  "Entre desde WhatsApp y siga desde su panel.",
  "Suba de plan solo cuando ya sienta fricción real.",
]

const ctaCopy = {
  es: {
    badge: "Operaly · menos carga mental, más control diario",
    titleA: "Empiece gratis primero.",
    titleB: "Luego escale solo si ya lo necesita.",
    subtitle:
      "Operaly está hecho para hacerle la vida más simple desde el uso real: audios, agenda, correos, listas, documentos y seguimiento en una sola experiencia.",
    primary: "Prueba gratis",
    secondary: "Ya tengo cuenta",
    bullets: urgencyPoints,
  },
  en: {
    badge: "Operaly · less mental load, more daily control",
    titleA: "Start free first.",
    titleB: "Then upgrade only if you truly need it.",
    subtitle:
      "Operaly is built to make daily work simpler through real use: voice notes, agenda, email, lists, files and follow-up in one experience.",
    primary: "Start free trial",
    secondary: "I already have an account",
    bullets: [
      "Start free without needing a card first.",
      "Enter from WhatsApp and continue from your panel.",
      "Upgrade only when you already feel real friction.",
    ],
  },
} as const

export function FinalCTA({ locale = "es" }: { locale?: string }) {
  const t = locale === "es" ? ctaCopy.es : ctaCopy.en

  return (
    <section className="relative overflow-hidden py-24 md:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0A1232_0%,#0F1F63_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,123,255,0.30),transparent_62%)] blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/88 backdrop-blur">
          <Sparkles className="h-4 w-4 text-[#86EFAC]" />
          {t.badge}
        </span>

        <h2 className="mt-8 text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
          {t.titleA}
          <br />
          <span className="bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] bg-clip-text text-transparent">
            {t.titleB}
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
          {t.subtitle}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-base font-bold text-[#0F1F63] shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transition hover:scale-[1.03]"
          >
            {t.primary}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/18 bg-white/8 px-10 py-5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/14"
          >
            {t.secondary}
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {t.bullets.map((point) => (
            <div key={point} className="flex items-center gap-2 text-sm text-white/72">
              <CheckCircle2 className="h-4 w-4 text-[#86EFAC]" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
