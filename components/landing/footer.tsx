import Image from "next/image"

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
]

const footerCopy = {
  es: {
    description:
      "Operaly le ayuda a ordenar agenda, correos, contactos, documentos, recordatorios y seguimiento desde WhatsApp y desde su panel privado.",
    product: "Producto",
    productLinks: ["Qué hace Operaly", "Planes", "Preguntas frecuentes", "Entrar"],
    resources: "Recursos",
    resourcesLinks: ["Contáctese con nosotros", "support@operaly.app", "Libro de reclamaciones", "Cookies"],
    company: "Empresa",
    companyLinks: ["Términos y condiciones", "Política de privacidad", "Preferencias de cookies", "Formulario de contacto"],
    rights: "© 2026 Operaly. Todos los derechos reservados.",
  },
  en: {
    description:
      "Operaly helps you keep agenda, email, contacts, files, reminders and follow-up in order from WhatsApp and from your private panel.",
    product: "Product",
    productLinks: ["What Operaly does", "Plans", "Frequently asked questions", "Sign in"],
    resources: "Resources",
    resourcesLinks: ["Contact us", "support@operaly.app", "Claims book", "Cookies"],
    company: "Company",
    companyLinks: ["Terms and conditions", "Privacy policy", "Cookie settings", "Contact form"],
    rights: "© 2026 Operaly. All rights reserved.",
  },
} as const

export function Footer({ locale = "es" }: { locale?: string }) {
  const t = locale === "es" ? footerCopy.es : footerCopy.en

  return (
    <footer id="contacto" className="bg-[linear-gradient(180deg,#09112B_0%,#0F1F63_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.95fr]">
          <div>
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={180}
              height={180}
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/72">{t.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {languages.map((language) => (
                <a
                  key={language.code}
                  href={`/?lang=${language.code}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    locale === language.code
                      ? "bg-white text-[#0F1F63]"
                      : "bg-white/10 text-white/76 hover:bg-white/14"
                  }`}
                >
                  {language.label}
                </a>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "Instagram", short: "ig" },
                { label: "Facebook", short: "f" },
                { label: "TikTok", short: "tt" },
                { label: "LinkedIn", short: "in" },
                { label: "X", short: "x" },
              ].map((social) => (
                <span
                  key={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white/84"
                  aria-label={social.label}
                >
                  {social.short}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">{t.product}</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              <li><a href="#producto" className="hover:text-white">{t.productLinks[0]}</a></li>
              <li><a href="#planes" className="hover:text-white">{t.productLinks[1]}</a></li>
              <li><a href="#preguntas" className="hover:text-white">{t.productLinks[2]}</a></li>
              <li><a href="/dashboard" className="hover:text-white">{t.productLinks[3]}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">{t.resources}</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              <li><a href="/contacto" className="hover:text-white">{t.resourcesLinks[0]}</a></li>
              <li><a href="mailto:support@operaly.app" className="hover:text-white">{t.resourcesLinks[1]}</a></li>
              <li><a href="/libro-de-reclamaciones" className="hover:text-white">{t.resourcesLinks[2]}</a></li>
              <li><a href="/cookies" className="hover:text-white">{t.resourcesLinks[3]}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">{t.company}</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              <li><a href="/terminos-y-condiciones" className="hover:text-white">{t.companyLinks[0]}</a></li>
              <li><a href="/politica-de-privacidad" className="hover:text-white">{t.companyLinks[1]}</a></li>
              <li><a href="/cookies" className="hover:text-white">{t.companyLinks[2]}</a></li>
              <li><a href="/contacto" className="hover:text-white">{t.companyLinks[3]}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-sm text-white/55">
          {t.rights}
        </div>
      </div>
    </footer>
  )
}
