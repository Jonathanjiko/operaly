const cookieGroups = [
  {
    title: "Cookies esenciales",
    description:
      "Son necesarias para que el sitio funcione, para mantener la sesión, recordar accesos básicos y proteger el servicio frente a abuso o errores de seguridad.",
  },
  {
    title: "Cookies funcionales",
    description:
      "Nos ayudan a recordar idioma, preferencias útiles, recorrido reciente y ciertos ajustes que hacen la experiencia más cómoda al volver a ingresar.",
  },
  {
    title: "Cookies de rendimiento",
    description:
      "Se usan para entender mejor cómo responde el sitio, detectar tiempos de carga, errores y puntos donde conviene simplificar la experiencia.",
  },
  {
    title: "Cookies de medición y mejora",
    description:
      "Sirven para entender de forma agregada qué partes del sitio generan más interés, dónde existe fricción y cómo mejorar el recorrido comercial y funcional.",
  },
]

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EEF5FF_0%,#FFFFFF_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[36px] border border-[#DCE7F5] bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,31,99,0.35)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">Operaly · Cookies</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0F1F63] sm:text-5xl">
            Preferencias de cookies
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Operaly usa cookies y tecnologías similares para mantener una experiencia más rápida, estable y útil. Aquí le explicamos qué tipos de cookies usamos y para qué sirven.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {cookieGroups.map((group) => (
              <section key={group.title} className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FBFF] p-6">
                <h2 className="text-xl font-black text-[#0F1F63]">{group.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{group.description}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-[#DCE7F5] bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_100%)] p-6">
            <h2 className="text-xl font-black text-[#0F1F63]">Qué puede esperar</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>Las cookies esenciales se usan para que la experiencia no se rompa. Las demás nos ayudan a mejorar el sitio, entender mejor el uso y dejarle una navegación más fluida.</p>
              <p>Puede gestionar o revisar estas preferencias desde los avisos y controles disponibles en el sitio. Si necesita una aclaración, puede escribir a support@operaly.app.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
