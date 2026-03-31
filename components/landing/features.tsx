import { AudioLines, Bot, CalendarCheck2, FileText, KanbanSquare, MessageCircleMore, Shield, Workflow } from "lucide-react"

const featureRows = [
  {
    icon: CalendarCheck2,
    title: "Agenda interactiva y tareas programadas",
    text: "No solo anota. Operaly hace seguimiento, reprograma y te avisa cuando algo sigue pendiente.",
  },
  {
    icon: AudioLines,
    title: "Pendientes por voz y resúmenes hablados",
    text: "Puedes capturar ideas por audio y también recibir tu día resumido por audio cuando lo necesites.",
  },
  {
    icon: Workflow,
    title: "Automatizaciones que viven en segundo plano",
    text: "Cumpleaños, encargos, seguimientos, envíos y rutinas que se ejecutan aunque tú no estés pendiente.",
  },
  {
    icon: FileText,
    title: "Análisis profundo de archivos",
    text: "Procesa imágenes, PDFs, Word o Excel con criterio útil para trabajo profesional y seguimiento de casos.",
  },
  {
    icon: MessageCircleMore,
    title: "Mensajes, audios y archivos a terceros",
    text: "Delegas desde WhatsApp y Operaly se encarga de enviar información a clientes, familiares o equipo.",
  },
  {
    icon: KanbanSquare,
    title: "Panel visual para no perder el control",
    text: "Dashboard con agenda tipo kanban, contactos, archivos privados, tareas y consumo del plan.",
  },
  {
    icon: Shield,
    title: "Base de datos privada y discreta",
    text: "Tu información crítica permanece ordenada en un entorno pensado para uso personal y profesional serio.",
  },
  {
    icon: Bot,
    title: "Personalidad y enfoque según tu profesión",
    text: "Configura el tipo de análisis y comportamiento de tu agente para que trabaje con tu estilo y tu rubro.",
  },
]

export function Features() {
  return (
    <section id="funciones" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Funciones</p>
          <h2 className="mt-4 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
            Una capa de orden, memoria y ejecución encima de tu WhatsApp.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Cada bloque de Operaly está pensado para que sientas menos carga mental y más control de lo que importa.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureRows.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[28px] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-28px_rgba(15,31,99,0.18)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/12 via-[#7C3AED]/12 to-[#06B6D4]/12">
                <feature.icon className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#0F1F63]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
