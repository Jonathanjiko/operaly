"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "Producto", href: "#producto" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
  { label: "Contacto", href: "#contacto" },
]

const languages = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "it", label: "IT" },
]

export function Header({ locale = "es" }: { locale?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let previousScroll = window.scrollY

    const onScroll = () => {
      const currentScroll = window.scrollY
      if (currentScroll < 40) {
        setHidden(false)
      } else if (currentScroll > previousScroll) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      previousScroll = currentScroll
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const currentLocale = useMemo(
    () => languages.find((item) => item.code === locale)?.code || "es",
    [locale]
  )

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav className="mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/84 px-4 py-3 shadow-[0_18px_50px_-28px_rgba(15,31,99,0.45)] backdrop-blur-xl sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Operaly inicio">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={160}
            height={160}
            className="h-11 w-auto"
            priority
          />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#0F1F63]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            {languages.map((language) => (
              <a
                key={language.code}
                href={`/?lang=${language.code}`}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  currentLocale === language.code
                    ? "bg-[#0F1F63] text-white"
                    : "text-slate-500 hover:text-[#0F1F63]"
                }`}
              >
                {language.label}
              </a>
            ))}
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 bg-white px-5 text-sm font-semibold text-[#0F1F63]"
            asChild
          >
            <a href="/dashboard">Entrar</a>
          </Button>
          <Button
            className="rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-6 text-white shadow-[0_16px_35px_-16px_rgba(37,211,102,0.7)]"
            asChild
          >
            <a href="/register">Prueba gratis</a>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] px-4 text-xs font-bold text-white"
          >
            Prueba gratis
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0F1F63]"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mx-3 mt-3 rounded-[28px] border border-white/70 bg-white/94 p-5 shadow-[0_18px_50px_-28px_rgba(15,31,99,0.45)] backdrop-blur-xl lg:hidden">
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <a
                key={language.code}
                href={`/?lang=${language.code}`}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  currentLocale === language.code
                    ? "bg-[#0F1F63] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {language.label}
              </a>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#0F1F63]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-5 grid gap-2">
            <a
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-[#0F1F63]"
            >
              Entrar al panel
            </a>
            <a
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#06B6D4] text-sm font-bold text-white"
            >
              Prueba gratis
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
