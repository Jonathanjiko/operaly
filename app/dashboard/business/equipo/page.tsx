"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, MoreHorizontal, Mail, Shield, 
  ShieldCheck, User, Trash2, Edit, Clock
} from "lucide-react"

const teamMembers = [
  { 
    id: 1, 
    name: "Roberto Sánchez",
    email: "roberto@empresa.com",
    role: "owner",
    avatar: "RS",
    status: "active",
    lastActive: "Ahora",
    conversations: 156,
    sales: 45
  },
  { 
    id: 2, 
    name: "María López",
    email: "maria@empresa.com",
    role: "sales",
    avatar: "ML",
    status: "active",
    lastActive: "Hace 10 min",
    conversations: 89,
    sales: 23
  },
  { 
    id: 3, 
    name: "Carlos García",
    email: "carlos@empresa.com",
    role: "sales",
    avatar: "CG",
    status: "active",
    lastActive: "Hace 1h",
    conversations: 67,
    sales: 18
  },
  { 
    id: 4, 
    name: "Ana Martínez",
    email: "ana@empresa.com",
    role: "sales",
    avatar: "AM",
    status: "pending",
    lastActive: "Invitación enviada",
    conversations: 0,
    sales: 0
  },
]

const roleConfig = {
  owner: { label: "Propietario", color: "#7C3AED", icon: ShieldCheck },
  sales: { label: "Agente de ventas", color: "#3B82F6", icon: Shield },
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Equipo</h1>
          <p className="text-muted-foreground">Gestiona los miembros de tu equipo</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] hover:opacity-90 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invitar miembro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total miembros", value: "4", color: "#3B82F6" },
          { label: "Activos ahora", value: "3", color: "#34D399" },
          { label: "Conversaciones hoy", value: "312", color: "#7C3AED" },
          { label: "Ventas del mes", value: "86", color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
            <p className="text-2xl font-bold text-[#0F1F63]">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar miembros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl"
        />
      </div>

      {/* Team members */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Miembro</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Rol</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Conversaciones</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Ventas</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => {
              const role = roleConfig[member.role as keyof typeof roleConfig]
              const RoleIcon = role.icon

              return (
                <tr key={member.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center text-white font-semibold text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F1F63]">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${role.color}15`, color: role.color }}
                    >
                      <RoleIcon className="w-3.5 h-3.5" />
                      {role.label}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground hidden lg:table-cell">{member.conversations}</td>
                  <td className="p-4 text-sm text-foreground hidden lg:table-cell">{member.sales}</td>
                  <td className="p-4">
                    {member.status === "active" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#34D399]" />
                        <span className="text-sm text-muted-foreground">{member.lastActive}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      {member.role !== "owner" && (
                        <>
                          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </>
                      )}
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

      {/* Permissions info */}
      <div className="bg-[#3B82F6]/5 rounded-2xl border border-[#3B82F6]/20 p-6">
        <h3 className="font-semibold text-[#0F1F63] mb-4">Permisos por rol</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
              <span className="font-medium text-[#7C3AED]">Propietario</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Acceso completo a todas las funciones</li>
              <li>Gestión de equipo y permisos</li>
              <li>Configuración de facturación</li>
              <li>Integraciones y API</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#3B82F6]" />
              <span className="font-medium text-[#3B82F6]">Agente de ventas</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Gestión de conversaciones</li>
              <li>Acceso al CRM y pipeline</li>
              <li>Gestión de clientes y pedidos</li>
              <li>Sin acceso a facturación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
