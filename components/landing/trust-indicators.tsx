import { Bot, Clock, Database, Plug } from "lucide-react"

const indicators = [
  { icon: Bot, label: "Automatización inteligente" },
  { icon: Clock, label: "Atención 24/7" },
  { icon: Database, label: "CRM integrado" },
  { icon: Plug, label: "Integraciones" },
]

export function TrustIndicators() {
  return (
    <section className="py-12 border-y border-border/50 bg-gradient-to-b from-background to-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground mb-8">
          Profesionales y negocios ya están automatizando su WhatsApp con Operaly.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {indicators.map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm"
            >
              <item.icon className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
