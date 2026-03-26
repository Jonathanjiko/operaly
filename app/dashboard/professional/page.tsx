"use client"

import { useEffect, useMemo, useState } from "react"
import {
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

type DashboardProfile = {
  fullName: string
  profession: string
  planCode: string
  countryCode: string
  city: string
  phone: string
  phoneNormalized: string
  preferredLanguage: string
}

export default function ProfessionalDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<DashboardProfile | null>(null)

  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error

        const user = data.user
        if (!user) return

        const meta = user.user_metadata || {}
        const clientId = meta.client_id || localStorage.getItem("operaly_client_id")

        let client: any = null

        if (clientId) {
          const { data: clientData } = await supabase
            .from("clients")
            .select("id, name, phone, phone_normalized, profession_code, country_code, city, preferred_language")
            .eq("id", clientId)
            .single()

          client = clientData
        }

        setProfile({
          fullName: client?.name || meta.full_name || "Tu cuenta",
          profession: client?.profession_code || meta.profession_code || "No definido",
          planCode: meta.selected_plan || "trial",
          countryCode: client?.country_code || meta.country_code || "No definido",
          city: client?.city || meta.city || "No definida",
          phone: client?.phone || meta.phone || "No definido",
          phoneNormalized: client?.phone_normalized || meta.phone_normalized || "No definido",
          preferredLanguage:
            client?.preferred_language || meta.preferred_language || "es",
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const statCards = useMemo(() => {
    return [
      {
        label: "Plan",
        value: profile?.planCode || "-",
        icon: Sparkles,
        color: "#3B82F6",
        change: "Cuenta activa",
      },
      {
        label: "Profesión",
        value: profile?.profession || "-",
        icon: Users,
        color: "#06B6D4",
        change: "Perfil configurado",
      },
      {
        label: "Ubicación",
        value: profile?.countryCode || "-",
        icon: Calendar,
        color: "#F59E0B",
        change: profile?.city || "Sin ciudad",
      },
      {
        label: "Idioma",
        value: profile?.preferredLanguage || "-",
        icon: FileText,
        color: "#7C3AED",
        change: "Idioma por defecto",
      },
    ]
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">
            {greeting}, {profile?.fullName || "Tu cuenta"}
          </h1>

          <p className="text-muted-foreground mt-1">
            Aquí está el resumen de tu cuenta Assistant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/professional/agenda">
            <Button variant="outline" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Nueva cita
            </Button>
          </Link>

          <Link href="/dashboard/professional/documentos">
            <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90">
              <FileText className="w-4 h-4 mr-2" />
              Subir documento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>

              <TrendingUp className="w-4 h-4 text-[#34D399]" />
            </div>

            <p className="text-3xl font-bold text-[#0F1F63]">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-[#34D399] mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 rounded-2xl border border-[#7C3AED]/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <h3 className="font-semibold text-[#0F1F63]">Resumen de tu perfil</h3>
            <p className="text-sm text-muted-foreground">Datos conectados desde tu registro real</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-foreground">
                Número registrado: {profile?.phone || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-foreground">
                Número normalizado: {profile?.phoneNormalized || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm text-foreground">
                Ubicación: {profile?.countryCode || "-"} · {profile?.city || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Pendientes para hoy</h3>
            <Link href="/dashboard/professional/tareas">
              <Button variant="ghost" size="sm" className="text-[#3B82F6]">
                Ver tablero
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Revisar tu configuración inicial</p>
                <p className="text-sm text-muted-foreground">Deja listo el entorno de Assistant</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Hoy
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Subir tus primeros documentos</p>
                <p className="text-sm text-muted-foreground">Activa el análisis documental</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Esta semana
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
              <div className="w-3 h-3 rounded-full bg-[#34D399]" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Configurar agenda y tareas</p>
                <p className="text-sm text-muted-foreground">Prepara tu espacio de trabajo</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Próximo paso
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F1F63]">Accesos rápidos</h3>
          </div>

          <div className="space-y-4">
            <Link href="/dashboard/professional/documentos" className="block">
              <div className="p-4 rounded-xl border border-border hover:bg-secondary/40 transition-colors">
                <p className="font-medium text-[#0F1F63]">Documentos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube, revisa y organiza tus archivos
                </p>
              </div>
            </Link>

            <Link href="/dashboard/professional/agenda" className="block">
              <div className="p-4 rounded-xl border border-border hover:bg-secondary/40 transition-colors">
                <p className="font-medium text-[#0F1F63]">Agenda</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualiza tus citas en formato calendario
                </p>
              </div>
            </Link>

            <Link href="/dashboard/professional/tareas" className="block">
              <div className="p-4 rounded-xl border border-border hover:bg-secondary/40 transition-colors">
                <p className="font-medium text-[#0F1F63]">Pendientes</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Trabaja tus tareas como tablero de control
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F1F63]">Documentos recientes</h3>
          <Link href="/dashboard/professional/documentos">
            <Button variant="ghost" size="sm" className="text-[#3B82F6]">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-dashed border-[#D9E1EC] p-10 text-center">
          <p className="text-[#0F1F63] font-medium">Todavía no hemos conectado tus documentos reales aquí.</p>
          <p className="text-sm text-muted-foreground mt-2">
            El diseño ya queda sobre la línea professional de v0. En el siguiente bloque conectamos las tablas reales de documentos, agenda y tareas.
          </p>
        </div>
      </div>
    </div>
  )
}
