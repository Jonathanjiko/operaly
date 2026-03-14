"use client"

import { Button } from "@/components/ui/button"
import { 
  CreditCard, Download, Check, ArrowRight, Calendar, 
  MessageSquare, HardDrive, Users, Zap
} from "lucide-react"

const currentPlan = {
  name: "Business Pro",
  price: 79,
  period: "mes",
  renewDate: "14 Abril 2026"
}

const usage = [
  { label: "Conversaciones", used: 1240, limit: 2000, icon: MessageSquare },
  { label: "Almacenamiento", used: 4.2, limit: 10, unit: "GB", icon: HardDrive },
  { label: "Miembros del equipo", used: 3, limit: 5, icon: Users },
]

const invoices = [
  { id: "INV-2026-003", date: "1 Mar 2026", amount: 79, status: "paid" },
  { id: "INV-2026-002", date: "1 Feb 2026", amount: 79, status: "paid" },
  { id: "INV-2026-001", date: "1 Ene 2026", amount: 79, status: "paid" },
  { id: "INV-2025-012", date: "1 Dic 2025", amount: 79, status: "paid" },
]

const addOns = [
  { id: "conversations", name: "+2000 conversaciones", price: 15, active: false },
  { id: "storage", name: "+10GB almacenamiento", price: 10, active: false },
  { id: "audio", name: "+60 min audio IA", price: 20, active: true },
  { id: "social", name: "Redes sociales", price: 25, active: true },
  { id: "staff", name: "Usuario extra", price: 15, active: false },
]

const upcomingFeatures = [
  { name: "Libro de Reclamaciones", price: 15 },
  { name: "Facturación Electrónica", price: 25 },
]

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F63]">Facturación</h1>
        <p className="text-muted-foreground">Gestiona tu suscripción y pagos</p>
      </div>

      {/* Current plan */}
      <div className="bg-gradient-to-r from-[#34D399]/10 via-[#06B6D4]/10 to-[#3B82F6]/10 rounded-2xl border border-[#34D399]/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34D399]/20 text-[#047857] text-sm font-medium mb-3">
              <Zap className="w-4 h-4" />
              Plan actual
            </span>
            <h2 className="text-3xl font-bold text-[#0F1F63] mb-2">{currentPlan.name}</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#047857]">S/ {currentPlan.price}</span>
              <span className="text-muted-foreground">/ {currentPlan.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Próxima renovación: {currentPlan.renewDate}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="rounded-xl">
              Cambiar plan
            </Button>
            <Button className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
              Upgrade a Growth
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Uso del mes</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {usage.map((item) => {
            const percentage = (item.used / item.limit) * 100
            const isHigh = percentage > 80

            return (
              <div key={item.label} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isHigh ? "bg-[#F59E0B]/10" : "bg-[#3B82F6]/10"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isHigh ? "text-[#F59E0B]" : "text-[#3B82F6]"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F1F63]">{item.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.used}{item.unit || ""} / {item.limit}{item.unit || ""}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isHigh ? "bg-[#F59E0B]" : "bg-[#3B82F6]"}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Add-ons</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addOns.map((addon) => (
            <div 
              key={addon.id}
              className={`bg-card rounded-2xl border p-5 ${
                addon.active ? "border-[#34D399]/30" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-[#0F1F63]">{addon.name}</h3>
                  <p className="text-lg font-bold text-[#047857]">+S/ {addon.price}/mes</p>
                </div>
                {addon.active && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34D399]/10 text-[#34D399] text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Activo
                  </span>
                )}
              </div>
              <Button 
                variant={addon.active ? "outline" : "default"}
                size="sm"
                className={`w-full rounded-xl ${
                  addon.active 
                    ? "" 
                    : "bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                }`}
              >
                {addon.active ? "Cancelar" : "Agregar"}
              </Button>
            </div>
          ))}
        </div>

        {/* Upcoming features */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {upcomingFeatures.map((feature) => (
            <div 
              key={feature.name}
              className="bg-card rounded-2xl border border-dashed border-border p-5 opacity-70"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#0F1F63]">{feature.name}</h3>
                  <p className="text-lg font-bold text-muted-foreground">+S/ {feature.price}/mes</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
                  Próximamente
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Método de pago</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-[#1A1F71] to-[#00579F] flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="font-medium text-[#0F1F63]">**** **** **** 4532</p>
              <p className="text-sm text-muted-foreground">Expira 12/2027</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl">
            Cambiar
          </Button>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F63] mb-4">Historial de facturas</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Factura</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Monto</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-[#0F1F63]">{invoice.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{invoice.date}</td>
                  <td className="p-4 font-medium text-[#0F1F63]">S/ {invoice.amount}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34D399]/10 text-[#34D399] text-xs font-medium">
                      <Check className="w-3 h-3" />
                      Pagado
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
