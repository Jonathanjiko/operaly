"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, Sparkles, X } from "lucide-react"
import Image from "next/image"

const navItems = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funciones", href: "#funciones" },
  { label: "Precios", href: "#precios" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[74px] items-center justify-between">
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

          <div className="hidden items-center gap-7 md:flex">
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

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="outline"
              className="rounded-full border-slate-200 bg-white/90 px-5 text-sm font-semibold text-[#0F1F63] shadow-sm"
              asChild
            >
              <a href="/dashboard">Entrar al dashboard</a>
            </Button>
            <Button variant="ghost" className="text-sm font-medium text-[#0F1F63]" asChild>
              <a href="/login">Iniciar sesion</a>
            </Button>
            <Button
              className="rounded-full border border-white/20 bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] px-6 text-white shadow-[0_12px_30px_-10px_rgba(59,130,246,0.55)] hover:opacity-95"
              asChild
            >
              <a href="/register">Probar 7 dias gratis</a>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <a
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 text-xs font-semibold text-[#0F1F63] shadow-sm"
            >
              Entrar
            </a>
            <button
              type="button"
              className="p-2"
              aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <div className="rounded-[28px] border border-[#DCE7F5] bg-[linear-gradient(135deg,rgba(37,211,102,0.10),rgba(59,130,246,0.10),rgba(124,58,237,0.08))] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                  <Sparkles className="h-4 w-4 text-[#3B82F6]" />
                  Operaly le ayuda desde WhatsApp y dashboard
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Si ya tiene cuenta, entre de frente. Si es nuevo, pruebe Operaly y empiece a delegar su dia.
                </p>
              </div>

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

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <Button variant="outline" className="justify-start rounded-full text-sm font-semibold" asChild>
                  <a href="/dashboard">
                    Entrar al dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" className="justify-start text-sm font-medium" asChild>
                  <a href="/login">Iniciar sesion</a>
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#06B6D4] text-white"
                  asChild
                >
                  <a href="/register">Probar 7 dias gratis</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
