"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const languages = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "it", label: "IT" },
]

const headerCopy = {
  es: {
    product: "Producto",
    plans: "Planes",
    faq: "Preguntas",
    contact: "Contacto",
    enter: "Entrar",
    trial: "Prueba gratis",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  en: {
    product: "Product",
    plans: "Plans",
    faq: "Questions",
    contact: "Contact",
    enter: "Sign in",
    trial: "Start free trial",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
} as const

export function Header({ locale = "es" }: { locale?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let previousScroll = window.scrollY

    const onScroll = () => {
      const currentScroll = window.scrollY
      if (currentScroll < 48) {
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
  const t = currentLocale === "es" ? headerCopy.es : headerCopy.en

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="rounded-full border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] px-4 py-3 shadow-[0_24px_70px_-34px_rgba(9,17,43,0.9)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
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

            <div className="hidden items-center gap-8 lg:flex">
              {[
                { href: "#producto", label: t.product },
                { href: "#planes", label: t.plans },
                { href: "#preguntas", label: t.faq },
                { href: "#contacto", label: t.contact },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold text-white/86 transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-1 rounded-full border border-white/12 bg-[#09112B]/36 p-1">
                {languages.map((language) => (
                  <a
                    key={language.code}
                    href={`/?lang=${language.code}`}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      currentLocale === language.code
                        ? "bg-white text-[#0F1F63]"
                        : "text-white/72 hover:text-white"
                    }`}
                  >
                    {language.label}
                  </a>
                ))}
              </div>

              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/14 hover:text-white"
                asChild
              >
                <a href="/dashboard">{t.enter}</a>
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] px-6 text-white shadow-[0_18px_50px_-22px_rgba(139,123,255,0.8)]"
                asChild
              >
                <a href="/register">{t.trial}</a>
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <a
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] px-4 text-xs font-bold text-white"
              >
                {t.trial}
              </a>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white"
                aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
                onClick={() => setMobileMenuOpen((value) => !value)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>

        {mobileMenuOpen ? (
          <div className="mt-3 rounded-[28px] border border-white/16 bg-[#09112B]/86 p-5 shadow-[0_24px_70px_-34px_rgba(9,17,43,0.9)] backdrop-blur-2xl lg:hidden">
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <a
                  key={language.code}
                  href={`/?lang=${language.code}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    currentLocale === language.code
                      ? "bg-white text-[#0F1F63]"
                      : "bg-white/10 text-white/72"
                  }`}
                >
                  {language.label}
                </a>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              {[
                { href: "#producto", label: t.product },
                { href: "#planes", label: t.plans },
                { href: "#preguntas", label: t.faq },
                { href: "#contacto", label: t.contact },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="mt-5 grid gap-2">
              <a
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-sm font-semibold text-white"
              >
                {t.enter}
              </a>
              <a
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#6EA7FF] via-[#8B7BFF] to-[#F35DB4] text-sm font-bold text-white"
              >
                {t.trial}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
