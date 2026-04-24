import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09112B] px-4 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">404</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight">Esta página no existe.</h1>
      <p className="mt-4 max-w-md text-center text-lg text-white/70">
        Puede que el enlace haya cambiado o que la dirección tenga un error.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0F1F63] transition hover:scale-105"
        >
          Ir al inicio
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Mi dashboard
        </Link>
      </div>
    </div>
  )
}
