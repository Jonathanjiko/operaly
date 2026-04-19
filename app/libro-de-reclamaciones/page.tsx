export default function ClaimsBookPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFF] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-[#DCE7F5] bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">Libro de reclamaciones</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0F1F63]">Registre su caso</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Si necesita dejar una reclamación o queja formal, use este formulario. Nuestro equipo revisará el caso y le responderá por el canal de contacto indicado.
        </p>
        <form className="mt-8 grid gap-4 md:grid-cols-2">
          <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Nombre completo" />
          <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Documento de identidad" />
          <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Correo" />
          <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Teléfono" />
          <input className="h-12 rounded-2xl border border-slate-200 px-4 text-sm md:col-span-2" placeholder="Asunto" />
          <textarea className="min-h-[180px] rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" placeholder="Detalle de la reclamación o queja" />
          <button type="button" className="inline-flex h-12 items-center justify-center rounded-full bg-[#0F1F63] px-6 text-sm font-bold text-white md:col-span-2 md:w-fit">
            Enviar registro
          </button>
        </form>
      </div>
    </main>
  )
}
