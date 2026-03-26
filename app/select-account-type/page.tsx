"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SelectAccountTypePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/register")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirigiendo al nuevo registro...</p>
    </div>
  )
}
