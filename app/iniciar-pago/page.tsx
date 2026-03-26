import { Suspense } from "react"
import IniciarPagoClient from "./IniciarPagoClient"

export default function IniciarPagoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando checkout...</div>}>
      <IniciarPagoClient />
    </Suspense>
  )
}
