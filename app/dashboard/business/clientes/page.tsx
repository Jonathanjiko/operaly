"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, Filter, User, Phone, Mail, 
  MessageSquare, Calendar, MoreHorizontal, Tag,
  DollarSign, ShoppingBag
} from "lucide-react"

const clients = [
  { 
    id: 1, 
    name: "María García",
    email: "maria@email.com",
    phone: "+51 999 111 222",
    source: "WhatsApp",
    totalPurchases: 4500,
    lastOrder: "12 Mar 2026",
    tags: ["VIP", "Frecuente"],
    avatar: "MG"
  },
  { 
    id: 2, 
    name: "Carlos López",
    email: "carlos@email.com",
    phone: "+51 999 333 444",
    source: "Instagram",
    totalPurchases: 2800,
    lastOrder: "10 Mar 2026",
    tags: ["Nuevo"],
    avatar: "CL"
  },
  { 
    id: 3, 
    name: "Ana Martínez",
    email: "ana@email.com",
    phone: "+51 999 555 666",
    source: "WhatsApp",
    totalPurchases: 1200,
    lastOrder: "8 Mar 2026",
    tags: ["Frecuente"],
    avatar: "AM"
  },
  { 
    id: 4, 
    name: "Pedro Sánchez",
    email: "pedro@email.com",
    phone: "+51 999 777 888",
    source: "Facebook",
    totalPurchases: 3600,
    lastOrder: "5 Mar 2026",
    tags: ["VIP"],
    avatar: "PS"
  },
  { 
    id: 5, 
    name: "Laura Ruiz",
    email: "laura@email.com",
    phone: "+51 999 999 000",
    source: "WhatsApp",
    totalPurchases: 950,
    lastOrder: "1 Mar 2026",
    tags: [],
    avatar: "LR"
  },
]

const sourceIcons = {
  WhatsApp: { bg: "bg-[#25D366]", text: "W" },
  Instagram: { bg: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]", text: "I" },
  Facebook: { bg: "bg-[#1877F2]", text: "F" },
}

const tagColors = {
  VIP: { bg: "bg-[#7C3AED]/10", text: "text-[#7C3AED]" },
  Frecuente: { bg: "bg-[#34D399]/10", text: "text-[#34D399]" },
  Nuevo: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]" },
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredClients = clients.filter(client => {
    if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !client.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedTag && !client.tags.includes(selectedTag)) return false
    return true
  })

  const totalClients = clients.length
  const vipClients = clients.filter(c => c.tags.includes("VIP")).length
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalPurchases, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total clientes", value: totalClients.toString(), icon: User, color: "#3B82F6" },
          { label: "Clientes VIP", value: vipClients.toString(), icon: Tag, color: "#7C3AED" },
          { label: "Ingresos totales", value: `S/ ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#34D399" },
          { label: "Pedidos del mes", value: "86", icon: ShoppingBag, color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1F63]">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {[null, "VIP", "Frecuente", "Nuevo"].map((tag) => (
            <button
              key={tag || "all"}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedTag === tag 
                  ? "bg-[#34D399] text-white" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {tag || "Todos"}
            </button>
          ))}
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Contacto</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Origen</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total compras</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Tags</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => {
              const source = sourceIcons[client.source as keyof typeof sourceIcons]

              return (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center text-white font-semibold text-sm">
                        {client.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F1F63]">{client.name}</p>
                        <p className="text-sm text-muted-foreground hidden sm:block">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className={`w-6 h-6 rounded-full ${source.bg} flex items-center justify-center text-white text-xs font-bold`}>
                      {source.text}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-[#047857]">S/ {client.totalPurchases.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{client.lastOrder}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex gap-1">
                      {client.tags.map((tag) => {
                        const colors = tagColors[tag as keyof typeof tagColors]
                        return (
                          <span 
                            key={tag}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors?.bg} ${colors?.text}`}
                          >
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
