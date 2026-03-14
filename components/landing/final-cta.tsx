import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F1F63] via-[#1a2f7a] to-[#0F1F63]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <MessageCircle className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-sm font-medium text-white/90">
                Más de 500,000 conversaciones automatizadas
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance max-w-3xl mx-auto mb-6">
              Comienza a transformar tu negocio hoy mismo
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 text-pretty">
              Únete a miles de profesionales y empresas que ya están automatizando su atención al cliente y multiplicando sus resultados con Operaly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-[#0F1F63] hover:bg-white/90 rounded-full px-8 h-14 text-base font-semibold shadow-lg group"
                asChild
              >
                <a href="/register">
                  Probar 7 días gratis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 h-14 text-base font-semibold border-2 border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href="#contacto">
                  Hablar con ventas
                </a>
              </Button>
            </div>

            <p className="mt-6 text-sm text-white/50">
              Sin tarjeta de crédito • Configuración en 5 minutos • Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
