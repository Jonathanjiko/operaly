"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate submission
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#3B82F6]/10 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
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

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-10">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#0F1F63] mb-2">
                  Recuperar contraseña
                </h1>
                <p className="text-muted-foreground">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white font-semibold"
                >
                  Enviar enlace de recuperación
                </Button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#0F1F63] mb-2">
                Revisa tu email
              </h1>
              <p className="text-muted-foreground mb-6">
                Hemos enviado un enlace de recuperación a <strong className="text-foreground">{email}</strong>. 
                Por favor revisa tu bandeja de entrada.
              </p>
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el email? Revisa tu carpeta de spam o{" "}
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-[#3B82F6] font-medium hover:underline"
                >
                  intenta de nuevo
                </button>
              </p>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
