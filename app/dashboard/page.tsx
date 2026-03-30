"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardEntryPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const resolveDashboard = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        if (!cancelled) {
          router.replace("/login")
        }
        return
      }

      const metadata = data.user.user_metadata || {}
      const appMetadata = data.user.app_metadata || {}

      const isOwner =
        Boolean(metadata.operaly_owner) ||
        Boolean(metadata.owner_mode) ||
        Boolean(appMetadata.operaly_owner)

      if (!cancelled) {
        router.replace(isOwner ? "/dashboard/owner" : "/dashboard/professional")
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
