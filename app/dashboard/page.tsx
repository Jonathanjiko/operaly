"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/professional")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]" />
        <p className="text-[#5F6B7A]">Redirigiendo a tu dashboard...</p>
      </div>
    </div>
  )
}
