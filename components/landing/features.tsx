export function Features() {
  return (
    <section id="funciones" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold text-center mb-16">
          Todo lo que puedes hacer con Operaly
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            "Agenda inteligente con recordatorios automáticos",
            "Notas por voz que se convierten en tareas",
            "Automatizaciones personalizadas",
            "Llamadas programadas o en tiempo real",
            "Envía archivos, audios o mensajes a terceros",
            "Análisis de PDFs, imágenes y documentos",
            "Dashboard tipo Kanban",
            "Base de datos privada (baúl seguro)",
            "Integración con Google Calendar y Drive"
          ].map((item, i) => (
            <div key={i} className="p-5 border rounded-xl bg-background/50 backdrop-blur">
              <p className="text-sm">{item}</p>
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}
