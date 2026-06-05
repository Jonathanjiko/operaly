"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
              Error inesperado
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight">
              Tuvimos un problema al cargar esta pantalla.
            </h1>
            <p className="mt-3 text-sm text-white/70">
              Ya registramos el incidente para revisarlo. Puedes intentar nuevamente sin perder tu sesión.
            </p>
            <button
              onClick={() => reset()}
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Intentar de nuevo
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
