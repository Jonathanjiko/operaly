import { CalendarDays, Files, Globe2, Phone, ShieldCheck } from "lucide-react"

const integrations = [
  {
    icon: Phone,
    title: "WhatsApp como centro operativo",
    description: "Tu canal principal sigue siendo WhatsApp. La magia ocurre sin obligarte a cambiar de hábito.",
  },
  {
    icon: CalendarDays,
    title: "Google Calendar",
    description: "Tus citas, recordatorios y tareas programadas viven sincronizadas para que no pierdas contexto.",
  },
  {
    icon: Files,
    title: "Google Drive",
    description: "Archivos y documentos importantes disponibles para enviar, revisar o usar como memoria activa.",
  },
  {
    icon: ShieldCheck,
    title: "Dashboard privado",
    description: "Controlas tareas, agenda, archivos, contactos y consumo del plan desde un panel claro y ordenado.",
  },
  {
    icon: Globe2,
    title: "Preparado para crecer contigo",
    description: "Operaly puede convertirse en tu capa central de trabajo personal antes de escalar a más automatizaciones.",
  },
]

export function Integrations() {
  return (
    <section className="bg-gradient-to-b from-secondary/20 to-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#06B6D4]">Integraciones</p>
            <h2 className="mt-4 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
              Operaly no vive aislado.
              <span className="block">Se conecta con tu rutina real.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Todo está pensado para que uses un solo punto de entrada y sigas teniendo visibilidad total desde tu panel.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {integrations.map((item) => (
              <article key={item.title} className="rounded-[28px] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-28px_rgba(15,31,99,0.16)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#06B6D4]/12 to-[#3B82F6]/12">
                  <item.icon className="h-5 w-5 text-[#06B6D4]" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#0F1F63]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
