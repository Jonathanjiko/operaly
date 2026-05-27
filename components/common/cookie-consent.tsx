"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Zap } from "lucide-react"

const STORAGE_KEY = "operaly-cookie-consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem(STORAGE_KEY)
      if (!accepted) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted")
      document.cookie = "operaly_cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax"
    } catch {
      // noop
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-[0_24px_80px_-30px_rgba(15,31,99,0.45)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
            <ShieldCheck className="h-4 w-4 text-[#3B82F6]" />
            Cookies para una experiencia más rápida
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Guarde cookies para mantener su sesión, recordar preferencias y cargar Operaly con menos fricción en móvil y escritorio.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleAccept}
            className="rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-5 text-white"
          >
            <Zap className="mr-2 h-4 w-4" />
            Guardar y continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
