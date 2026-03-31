import { BellRing, BrainCircuit, FileSearch2, LockKeyhole, PhoneCall, SendHorizonal, Sparkles } from "lucide-react"

const personalFlows = [
  {
    icon: BellRing,
    title: "Tus mañanas dejan de empezar en caos",
    text: "Operaly te saluda con tus pendientes del día, prioridades, citas y recordatorios para que sepas exactamente qué mover primero.",
  },
  {
    icon: FileSearch2,
    title: "Te ayuda a pensar y decidir mejor",
    text: "Analiza fotos, PDFs, Word, Excel y otros documentos con profundidad, contexto profesional y estructura clara.",
  },
  {
    icon: SendHorizonal,
    title: "Ejecuta aunque tú estés ocupado",
    text: "Puede enviar mensajes, archivos, audios, research o encargos a terceros justo cuando tú no puedes hacerlo.",
  },
  {
    icon: PhoneCall,
    title: "Hace gestiones en tu nombre",
    text: "Reservas, coordinaciones, confirmaciones o llamadas programadas con resumen final de resultado positivo o negativo.",
  },
  {
    icon: LockKeyhole,
    title: "Guarda lo que no puedes perder",
    text: "Contraseñas, links, contactos clave, documentos y secretos en un baúl privado organizado y accesible desde tu dashboard.",
  },
  {
    icon: BrainCircuit,
    title: "Se adapta a tu forma de trabajar",
    text: "Puedes darle personalidad, enfoque profesional y criterio analítico según tu rubro para que piense más como tú necesitas.",
  },
]

export function Sofia() {
  return (
    <section id="operaly" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="sticky top-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-4 py-2 text-sm font-semibold text-[#6D28D9]">
              <Sparkles className="h-4 w-4" />
              ¿Qué hace diferente a Operaly?
            </span>
            <h2 className="mt-6 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
              No solo responde.
              <span className="block">Te acompaña, te recuerda y te ejecuta trabajo real.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Operaly vive en tu WhatsApp, pero su cerebro se extiende a tu agenda, tus archivos, tus automatizaciones y tu panel privado.
              Se siente como tener un asistente personal profesional, atento, discreto y siempre disponible.
            </p>

            <div className="mt-8 rounded-[28px] border border-[#DCE6F8] bg-gradient-to-br from-white via-[#F8FBFF] to-[#EEF6FF] p-6 shadow-[0_20px_50px_-25px_rgba(15,31,99,0.2)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3B82F6]">Ejemplos reales</p>
              <div className="mt-5 space-y-3 text-sm text-[#0F1F63]">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">“Operaly, averigua sobre ese tema y envíaselo a mi esposa.”</div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">“Llama al restaurante a las 4 pm y resérvame una mesa para 4.”</div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">“Léeme por audio mis pendientes y los casos que siguen abiertos.”</div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {personalFlows.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-[28px] border border-border bg-white/85 p-6 shadow-[0_18px_50px_-28px_rgba(15,31,99,0.18)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED]/12 via-[#3B82F6]/12 to-[#06B6D4]/12">
                  <feature.icon className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#0F1F63]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
