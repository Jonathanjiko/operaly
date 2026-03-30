"use client"

import { FormEvent, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const resetRedirectUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return ""
    }

    return `${window.location.origin}/reset-password`
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setErrorMessage("Ingresa tu correo electrónico.")
      setSuccessMessage("")
      return
    }

    setSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: resetRedirectUrl,
        }
      )

      if (error) {
        throw error
      }

      setSuccessMessage(
        "Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo y abre el enlace en este mismo navegador."
      )
    } catch (error: any) {
      setErrorMessage(
        error?.message || "No se pudo enviar el correo de recuperación."
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
              Recuperación segura de acceso
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-3">
              Recupera tu contraseña
            </h1>

            <p className="text-slate-600 text-[15px] leading-7 mb-8">
              Ingresa el correo de tu cuenta y te enviaremos un enlace seguro para
              definir una nueva contraseña en Operaly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="h-12 rounded-xl pl-10"
                    autoComplete="email"
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
                disabled={submitting}
                className="h-12 rounded-xl bg-[#0F1F63] hover:bg-[#12297f] text-white px-6"
              >
                {submitting ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>

            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">
              Qué pasará después
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  1. Recibirás un enlace seguro
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  El enlace te abrirá una página segura de Operaly para definir una
                  nueva contraseña.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  2. Crearás tu nueva clave
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Solo necesitarás escribir la nueva contraseña y confirmarla.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  3. Entrarás de nuevo a tu cuenta
                </p>
                <p className="text-sm text-slate-600 leading-6">
                  Cuando el cambio se complete, podrás iniciar sesión normalmente
                  con la nueva contraseña.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
