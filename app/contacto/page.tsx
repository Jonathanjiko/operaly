export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EEF5FF_0%,#FFFFFF_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[36px] border border-[#DCE7F5] bg-[linear-gradient(180deg,#0F1F63_0%,#172A75_100%)] p-8 text-white shadow-[0_24px_70px_-40px_rgba(15,31,99,0.45)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Contacto</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Conversemos.</h1>
            <p className="mt-5 text-sm leading-7 text-white/76">
              Si necesita ayuda, soporte, información comercial, una aclaración legal o quiere hablar con nuestro equipo, puede dejarnos aquí su mensaje.
            </p>

            <div className="mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/6 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Correo de soporte</p>
                <a href="mailto:support@operaly.app" className="mt-2 block text-lg font-bold text-white">
                  support@operaly.app
                </a>
              </div>
              <div className="grid gap-4 text-sm text-white/76">
                <p>Le respondemos por el canal indicado en su solicitud.</p>
                <p>Si su consulta está relacionada con privacidad, pagos o reclamaciones, use el asunto correcto para atenderlo más rápido.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-[#DCE7F5] bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,31,99,0.35)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">Formulario</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0F1F63]">
              Déjenos su mensaje
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Este formulario está preparado para que podamos atender mejor su caso. El destino previsto es nuestro canal de soporte en support@operaly.app.
            </p>

            <form className="mt-8 grid gap-4 md:grid-cols-2">
              <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Nombre completo" />
              <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Empresa o proyecto" />
              <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Correo" />
              <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Teléfono o WhatsApp" />
              <select className="h-12 rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 md:col-span-2">
                <option>Seleccione el motivo</option>
                <option>Soporte</option>
                <option>Ventas</option>
                <option>Pagos o facturación</option>
                <option>Privacidad o datos personales</option>
                <option>Otro</option>
              </select>
              <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm md:col-span-2" placeholder="Asunto" />
              <textarea
                className="min-h-[180px] rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                placeholder="Cuéntenos qué necesita y, si hace falta, déjenos contexto para atenderlo mejor."
              />
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4 text-sm text-slate-600 md:col-span-2">
                <input type="checkbox" className="mt-1 h-4 w-4" />
                <span>Autorizo el uso de mis datos para que Operaly me contacte y atienda esta solicitud.</span>
              </label>
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0F1F63] px-6 text-sm font-bold text-white md:col-span-2 md:w-fit"
              >
                Enviar solicitud
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
