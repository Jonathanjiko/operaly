export default function ClaimsBookPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EEF5FF_0%,#FFFFFF_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[36px] border border-[#DCE7F5] bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,31,99,0.35)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">Libro de reclamaciones</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0F1F63] sm:text-5xl">
            Registre su caso
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Si necesita dejar una queja o un reclamo formal, puede usar este formulario. Revisaremos el caso y le responderemos por el canal que nos indique.
          </p>

          <form className="mt-10 grid gap-4 md:grid-cols-2">
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Nombre completo" />
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Documento de identidad" />
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Correo" />
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Teléfono" />
            <select className="h-12 rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 md:col-span-2">
              <option>Seleccione el tipo de registro</option>
              <option>Reclamo</option>
              <option>Queja</option>
            </select>
            <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm md:col-span-2" placeholder="Asunto" />
            <textarea
              className="min-h-[200px] rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              placeholder="Describa de forma clara lo ocurrido, la fecha aproximada, el canal involucrado y lo que espera como atención o respuesta."
            />
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4 text-sm text-slate-600 md:col-span-2">
              <input type="checkbox" className="mt-1 h-4 w-4" />
              <span>Declaro que la información registrada es veraz y autorizo su tratamiento para atender este caso.</span>
            </label>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#0F1F63] px-6 text-sm font-bold text-white md:col-span-2 md:w-fit"
            >
              Enviar registro
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
