"use client"

import { useState, useEffect } from "react"
import { Sparkles, MessageSquare, CheckCircle2, Loader2 } from "lucide-react"

interface SofiaStatusProps {
  variant?: "compact" | "expanded"
  className?: string
}

export function SofiaStatus({ variant = "compact", className = "" }: SofiaStatusProps) {
  const [status, setStatus] = useState<"active" | "responding" | "idle">("active")
  const [lastAction, setLastAction] = useState("Respondiendo a María García")

  // Simulate status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: ("active" | "responding" | "idle")[] = ["active", "responding", "active"]
      setStatus(statuses[Math.floor(Math.random() * statuses.length)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7C3AED]/10 via-[#3B82F6]/10 to-[#06B6D4]/10 border border-[#7C3AED]/20 ${className}`}>
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            status === "responding" ? "bg-amber-400 animate-pulse" : "bg-[#34D399]"
          }`} />
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-medium text-[#0F1F63]">Sofía</span>
          <span className="text-xs text-muted-foreground ml-1">
            {status === "responding" ? "respondiendo..." : "activa"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 border border-[#7C3AED]/10 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            status === "responding" ? "bg-amber-400 animate-pulse" : "bg-[#34D399]"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F1F63]">Sofía</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              status === "responding" 
                ? "bg-amber-100 text-amber-700" 
                : "bg-[#34D399]/10 text-[#047857]"
            }`}>
              {status === "responding" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Respondiendo
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Activa
                </>
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">{lastAction}</p>
        </div>
      </div>
    </div>
  )
}

export function SofiaTypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#7C3AED]/5 to-[#3B82F6]/5 rounded-2xl rounded-bl-md max-w-[200px]">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shrink-0">
        <span className="text-white text-[10px] font-bold">S</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}

export function SofiaMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">S</span>
      </div>
      <div className="px-4 py-3 bg-gradient-to-r from-[#7C3AED]/5 to-[#3B82F6]/5 rounded-2xl rounded-tl-md">
        <p className="text-sm text-foreground">{message}</p>
      </div>
    </div>
  )
}
