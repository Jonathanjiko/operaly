import { Bell, BrainCircuit, Files, PhoneCall } from "lucide-react"

const indicators = [
  { icon: BrainCircuit, label: "Memoria real de casos, tareas y contexto" },
  { icon: Bell, label: "Recordatorios y seguimientos automáticos" },
  { icon: PhoneCall, label: "Llamadas programadas o en tiempo real" },
  { icon: Files, label: "Archivos, audios y documentos listos para compartir" },
]

export function TrustIndicators() {
  return (
    <section className="border-y border-border/50 bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mx-auto mb-8 max-w-3xl text-center text-base text-muted-foreground md:text-lg">
          Operaly está diseñado para quienes viven con demasiadas cosas abiertas al mismo tiempo y necesitan una capa extra de orden, memoria y ejecución.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {indicators.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-medium text-[#0F1F63] shadow-sm backdrop-blur"
            >
              <item.icon className="h-4 w-4 text-[#3B82F6]" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
