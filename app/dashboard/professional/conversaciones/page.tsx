"use client"

import { useState } from "react"
import { 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Send,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
  Sparkles
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const conversations = [
  {
    id: 1,
    name: "María López",
    lastMessage: "Perfecto, entonces nos vemos el martes",
    time: "10:32",
    unread: 2,
    avatar: "ML",
    online: true,
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    lastMessage: "Gracias por enviar el documento",
    time: "09:15",
    unread: 0,
    avatar: "CM",
    online: false,
  },
  {
    id: 3,
    name: "Ana García",
    lastMessage: "¿Cuándo podemos agendar la siguiente consulta?",
    time: "Ayer",
    unread: 1,
    avatar: "AG",
    online: true,
  },
  {
    id: 4,
    name: "Roberto Sánchez",
    lastMessage: "Entendido, prepararé la documentación",
    time: "Ayer",
    unread: 0,
    avatar: "RS",
    online: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "client",
    text: "Hola, ¿cómo está? Quería consultar sobre el avance del caso",
    time: "10:15",
    status: "read",
  },
  {
    id: 2,
    sender: "sofia",
    text: "¡Hola María! Qué gusto saludarte. Te cuento que tu caso está avanzando muy bien. El documento que enviaste ya fue procesado y estamos preparando la siguiente fase.",
    time: "10:18",
    status: "read",
    isSofia: true,
  },
  {
    id: 3,
    sender: "client",
    text: "Excelente, ¿cuándo podríamos reunirnos para revisar los detalles?",
    time: "10:25",
    status: "read",
  },
  {
    id: 4,
    sender: "sofia",
    text: "Tengo disponibilidad el martes a las 3pm o el miércoles a las 10am. ¿Cuál te funciona mejor?",
    time: "10:28",
    status: "read",
    isSofia: true,
  },
  {
    id: 5,
    sender: "client",
    text: "Perfecto, entonces nos vemos el martes",
    time: "10:32",
    status: "delivered",
  },
]

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [message, setMessage] = useState("")

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden border border-border bg-card">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar conversaciones..." 
              className="pl-10 bg-secondary/50 border-0"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
                selectedConversation.id === conv.id ? "bg-secondary" : ""
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-medium">
                  {conv.avatar}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#34D399] border-2 border-card" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0F1F63] truncate">{conv.name}</span>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground truncate">{conv.lastMessage}</span>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#3B82F6] text-white text-xs flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white font-medium text-sm">
                {selectedConversation.avatar}
              </div>
              {selectedConversation.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-card" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[#0F1F63]">{selectedConversation.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.online ? "En línea" : "Última vez hace 2h"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
          {/* Sofia indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-[#7C3AED]" />
            Sofía está respondiendo en tu nombre
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "client" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === "client"
                    ? "bg-card border border-border"
                    : msg.isSofia
                    ? "bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white"
                    : "bg-[#3B82F6] text-white"
                }`}
              >
                {msg.isSofia && (
                  <div className="flex items-center gap-1 text-xs text-white/70 mb-1">
                    <Sparkles className="w-3 h-3" />
                    Sofía
                  </div>
                )}
                <p className="text-sm">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                  msg.sender === "client" ? "text-muted-foreground" : "text-white/70"
                }`}>
                  {msg.time}
                  {msg.sender !== "client" && (
                    msg.status === "read" 
                      ? <CheckCheck className="w-3 h-3" />
                      : <Check className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-secondary/50 border-0"
            />
            <Button variant="ghost" size="icon">
              <Mic className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button size="icon" className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
