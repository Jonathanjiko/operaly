"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const passwordRulesOk = useMemo(() => {
    return password.trim().length >= 8
  }, [password])

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        const currentUrl = new URL(window.location.href)
        const code = currentUrl.searchParams.get("code")
        const type = currentUrl.searchParams.get("type")

        if (code && type === "recovery") {
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            throw error
          }

          window.history.replaceState({}, "", "/reset-password")
        }

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

        if (data.session) {
          setSessionReady(true)
          return
        }

        const hash = window.location.hash || ""
        const hasRecoveryTokens =
          hash.includes("access_token=") || hash.includes("type=recovery")

        if (hasRecoveryTokens) {
          setSessionReady(true)
          return
        }

        setErrorMessage(
          "El enlace de recuperación no es válido o expiró. Solicita uno nuevo."
        )
      } catch (error: any) {
        if (mounted) {
          setErrorMessage(
            error?.message || "No se pudo validar el enlace de recuperación."
          )
        }
      }
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!sessionReady) {
      setErrorMessage("Primero valida el enlace de recuperación.")
      return
    }

    if (!passwordRulesOk) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.")
      return
    }

    setSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      })

      if (error) {
        throw error
      }

      setSuccessMessage(
        "Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión."
      )
      setPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setErrorMessage(
        error?.message || "No se pudo actualizar la contraseña."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={170}
            height={54}
            priority
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Cambio seguro de contraseña
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-3">
              Define tu nueva contraseña
            </h1>

            <p className="text-slate-600 text-[15px] leading-7 mb-8">
              Estás en la página segura de Operaly para actualizar el acceso de tu
              cuenta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="h-12 rounded-xl pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="h-12 rounded-xl pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm text-emerald-700">{successMessage}</p>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={submitting || !sessionReady}
                className="h-12 rounded-xl bg-[#0F1F63] hover:bg-[#12297f] text-white px-6"
              >
                {submitting ? "Actualizando..." : "Guardar nueva contraseña"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Solicitar otro enlace
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                Volver al login
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">
              Recomendaciones
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Usa una contraseña robusta
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Combina letras, números y símbolos para proteger mejor tu cuenta.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Haz el cambio en el mismo navegador
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Abre el enlace del correo en el mismo navegador donde usarás el
                  formulario para evitar problemas con la sesión de recuperación.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Si el enlace expiró
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Vuelve a solicitar uno nuevo desde la página de recuperación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
