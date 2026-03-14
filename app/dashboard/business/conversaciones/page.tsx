"use client"

import { useState } from "react"
import { 
  MessageSquare, 
  Search, 
  Filter,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  User,
  ShoppingCart,
  Sparkles,
  Clock,
  Check,
  CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"

const conversations = [
  { 
    id: 1, 
    customer: "Juan Pérez", 
    lastMessage: "Perfecto, entonces quiero ordenar 2 hamburguesas",
    time: "Ahora",
    unread: 2,
    channel: "whatsapp",
    status: "active",
    avatar: "JP"
  },
  { 
    id: 2, 
    customer: "María López", 
    lastMessage: "¿Tienen mesa disponible para las 8pm?",
    time: "Hace 3 min",
    unread: 1,
    channel: "instagram",
    status: "active",
    avatar: "ML"
  },
  { 
    id: 3, 
    customer: "Carlos García", 
    lastMessage: "¿Cuáles son los ingredientes de la pizza familiar?",
    time: "Hace 10 min",
    unread: 0,
    channel: "messenger",
    status: "sofia",
    avatar: "CG"
  },
  { 
    id: 4, 
    customer: "Ana Torres", 
    lastMessage: "Gracias, ya recibí mi pedido",
    time: "Hace 30 min",
    unread: 0,
    channel: "whatsapp",
    status: "closed",
    avatar: "AT"
  },
]

const selectedConversation = {
  customer: {
    name: "Juan Pérez",
    phone: "+51 999 111 222",
    totalOrders: 15,
    lastOrder: "Hace 2 días"
  },
  messages: [
    { id: 1, type: "incoming", text: "Hola, buenas tardes", time: "2:30 PM", status: "read" },
    { id: 2, type: "outgoing", text: "¡Hola Juan! Bienvenido a Restaurante El Buen Sabor. ¿En qué puedo ayudarte hoy?", time: "2:30 PM", sender: "sofia", status: "read" },
    { id: 3, type: "incoming", text: "Quiero hacer un pedido para delivery", time: "2:31 PM", status: "read" },
    { id: 4, type: "outgoing", text: "¡Claro! Con gusto te ayudo. Te comparto nuestro menú. ¿Qué te gustaría ordenar?", time: "2:31 PM", sender: "sofia", status: "read" },
    { id: 5, type: "incoming", text: "Perfecto, entonces quiero ordenar 2 hamburguesas", time: "2:33 PM", status: "delivered" },
  ]
}

const channelIcons: Record<string, JSX.Element> = {
  whatsapp: (
    <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </div>
  ),
  instagram: (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E4405F] to-[#C13584] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  ),
  messenger: (
    <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
      </svg>
    </div>
  ),
}

const statusColors: Record<string, { bg: string, label: string }> = {
  active: { bg: "#34D399", label: "Activo" },
  sofia: { bg: "#7C3AED", label: "Sofía atendiendo" },
  closed: { bg: "#9CA3AF", label: "Cerrada" },
}

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [selectedId, setSelectedId] = useState(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">Conversaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos tus canales de comunicación
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Channel filters */}
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1">
            <button className="p-2 rounded-lg bg-white shadow-sm">
              <MessageSquare className="w-4 h-4 text-[#0F1F63]" />
            </button>
            {Object.entries(channelIcons).map(([key, icon]) => (
              <button key={key} className="p-2 rounded-lg hover:bg-white/50">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat interface */}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Conversations list */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversaciones..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#34D399]/20 focus:border-[#34D399]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-start gap-3 p-4 border-b border-border hover:bg-secondary/30 transition-colors text-left ${
                  selectedId === conv.id ? "bg-[#34D399]/5" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center text-white font-semibold">
                    {conv.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {channelIcons[conv.channel]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground">{conv.customer}</p>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {conv.status === "sofia" && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#7C3AED]">
                        <Sparkles className="w-3 h-3" />
                        Sofía
                      </span>
                    )}
                  </div>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#34D399] text-white text-xs flex items-center justify-center font-medium">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat view */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34D399] to-[#06B6D4] flex items-center justify-center text-white font-semibold">
                JP
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedConversation.customer.name}</p>
                <p className="text-xs text-muted-foreground">{selectedConversation.customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Ver pedidos
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg">
                <User className="w-4 h-4 mr-1" />
                Ver perfil
              </Button>
              <button className="p-2 rounded-lg hover:bg-secondary">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConversation.messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.type === "outgoing" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${msg.type === "outgoing" ? "order-2" : ""}`}>
                  <div 
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === "outgoing"
                        ? "bg-gradient-to-r from-[#34D399] to-[#06B6D4] text-white"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                    msg.type === "outgoing" ? "justify-end" : ""
                  }`}>
                    {msg.sender === "sofia" && (
                      <span className="flex items-center gap-1 text-[#7C3AED]">
                        <Sparkles className="w-3 h-3" />
                        Sofía
                      </span>
                    )}
                    <span>{msg.time}</span>
                    {msg.type === "outgoing" && (
                      msg.status === "read" ? (
                        <CheckCheck className="w-3 h-3 text-[#34D399]" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#34D399]/20 focus:border-[#34D399]"
              />
              <Button className="rounded-xl bg-gradient-to-r from-[#34D399] to-[#06B6D4] text-white h-11 px-4">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
