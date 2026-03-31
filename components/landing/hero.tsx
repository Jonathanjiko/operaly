import Link from "next/link"

export function Hero() {
  return (
    <section className="py-28 px-6 text-center relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Deja de olvidar todo.
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text">
            Operaly lo hace por ti.
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Tu asistente inteligente dentro de WhatsApp que organiza tu vida,
          ejecuta tareas, recuerda todo y trabaja contigo 24/7.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">

          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium shadow-lg hover:opacity-90 transition"
          >
            Probar gratis
          </Link>

          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border font-medium hover:bg-muted transition"
          >
            Iniciar sesión
          </Link>

        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          Funciona directamente en tu WhatsApp
        </div>

      </div>
    </section>
  )
}
