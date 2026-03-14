"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image 
              src="/images/operaly-logo.png" 
              alt="Operaly" 
              width={160} 
              height={160}
              className="h-11 w-auto mix-blend-multiply"
              priority
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#soluciones" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Soluciones
            </a>
            <a href="#sofia" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sofía
            </a>
            <a href="#funciones" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Funciones
            </a>
            <a href="/precios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Precios
            </a>
            <a href="#contacto" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contacto
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium" asChild>
              <a href="/login">Iniciar sesión</a>
            </Button>
            <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white rounded-full px-6" asChild>
              <a href="/register">Probar 7 días gratis</a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a href="#soluciones" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Soluciones
              </a>
              <a href="#sofia" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sofía
              </a>
              <a href="#funciones" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Funciones
              </a>
              <a href="/precios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
              <a href="#contacto" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="justify-start text-sm font-medium" asChild>
                  <a href="/login">Iniciar sesión</a>
                </Button>
                <Button className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white rounded-full" asChild>
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
