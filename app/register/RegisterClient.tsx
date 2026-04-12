"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getPlanByCode, type OperalyPlanCode } from "@/lib/plans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPlan = (searchParams.get("plan") as OperalyPlanCode | null) || "trial"
  const [planCode] = useState<OperalyPlanCode>(initialPlan)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedPlan = useMemo(() => getPlanByCode(planCode), [planCode])

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: "assistant",
            selected_plan: planCode,
          },
        },
      })

      if (error) throw error

      localStorage.setItem(
        "operaly_register_auth",
        JSON.stringify({
          email,
          planCode,
          authUserId: data.user?.id || null,
          method: "email",
        })
      )

      router.push(`/register/setup?plan=${planCode}`)
    } catch (err: any) {
      alert(err.message || "No pudimos crear tu cuenta.")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: "google") => {
    try {
      localStorage.setItem(
        "operaly_register_auth",
        JSON.stringify({
          planCode,
          method: provider,
        })
      )

      const callbackUrl = new URL("/auth/callback", window.location.origin)
      callbackUrl.searchParams.set("next", `/register/setup?plan=${planCode}`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
      if (!data?.url) throw new Error("No se pudo iniciar el acceso social.")
    } catch (err: any) {
      alert(err.message || "No se pudo iniciar el acceso social.")
    }
  }

  const isValid = email.trim().length > 0 && password.trim().length >= 6

  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={56}
              height={56}
              className="mb-8"
            />

            <h1 className="text-4xl font-bold text-[#132B73] mb-3">
              Crea tu cuenta
            </h1>

            <p className="text-[#5F6B7A] text-lg">
              {selectedPlan?.code === "trial"
                ? "Empieza tu prueba gratuita y configura Operaly a tu medida."
                : `Vas a registrarte con el plan ${selectedPlan?.name}. Primero creamos tu cuenta.`}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 rounded-2xl text-base flex items-center justify-center gap-3"
              onClick={() => handleOAuth("google")}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </Button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D9E1EC]" />
            </div>
            <div className="relative flex justify-center text-sm uppercase tracking-wide">
              <span className="bg-[#F7F9FC] px-4 text-[#7A8493]">O regístrate con email</span>
            </div>
          </div>

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#132B73] mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl border-[#D9E1EC] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#132B73] mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="Crea una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl border-[#D9E1EC] bg-white"
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-14 rounded-2xl text-base bg-gradient-to-r from-[#3B82F6] to-[#22C7E5] hover:opacity-90"
            >
              {loading ? "Creando cuenta..." : "Continuar"}
            </Button>
          </form>

          <p className="text-sm text-[#7A8493] mt-6">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-[#3B82F6] font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#132B73] via-[#173A8E] to-[#0F2259] p-10">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-4">
            Un asistente que se adapta a tu forma de trabajar
          </h2>
          <p className="text-white/75 text-lg leading-8">
            Primero creamos tu acceso. Luego te haremos unas preguntas rápidas para personalizar Operaly según tu profesión, país, idioma y número principal.
          </p>
        </div>
      </div>
    </div>
  )
}
