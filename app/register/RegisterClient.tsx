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

  const handleOAuth = async (provider: "google" | "facebook") => {
    try {
      const redirectTo = `${window.location.origin}/register/setup?plan=${planCode}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
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
              className="w-full h-14 rounded-2xl text-base"
              onClick={() => handleOAuth("google")}
            >
              Continuar con Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 rounded-2xl text-base"
              onClick={() => handleOAuth("facebook")}
            >
              Continuar con Facebook
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
