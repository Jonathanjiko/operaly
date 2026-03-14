import { Briefcase, Building2, Calendar, Users, FileText, Bell, ShoppingCart, MessageSquare, BookOpen, BarChart3, Brain, Send, Sparkles } from "lucide-react"

export function Solutions() {
  return (
    <section id="soluciones" className="py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-5 py-2 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-semibold mb-6">
            Soluciones
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F1F63] text-balance">
            Una solución para cada necesidad
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Ya seas profesional independiente o tengas un negocio, Operaly se adapta a ti.
          </p>
        </div>

        {/* Sofia intro */}
        <div className="mb-16 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 border border-[#7C3AED]/10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shrink-0">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#0F1F63] mb-2">
                Todos los planes incluyen a Sofía
              </h3>
              <p className="text-muted-foreground text-pretty text-base">
                Tu asistente IA con memoria conversacional, memoria de clientes y capacidad de ejecutar tareas por ti.
              </p>
            </div>
          </div>
        </div>

        {/* Solutions cards */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-12">
          {/* For Professionals */}
          <div className="group relative bg-card rounded-3xl p-10 md:p-14 border border-border shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] mb-10">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-[#0F1F63] mb-4">
                Para Profesionales
              </h3>
              <p className="text-xl text-[#1E40AF] font-semibold mb-10">
                Tu asistente personal inteligente
              </p>
              
              {/* Ideal for tags */}
              <div className="flex flex-wrap gap-3 mb-10">
                {["Abogados", "Médicos", "Consultores", "Psicólogos", "Coaches", "Contadores"].map((tag) => (
                  <span key={tag} className="px-4 py-2 text-sm font-medium rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="grid gap-5">
                {[
                  { icon: Users, label: "Guardar información de clientes" },
                  { icon: Brain, label: "Recordar casos y conversaciones" },
                  { icon: FileText, label: "Analizar documentos" },
                  { icon: Bell, label: "Generar recordatorios" },
                  { icon: Calendar, label: "Resumir pendientes" },
                  { icon: Send, label: "Enviar mensajes en tu nombre" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-5 p-5 rounded-2xl bg-secondary/30">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#3B82F6]/10">
                      <item.icon className="w-6 h-6 text-[#3B82F6]" />
                    </div>
                    <span className="text-base font-medium text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Example message */}
              <div className="mt-10 p-6 rounded-2xl bg-[#3B82F6]/5 border border-[#3B82F6]/10">
                <p className="text-sm text-muted-foreground mb-3">Ejemplo:</p>
                <p className="text-base text-[#0F1F63] italic">
                  {"\"Sofía, dile a Marcos Herrera que su plan de negocios ya está listo.\""}
                </p>
              </div>
            </div>
          </div>

          {/* For Businesses */}
          <div className="group relative bg-card rounded-3xl p-10 md:p-14 border border-border shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#34D399]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#06B6D4] mb-10">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-[#0F1F63] mb-4">
                Para Negocios
              </h3>
              <p className="text-xl text-[#047857] font-semibold mb-10">
                Tu agente de ventas y atención al cliente
              </p>
              
              {/* Ideal for tags */}
              <div className="flex flex-wrap gap-3 mb-10">
                {["Retail", "Restaurantes", "Servicios", "E-commerce", "Clínicas", "Inmobiliarias"].map((tag) => (
                  <span key={tag} className="px-4 py-2 text-sm font-medium rounded-full bg-[#34D399]/10 text-[#34D399]">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="grid gap-5">
                {[
                  { icon: MessageSquare, label: "Atención automatizada 24/7" },
                  { icon: ShoppingCart, label: "Ventas y pedidos por WhatsApp" },
                  { icon: BookOpen, label: "Gestión de reservas" },
                  { icon: BarChart3, label: "CRM integrado" },
                  { icon: Users, label: "Seguimiento de clientes" },
                  { icon: Send, label: "Campañas y notificaciones" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-5 p-5 rounded-2xl bg-secondary/30">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#34D399]/10">
                      <item.icon className="w-6 h-6 text-[#34D399]" />
                    </div>
                    <span className="text-base font-medium text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Example message */}
              <div className="mt-10 p-6 rounded-2xl bg-[#34D399]/5 border border-[#34D399]/10">
                <p className="text-sm text-muted-foreground mb-3">Ejemplo:</p>
                <p className="text-base text-[#0F1F63] italic">
                  {"\"Hola, quiero reservar una mesa para 4 personas el sábado a las 8pm.\""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
