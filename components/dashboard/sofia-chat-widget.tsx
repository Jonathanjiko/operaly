"use client"

import { useState } from "react"
import { Sparkles, X, Send, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  type: "user" | "sofia"
  text: string
  time: string
}

export function SofiaChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "sofia",
      text: "Hola, soy Sofía, tu asistente IA. ¿En qué puedo ayudarte hoy?",
      time: "Ahora",
    },
  ])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
      time: "Ahora",
    }

    setMessages([...messages, newMessage])
    setInputValue("")

    // Simulate Sofia response
    setTimeout(() => {
      const sofiaResponse: Message = {
        id: messages.length + 2,
        type: "sofia",
        text: "Entendido. Estoy procesando tu solicitud. Dame un momento.",
        time: "Ahora",
      }
      setMessages((prev) => [...prev, sofiaResponse])
    }, 1500)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 hover:scale-105 transition-transform z-50"
      >
        <Sparkles className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#34D399] rounded-full border-2 border-white" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 transition-all ${isMinimized ? "h-16" : "h-[500px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Sofía</p>
            <p className="text-xs text-white/70">Tu asistente IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 h-[360px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
