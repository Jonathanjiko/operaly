import { Bell, Users, Calendar, FileText, Brain, MessageSquare, UserPlus, ShoppingCart, BookOpen, TrendingUp, Sparkles } from "lucide-react"

const professionalFeatures = [
  { icon: Bell, label: "Recordatorios automáticos" },
  { icon: Users, label: "Seguimiento de clientes" },
  { icon: Calendar, label: "Organización de agenda" },
  { icon: FileText, label: "Notas y documentos" },
  { icon: Brain, label: "Consultas con IA" },
]

const businessFeatures = [
  { icon: MessageSquare, label: "Atención automática a clientes" },
  { icon: UserPlus, label: "Registro de leads" },
  { icon: ShoppingCart, label: "Ventas por WhatsApp" },
  { icon: BookOpen, label: "Gestión de reservas" },
  { icon: TrendingUp, label: "Seguimiento comercial" },
]

export function Sofia() {
  return (
    <section id="sofia" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/[0.03] via-[#3B82F6]/[0.05] to-[#06B6D4]/[0.03]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#7C3AED]/10 via-[#3B82F6]/10 to-[#06B6D4]/10 rounded-full blur-3xl opacity-60" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section header with AI glow */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          {/* Badge with sparkle */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#7C3AED]/15 via-[#3B82F6]/15 to-[#06B6D4]/15 border border-[#7C3AED]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
              Tu asistente IA
            </span>
          </div>
          
          {/* Title with glow effect */}
          <div className="relative inline-block">
            {/* Glow behind title */}
            <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-[#7C3AED]/20 via-[#3B82F6]/20 to-[#06B6D4]/20 rounded-full blur-3xl opacity-70 animate-pulse" />
            <h2 className="relative text-4xl sm:text-5xl md:text-6xl font-bold text-[#0F1F63] text-balance leading-tight">
              Conoce a{" "}
              <span className="relative inline-block">
                {/* Glow specifically for Sofia name */}
                <span className="absolute -inset-2 bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] rounded-lg blur-xl opacity-30" />
                <span className="relative bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent font-extrabold">
                  Sofía
                </span>
              </span>
            </h2>
          </div>
          
          <p className="mt-6 text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            Tu asistente inteligente en WhatsApp con memoria conversacional y capacidad de ejecutar tareas por ti.
          </p>

          {/* AI capabilities badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Memoria conversacional", "Memoria de clientes", "Ejecuta tareas"].map((cap) => (
              <span 
                key={cap} 
                className="px-4 py-2 text-sm font-medium rounded-full bg-white border border-border shadow-sm text-[#0F1F63]"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Professional column */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-[#3B82F6]/10 shadow-lg shadow-[#3B82F6]/5 hover:shadow-xl hover:shadow-[#3B82F6]/10 transition-all duration-300">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#06B6D4]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] rounded-2xl blur-lg opacity-40" />
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#0F1F63]">
                  Sofía para profesionales
                </h3>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {professionalFeatures.map((feature) => (
                  <div 
                    key={feature.label} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#3B82F6]/5 to-transparent hover:from-[#3B82F6]/10 hover:to-[#06B6D4]/5 transition-colors border border-transparent hover:border-[#3B82F6]/10"
                  >
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white shadow-md border border-[#3B82F6]/10">
                      <feature.icon className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <span className="text-base font-medium text-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business column */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-[#34D399]/10 shadow-lg shadow-[#34D399]/5 hover:shadow-xl hover:shadow-[#34D399]/10 transition-all duration-300">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#34D399]/5 via-transparent to-[#06B6D4]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#34D399] to-[#06B6D4] rounded-2xl blur-lg opacity-40" />
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#06B6D4] shadow-lg">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#0F1F63]">
                  Sofía para negocios
                </h3>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {businessFeatures.map((feature) => (
                  <div 
                    key={feature.label} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#34D399]/5 to-transparent hover:from-[#34D399]/10 hover:to-[#06B6D4]/5 transition-colors border border-transparent hover:border-[#34D399]/10"
                  >
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white shadow-md border border-[#34D399]/10">
                      <feature.icon className="w-5 h-5 text-[#34D399]" />
                    </div>
                    <span className="text-base font-medium text-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
