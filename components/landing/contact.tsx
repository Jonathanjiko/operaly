import { Mail } from "lucide-react"

export function Contact() {
  return (
    <section id="contacto" className="border-t border-border py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0F1F63] md:text-3xl">¿Quieres implementar Operaly con criterio desde el inicio?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Escríbenos y te ayudamos a aterrizar la mejor configuración para tu flujo personal o profesional.
        </p>
        <a
          href="mailto:contacto@operaly.app"
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#DBE8FF] bg-white px-6 py-3 text-base font-semibold text-[#3B82F6] shadow-sm transition hover:text-[#06B6D4]"
        >
          <Mail className="h-5 w-5" />
          contacto@operaly.app
        </a>
      </div>
    </section>
  )
}
