"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getClientPlanCode, resolveClientIdFromUser } from "@/lib/client-context"

export default function DashboardEntryPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const resolveDashboard = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          throw error
        }

        if (!user) {
          if (!cancelled) {
            router.replace("/login")
          }
          return
        }

        const selectedPlan = String(user.user_metadata?.selected_plan || "trial").toLowerCase()
        const clientId = resolveClientIdFromUser(user)

        if (!clientId) {
          if (!cancelled) {
            router.replace(`/register/setup?plan=${selectedPlan}`)
          }
          return
        }

        let planCode = selectedPlan

        try {
          const resolvedPlanCode = await getClientPlanCode(clientId)
          if (resolvedPlanCode) {
            planCode = String(resolvedPlanCode).toLowerCase()
          }
        } catch (planError) {
          console.error("[dashboard] plan lookup fallback:", planError)
        }

        const accountType = String(
          user.app_metadata?.account_type || user.user_metadata?.account_type || ""
        ).toLowerCase()
        const isOwner = planCode === "owner" || accountType === "owner"

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
