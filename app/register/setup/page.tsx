import { Suspense } from "react"
import SetupClient from "./SetupClient"

export default function RegisterSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Cargando configuración...
        </div>
      }
    >
      <SetupClient />
    </Suspense>
  )
}
