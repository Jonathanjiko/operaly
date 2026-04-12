"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

function sanitizeNext(nextValue: string | null): string {
  if (!nextValue) return "/dashboard"
  if (!nextValue.startsWith("/")) return "/dashboard"
  return nextValue
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Confirmando acceso...")

  const nextPath = useMemo(() => sanitizeNext(searchParams.get("next")), [searchParams])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        const errorDescription = searchParams.get("error_description")
        if (errorDescription) {
          throw new Error(errorDescription)
        }

        const code = searchParams.get("code")
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          const { data } = await supabase.auth.getSession()
          if (!data.session) {
            throw new Error("No se pudo completar el acceso con Google.")
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) throw new Error("No se pudo recuperar la sesión de tu cuenta.")

        try {
          const raw = localStorage.getItem("operaly_register_auth")
          const parsed = raw ? JSON.parse(raw) : {}
          localStorage.setItem(
            "operaly_register_auth",
            JSON.stringify({
              ...parsed,
              email: user.email ?? parsed?.email ?? undefined,
              authUserId: user.id,
              method: parsed?.method || "google",
            })
          )
        } catch {
          // best-effort only
        }

        if (mounted) {
          setMessage("Acceso confirmado. Redirigiendo...")
          router.replace(nextPath)
        }
      } catch (err: any) {
        console.error("[auth/callback]", err)
        if (mounted) {
          setMessage(err?.message || "No se pudo completar el acceso.")
          setTimeout(() => {
            router.replace("/register")
          }, 1200)
        }
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [nextPath, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#E6EDF7] bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#DCE5F2] border-t-[#3B82F6]" />
        <h1 className="text-2xl font-bold text-[#132B73] mb-2">Conectando tu cuenta</h1>
        <p className="text-[#5F6B7A]">{message}</p>
      </div>
    </div>
  )
}
