"use client"

import { 
  MessageSquare, Users, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, ShoppingBag, Clock,
  Sparkles
} from "lucide-react"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts"

const conversationData = [
  { name: "Lun", sofia: 120, manual: 15 },
  { name: "Mar", sofia: 145, manual: 18 },
  { name: "Mié", sofia: 132, manual: 12 },
  { name: "Jue", sofia: 168, manual: 20 },
  { name: "Vie", sofia: 195, manual: 22 },
  { name: "Sáb", sofia: 210, manual: 8 },
  { name: "Dom", sofia: 85, manual: 5 },
]

const revenueData = [
  { name: "Semana 1", revenue: 12500 },
  { name: "Semana 2", revenue: 15800 },
  { name: "Semana 3", revenue: 18200 },
  { name: "Semana 4", revenue: 21500 },
]

const sourceData = [
  { name: "WhatsApp", value: 65, color: "#25D366" },
  { name: "Instagram", value: 25, color: "#E1306C" },
  { name: "Facebook", value: 10, color: "#1877F2" },
]

const stats = [
  { 
    label: "Conversaciones totales", 
    value: "1,245", 
    change: "+23%", 
    trend: "up",
    icon: MessageSquare,
    color: "#3B82F6"
  },
  { 
    label: "Clientes nuevos", 
    value: "89", 
    change: "+12%", 
    trend: "up",
    icon: Users,
    color: "#7C3AED"
  },
  { 
    label: "Ingresos del mes", 
    value: "S/ 68,000", 
    change: "+18%", 
    trend: "up",
    icon: DollarSign,
    color: "#34D399"
  },
  { 
    label: "Tasa de conversión", 
    value: "32%", 
    change: "-2%", 
    trend: "down",
    icon: TrendingUp,
    color: "#F59E0B"
  },
]

const topProducts = [
  { name: "Servicio Premium", sales: 45, revenue: 22500 },
  { name: "Pack Mensual", sales: 32, revenue: 12800 },
  { name: "Consulta Básica", sales: 28, revenue: 5600 },
  { name: "Tratamiento VIP", sales: 18, revenue: 14400 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F63]">Analíticas</h1>
        <p className="text-muted-foreground">Métricas y rendimiento de tu negocio</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-[#34D399]" : "text-[#EF4444]"
              }`}>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#0F1F63]">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversations chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#0F1F63]">Conversaciones</h3>
              <p className="text-sm text-muted-foreground">Última semana</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#34D399]" />
                Sofía
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                Manual
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip />
                <Bar dataKey="sofia" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="manual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#0F1F63]">Ingresos</h3>
              <p className="text-sm text-muted-foreground">Este mes</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip formatter={(value) => [`S/ ${value.toLocaleString()}`, "Ingresos"]} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#34D399" 
                  strokeWidth={3}
                  dot={{ fill: "#34D399", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Source distribution */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-[#0F1F63] mb-6">Por canal</h3>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {sourceData.map((item) => (
              <span key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value}%)
              </span>
            ))}
          </div>
        </div>

        {/* Sofia performance */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F1F63]">Sofía</h3>
              <p className="text-sm text-muted-foreground">Rendimiento de IA</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Respuestas automáticas", value: "94%", desc: "Sin intervención humana" },
              { label: "Tiempo promedio", value: "< 30s", desc: "Primera respuesta" },
              { label: "Satisfacción", value: "4.8/5", desc: "Calificación de clientes" },
              { label: "Leads capturados", value: "127", desc: "Este mes" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-[#0F1F63]">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.desc}</p>
                </div>
                <span className="text-lg font-bold text-[#047857]">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-[#0F1F63] mb-6">Top productos</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-[#0F1F63]">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} ventas</p>
                  </div>
                </div>
                <span className="font-bold text-[#047857]">S/ {product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
