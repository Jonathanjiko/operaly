"use client"

import { 
  BarChart3, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  { 
    label: "Clientes activos", 
    value: "47", 
    change: "+12%", 
    trend: "up",
    icon: Users,
    color: "text-[#3B82F6]",
    bgColor: "bg-[#3B82F6]/10"
  },
  { 
    label: "Casos este mes", 
    value: "23", 
    change: "+8%", 
    trend: "up",
    icon: FileText,
    color: "text-[#7C3AED]",
    bgColor: "bg-[#7C3AED]/10"
  },
  { 
    label: "Tareas completadas", 
    value: "89", 
    change: "+24%", 
    trend: "up",
    icon: CheckCircle2,
    color: "text-[#34D399]",
    bgColor: "bg-[#34D399]/10"
  },
  { 
    label: "Horas facturadas", 
    value: "156", 
    change: "-3%", 
    trend: "down",
    icon: Clock,
    color: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10"
  },
]

const monthlyData = [
  { month: "Ene", clientes: 32, casos: 15, tareas: 67 },
  { month: "Feb", clientes: 35, casos: 18, tareas: 72 },
  { month: "Mar", clientes: 38, casos: 21, tareas: 78 },
  { month: "Abr", clientes: 42, casos: 19, tareas: 85 },
  { month: "May", clientes: 45, casos: 22, tareas: 82 },
  { month: "Jun", clientes: 47, casos: 23, tareas: 89 },
]

const sofiaInsights = [
  {
    type: "recommendation",
    message: "Tienes 5 clientes que no han sido contactados en más de 30 días. ¿Quieres que les envíe un mensaje de seguimiento?",
  },
  {
    type: "alert",
    message: "El caso de María López tiene una fecha límite en 3 días y aún hay 2 tareas pendientes.",
  },
  {
    type: "insight",
    message: "Tu productividad ha aumentado un 24% este mes comparado con el anterior. ¡Excelente trabajo!",
  },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F63]">Analíticas</h1>
        <p className="text-muted-foreground">Métricas y rendimiento de tu práctica profesional</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#0F1F63] mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === "up" ? "text-[#34D399]" : "text-red-500"}`}>
                    {stat.trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {stat.change} vs mes anterior
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0F1F63]">Actividad mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div 
                      className="w-full bg-[#3B82F6] rounded-t"
                      style={{ height: `${data.clientes * 2}px` }}
                    />
                    <div 
                      className="w-full bg-[#7C3AED]"
                      style={{ height: `${data.casos * 3}px` }}
                    />
                    <div 
                      className="w-full bg-[#34D399] rounded-b"
                      style={{ height: `${data.tareas}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                <span className="text-sm text-muted-foreground">Clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7C3AED]" />
                <span className="text-sm text-muted-foreground">Casos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#34D399]" />
                <span className="text-sm text-muted-foreground">Tareas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sofia Insights */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0F1F63] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              Insights de Sofía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sofiaInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl text-sm ${
                  insight.type === "recommendation" 
                    ? "bg-[#3B82F6]/10 border border-[#3B82F6]/20" 
                    : insight.type === "alert"
                    ? "bg-[#F59E0B]/10 border border-[#F59E0B]/20"
                    : "bg-[#34D399]/10 border border-[#34D399]/20"
                }`}
              >
                {insight.message}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0F1F63] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#34D399]" />
            Resumen de rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-secondary/30">
              <p className="text-4xl font-bold text-[#3B82F6]">94%</p>
              <p className="text-sm text-muted-foreground mt-2">Tasa de retención de clientes</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-secondary/30">
              <p className="text-4xl font-bold text-[#7C3AED]">4.2h</p>
              <p className="text-sm text-muted-foreground mt-2">Tiempo promedio por caso</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-secondary/30">
              <p className="text-4xl font-bold text-[#34D399]">98%</p>
              <p className="text-sm text-muted-foreground mt-2">Satisfacción de clientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
