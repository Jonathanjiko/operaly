import { CalendarRange, FileStack, Mic, PhoneCall, Send, ShieldCheck, Sparkles, Workflow } from "lucide-react"

const useCases = [
  {
    title: "Profesionales que llevan demasiadas cosas a la vez",
    description:
      "Abogados, médicos, consultores, coaches, arquitectos o freelancers que necesitan memoria, seguimiento y ejecución sin abrir 20 apps distintas.",
    accent: "from-[#7C3AED] to-[#3B82F6]",
    items: ["Seguimiento de casos", "Agenda interactiva", "Notas por voz", "Recordatorios precisos"],
  },
  {
    title: "Personas ultra ocupadas que necesitan un segundo cerebro",
    description:
      "Cuando tienes pendientes, favores, archivos, reservas, cumpleaños y encargos flotando al mismo tiempo, Operaly toma el control y lo vuelve sistema.",
    accent: "from-[#3B82F6] to-[#06B6D4]",
    items: ["Resúmenes diarios", "Llamadas por encargo", "Mensajes a terceros", "Pendientes por audio"],
  },
  {
    title: "Usuarios que manejan información sensible",
    description:
      "Guarda links, contraseñas, audios, PDFs, referencias y archivos en un baúl privado listo para usar cuando lo necesites.",
    accent: "from-[#06B6D4] to-[#34D399]",
    items: ["Baúl privado", "Archivos protegidos", "Links y secretos", "Research personal"],
  },
]

const capabilities = [
  { icon: CalendarRange, title: "Agenda que sí te sigue el ritmo", text: "Tareas programadas, citas, seguimientos y recordatorios que viven en tu WhatsApp y también se integran con tu calendario." },
  { icon: Mic, title: "Piensa por voz, Operaly lo ordena", text: "Convierte notas de voz en tareas, resúmenes, pendientes o encargos claros sin perder contexto." },
  { icon: PhoneCall, title: "Encarga llamadas y gestiones", text: "Pide reservas, confirmaciones o recordatorios a terceros, y recibe de vuelta un resumen útil de lo que pasó." },
  { icon: Send, title: "Envía por ti sin estar presente", text: "Archivos, audios, mensajes o research a clientes, pareja, equipo o contactos sin que tengas que acordarte después." },
  { icon: FileStack, title: "Analiza documentos e imágenes", text: "PDF, Word, Excel, fotos y otros archivos con contexto profundo para ayudarte a decidir más rápido." },
  { icon: ShieldCheck, title: "Todo queda bajo tu control", text: "Base privada con memoria suficiente para guardar contexto, contraseñas, links, archivos y referencias importantes." },
]

export function Solutions() {
  return (
    <section id="soluciones" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-5 py-2 text-sm font-semibold text-[#7C3AED]">
            <Sparkles className="h-4 w-4" />
            Hecho para la vida real
          </span>
          <h2 className="mt-6 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
            No es otro chatbot.
            <span className="block">Es un asistente operativo personal.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Operaly está diseñado para ayudarte a recordar, ejecutar, delegar y mantener orden sobre información crítica sin salir de WhatsApp.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <article
              key={useCase.title}
              className="group relative overflow-hidden rounded-[30px] border border-border bg-white/85 p-8 shadow-[0_18px_50px_-20px_rgba(15,31,99,0.18)] backdrop-blur"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${useCase.accent}`} />
              <h3 className="text-2xl font-bold text-[#0F1F63]">{useCase.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{useCase.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {useCase.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#F4F8FF] px-4 py-2 text-sm font-medium text-[#0F1F63]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[34px] border border-[#DCE6F8] bg-gradient-to-br from-white via-[#F8FBFF] to-[#EEF6FF] p-8 md:p-10 shadow-[0_20px_60px_-30px_rgba(15,31,99,0.22)]">
          <div className="flex flex-col gap-6 border-b border-[#DCE6F8] pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">Capacidades clave</p>
              <h3 className="mt-3 text-3xl font-bold text-[#0F1F63]">Tu caos entra por WhatsApp. Tu sistema sale ordenado.</h3>
            </div>
            <div className="rounded-2xl border border-[#DBE8FF] bg-white/80 px-4 py-3 text-sm text-muted-foreground shadow-sm">
              Seller Assistant tendrá su propia landing aparte. Aquí hablamos solo de tu asistente personal Operaly.
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/70 bg-white/90 p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/15 to-[#7C3AED]/15">
                  <item.icon className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <h4 className="mt-5 text-lg font-semibold text-[#0F1F63]">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
