"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"

const navItems = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Casos de uso", href: "#soluciones" },
  { label: "Operaly", href: "#operaly" },
  { label: "Funciones", href: "#funciones" },
  { label: "Precios", href: "/precios" },
  { label: "Contacto", href: "#contacto" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <a href="/" className="flex items-center" aria-label="Operaly inicio">
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={160}
              height={160}
              className="h-11 w-auto mix-blend-multiply"
              priority
            />
          </a>

          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#0F1F63]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium text-[#0F1F63]" asChild>
              <a href="/login">Iniciar sesión</a>
            </Button>
            <Button
              className="rounded-full border border-white/20 bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] px-6 text-white shadow-[0_12px_30px_-10px_rgba(59,130,246,0.55)] hover:opacity-95"
              asChild
            >
              <a href="/register">Probar 7 días gratis</a>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="justify-start text-sm font-medium" asChild>
                  <a href="/login">Iniciar sesión</a>
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] text-white"
                  asChild
                >
                  <a href="/register">Probar 7 días gratis</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
