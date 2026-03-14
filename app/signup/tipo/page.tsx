"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TipoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new account type selection flow
    router.replace("/select-account-type")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
