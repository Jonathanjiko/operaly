"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react"
import { OPERLAY_PLANS, getPlanByCode, type OperalyPlanCode } from "@/lib/plans"

type SignupDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  country: string
  businessType: string
  password: string
  planCode: OperalyPlanCode
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = (searchParams.get("plan") as OperalyPlanCode | null) || "trial"

  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [country, setCountry] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [password, setPassword] = useState("")
  const [planCode, setPlanCode] = useState<OperalyPlanCode>(
    getPlanByCode(initialPlan)?.code || "trial"
  )

  const selectedPlan = useMemo(() => getPlanByCode(planCode), [planCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: SignupDraft = {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      country,
      businessType,
      password,
      planCode,
    }

    localStorage.setItem("operaly_pending_signup", JSON.stringify(payload))

    if (planCode === "trial") {
      router.push("/onboarding?plan=trial")
      return
    }

    router.push(`/iniciar-pago?plan=${planCode}`)
  }

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    country.trim().length > 0 &&
    businessType.trim().length > 0

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <Link href="/" className="inline-block mb-12">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={160}
              height={160}
              className="h-12 w-auto"
            />
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#0F1F63] mb-3">
              Crea tu cuenta en Operaly
            </h1>
            <p className="text-muted-foreground">
              Completa tus datos, elige tu plan y continúa con tu activación.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan elegido
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                {OPERLAY_PLANS.map((plan) => {
                  const active = plan.code === planCode
                  return (
                    <button
                      key={plan.code}
                      type="button"
                      onClick={() => setPlanCode(plan.code)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-[#3B82F6] bg-[#3B82F6]/5"
                          : "border-border bg-card hover:border-[#3B82F6]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#0F1F63]">{plan.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {plan.currency} {plan.price}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedPlan && (
              <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm">
                <span className="font-medium text-[#0F1F63]">Resumen:</span>{" "}
                Estás registrándote con el plan <strong>{selectedPlan.name}</strong>.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellido
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teléfono
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Empresa o marca
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nombre comercial"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  País
                </label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Perú"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de negocio o perfil
                </label>
                <Input
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Restaurante, abogado, consultor..."
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña"
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white font-semibold disabled:opacity-50"
            >
              {planCode === "trial" ? "Continuar con trial" : "Continuar al pago"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-2">
              {[
                "Planes oficiales alineados con backend",
                "Registro completo del usuario",
                "Flujo separado entre trial y pago",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[#34D399]" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-[#3B82F6] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#0F1F63] via-[#1a2d7c] to-[#0F1F63] relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#3B82F6]/30 to-[#06B6D4]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-[#7C3AED]/30 to-[#3B82F6]/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-[#34D399]/20 to-[#06B6D4]/20 rounded-full blur-2xl" />

        <div className="relative z-10 text-center px-12">
          <div className="mb-8">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={120}
              height={120}
              className="w-24 h-24 mx-auto brightness-0 invert opacity-90"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Registro unificado
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            Un solo flujo de alta para Trial, Core, Pro y Pro Plus.
          </p>
        </div>
      </div>
    </div>
  )
}
