"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getClientContext, getClientPlanCode } from "@/lib/client-context"

export default function DashboardEntryPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const resolveDashboard = async () => {
      try {
        const { clientId } = await getClientContext()
        const planCode = await getClientPlanCode(clientId)
        const isOwner = String(planCode || "").toLowerCase() === "owner"

        if (!cancelled) {
          router.replace(isOwner ? "/dashboard/owner" : "/dashboard/professional")
        }
      } catch {
        if (!cancelled) {
          router.replace("/login")
        }
      }
    }

    resolveDashboard()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
      Cargando dashboard...
    </div>
  )
}
