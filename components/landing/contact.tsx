import { Mail } from "lucide-react"

export function Contact() {
  return (
    <section id="contacto" className="py-16 md:py-20 border-t border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F1F63] mb-4">
          ¿Necesitas ayuda?
        </h2>
        <p className="text-muted-foreground text-lg mb-6">
          Nuestro equipo está listo para ayudarte a implementar Operaly en tu negocio.
        </p>
        <a 
          href="mailto:contacto@operaly.app"
          className="inline-flex items-center gap-2 text-[#3B82F6] hover:text-[#06B6D4] font-medium text-lg transition-colors"
        >
          <Mail className="w-5 h-5" />
          contacto@operaly.app
        </a>
      </div>
    </section>
  )
}
