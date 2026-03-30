"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const passwordIsValid = useMemo(() => password.trim().length >= 8, [password])

  useEffect(() => {
    let mounted = true

    const bootstrapRecovery = async () => {
      try {
        const hash = typeof window !== "undefined" ? window.location.hash : ""

        const hasRecoveryTokens =
          hash.includes("access_token=") ||
          hash.includes("refresh_token=") ||
          hash.includes("type=recovery")

        if (hasRecoveryTokens) {
          const fragment = new URLSearchParams(hash.replace(/^#/, ""))
          const accessToken = fragment.get("access_token")
          const refreshToken = fragment.get("refresh_token")

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              throw error
            }

            window.history.replaceState({}, "", "/reset-password")
          }
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
        } else {
          setErrorMessage(
            "El enlace de recuperación no es válido o expiró. Solicita uno nuevo."
          )
        }
      } catch (err: any) {
        if (mounted) {
          setErrorMessage(
            err?.message || "No se pudo validar el enlace de recuperación."
          )
        }
      } finally {
        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    bootstrapRecovery()

    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionReady) {
      setErrorMessage("El enlace de recuperación no está activo.")
      return
    }

    if (!passwordIsValid) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      })

      if (error) {
        throw error
      }

      setSuccess(true)

      setTimeout(() => {
        router.push("/login")
      }, 1800)
    } catch (err: any) {
      setErrorMessage(err?.message || "No se pudo actualizar la contraseña.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#3B82F6]/10 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={160}
              height={160}
              className="h-14 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-10">
          {checkingSession ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 mb-5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Validando enlace seguro
              </div>

              <h1 className="text-2xl font-bold text-[#0F1F63] mb-2">
                Preparando cambio de contraseña
              </h1>
              <p className="text-muted-foreground">
                Estamos validando tu enlace de recuperación...
              </p>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-[#0F1F63] mb-2">
                Contraseña actualizada
              </h1>

              <p className="text-muted-foreground mb-6">
                Tu nueva contraseña se guardó correctamente. Te llevaremos al login.
              </p>

              <Button
                onClick={() => router.push("/login")}
                className="h-12 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white font-semibold"
              >
                Ir al login
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 mb-5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cambio seguro de acceso
                </div>

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] mb-6">
                  <Lock className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-[#0F1F63] mb-2">
                  Define tu nueva contraseña
                </h1>
                <p className="text-muted-foreground">
                  Estás en la página segura de Operaly para actualizar el acceso de tu cuenta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nueva contraseña
                  </label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="h-12 rounded-xl pr-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirma tu contraseña
                  </label>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="h-12 rounded-xl pr-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <p className="text-sm text-muted-foreground">
                    Recomendación:
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    <li>• Usa al menos 8 caracteres.</li>
                    <li>• Combina letras, números y símbolos si quieres mayor seguridad.</li>
                    <li>• Guarda esta contraseña en un lugar seguro.</li>
                  </ul>
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white font-semibold"
                >
                  {loading ? "Actualizando..." : "Guardar nueva contraseña"}
                </Button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-col gap-3">
              <Link
                href="/forgot-password"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Solicitar otro enlace
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
