"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function StartPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-[#0F1F63]">
          ¿Cómo quieres usar Operaly?
        </h1>

        <p className="text-muted-foreground">
          Elige el tipo de experiencia que necesitas.
        </p>

        <div className="grid gap-4 mt-6">
          <Button
            className="h-14 rounded-xl"
            onClick={() => router.push("/register?type=assistant")}
          >
            Usar como asistente personal
          </Button>

          <Button
            variant="outline"
            className="h-14 rounded-xl"
            onClick={() => router.push("/register?type=seller")}
          >
            Usar para vender por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}
