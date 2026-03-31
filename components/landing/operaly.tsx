export function Operaly() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Tu asistente personal que
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            {" "}piensa, actúa y ejecuta por ti
          </span>
        </h2>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Operaly no es solo un asistente. Es tu sistema operativo personal dentro de WhatsApp.
          Organiza tu vida, ejecuta tareas, recuerda todo y trabaja contigo 24/7.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">

          <div className="p-6 rounded-2xl border bg-background/50 backdrop-blur">
            <h3 className="font-semibold mb-2">🧠 Memoria total</h3>
            <p className="text-sm text-muted-foreground">
              Guarda contactos, tareas, archivos, links, contraseñas… todo en tu base privada.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-background/50 backdrop-blur">
            <h3 className="font-semibold mb-2">🎯 Ejecución real</h3>
            <p className="text-sm text-muted-foreground">
              Agenda, llama, envía mensajes, crea tareas o automatiza procesos completos.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-background/50 backdrop-blur">
            <h3 className="font-semibold mb-2">📊 Control total</h3>
            <p className="text-sm text-muted-foreground">
              Visualiza todo en tu dashboard: pendientes, agenda, contactos, archivos y más.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
