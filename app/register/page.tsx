"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getPlanByCode, type OperalyPlanCode } from "@/lib/plans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const accountType = (searchParams.get("type") as "assistant" | "seller") || "assistant"
  const initialPlan = (searchParams.get("plan") as OperalyPlanCode | null) || "trial"

  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("PE")
  const [businessType, setBusinessType] = useState("")
  const [password, setPassword] = useState("")
  const [planCode, setPlanCode] = useState<OperalyPlanCode>(initialPlan)

  const plan = useMemo(() => getPlanByCode(planCode), [planCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 🔹 1. CREAR USUARIO AUTH
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 🔹 2. LLAMAR RPC (TU FUNCIÓN REAL)
      const { data, error } = await supabase.rpc("operaly_provision_signup", {
        p_full_name: `${firstName} ${lastName}`,
        p_whatsapp_phone: phone,
        p_country_code: country,
        p_profession_code: businessType,
        p_plan_code: planCode,
        p_activate_now: planCode === "trial",
      })

      if (error) throw error

      // 🔹 guardar info temporal
      localStorage.setItem("operaly_client_id", data.client_id)
      localStorage.setItem("operaly_account_type", accountType)

      // 🔹 3. REDIRECCIÓN
      if (planCode === "trial") {
        router.push("/onboarding")
      } else {
        router.push(`/iniciar-pago?plan=${planCode}&cid=${data.client_id}`)
      }
    } catch (err: any) {
      alert(err.message || "Error en registro")
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    email &&
    password.length >= 6 &&
    firstName &&
    lastName &&
    phone &&
    country &&
    businessType

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="max-w-xl w-full space-y-4">

        <h1 className="text-2xl font-bold">
          Registro Operaly ({accountType})
        </h1>

        <Input placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Teléfono WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="País (PE, MX...)" value={country} onChange={(e) => setCountry(e.target.value)} />
        <Input placeholder="Profesión / rubro" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button disabled={!isValid || loading} className="w-full">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
    </div>
  )
}
