"use client"

import { useState } from "react"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Star,
  Tag,
  ArrowUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"

const contacts = [
  { 
    id: 1, 
    name: "María García", 
    email: "maria@email.com", 
    phone: "+51 999 111 222",
    company: "Empresa ABC",
    lastContact: "Hace 2 horas",
    tags: ["Cliente", "VIP"],
    starred: true,
    avatar: "MG"
  },
  { 
    id: 2, 
    name: "Carlos López", 
    email: "carlos@email.com", 
    phone: "+51 999 333 444",
    company: "Tech Solutions",
    lastContact: "Hace 1 día",
    tags: ["Prospecto"],
    starred: false,
    avatar: "CL"
  },
  { 
    id: 3, 
    name: "Ana Martínez", 
    email: "ana@email.com", 
    phone: "+51 999 555 666",
    company: "Consultoría XYZ",
    lastContact: "Hace 3 días",
    tags: ["Cliente"],
    starred: true,
    avatar: "AM"
  },
  { 
    id: 4, 
    name: "Pedro Sánchez", 
    email: "pedro@email.com", 
    phone: "+51 999 777 888",
    company: "Independiente",
    lastContact: "Hace 1 semana",
    tags: ["Referido"],
    starred: false,
    avatar: "PS"
  },
  { 
    id: 5, 
    name: "Laura Torres", 
    email: "laura@email.com", 
    phone: "+51 999 999 000",
    company: "StartUp Inc",
    lastContact: "Hace 2 semanas",
    tags: ["Cliente", "Inactivo"],
    starred: false,
    avatar: "LT"
  },
]

const tagColors: Record<string, string> = {
  "Cliente": "#34D399",
  "VIP": "#F59E0B",
  "Prospecto": "#3B82F6",
  "Referido": "#7C3AED",
  "Inactivo": "#9CA3AF",
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])

  const toggleContact = (id: number) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">Contactos</h1>
          <p className="text-muted-foreground mt-1">
            {contacts.length} contactos en total
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo contacto
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar contactos..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" className="rounded-xl">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Ordenar
          </Button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {["Todos", "Clientes", "VIP", "Prospectos", "Inactivos"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "Todos" 
                ? "bg-[#3B82F6] text-white" 
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Contacts list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground border-b border-border">
              <th className="p-4 font-medium w-12">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium hidden lg:table-cell">Empresa</th>
              <th className="p-4 font-medium hidden md:table-cell">Contacto</th>
              <th className="p-4 font-medium hidden lg:table-cell">Último contacto</th>
              <th className="p-4 font-medium">Etiquetas</th>
              <th className="p-4 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white text-sm font-semibold">
                        {contact.avatar}
                      </div>
                      {contact.starred && (
                        <Star className="absolute -top-1 -right-1 w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground md:hidden">{contact.company}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                  {contact.company}
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#3B82F6] transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#3B82F6] transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#34D399] transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                  {contact.lastContact}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${tagColors[tag]}15`,
                          color: tagColors[tag]
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <button className="p-2 rounded-lg hover:bg-secondary">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
