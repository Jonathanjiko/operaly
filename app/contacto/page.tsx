export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFF] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] border border-[#DCE7F5] bg-[#0F1F63] p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Contacto</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Conversemos.</h1>
          <p className="mt-4 text-sm leading-7 text-white/75">
            Si necesita ayuda, soporte, información comercial o quiere hablar con nuestro equipo, aquí lo tiene fácil.
          </p>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Correo directo</p>
            <a href="mailto:support@operaly.app" className="mt-2 block text-lg font-bold text-white">
              support@operaly.app
            </a>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#DCE7F5] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-[#0F1F63]">Déjenos su mensaje</h2>
          <form className="mt-6 grid gap-4">
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Nombre" />
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Correo" />
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Asunto" />
            <textarea className="min-h-[160px] rounded-2xl border border-slate-200 px-4 py-3 text-sm" placeholder="Cuéntenos qué necesita" />
            <button type="button" className="inline-flex h-12 items-center justify-center rounded-full bg-[#0F1F63] px-6 text-sm font-bold text-white">
              Enviar mensaje
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
