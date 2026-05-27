import Image from "next/image"

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
]

const footerCopy: Record<string, {
  description: string
  product: string
  productLinks: string[]
  resources: string
  resourcesLinks: string[]
  company: string
  companyLinks: string[]
  rights: string
}> = {
  es: {
    description:
      "Operaly es un producto desarrollado por Alderete Yangali Group Holding SAC, empresa con base en Perú y visión para Latinoamérica y el mundo.",
    product: "Producto",
    productLinks: ["Qué hace Operaly", "Planes", "Preguntas frecuentes", "Entrar"],
    resources: "Recursos",
    resourcesLinks: ["Contáctese con nosotros", "support@operaly.app"],
    company: "Empresa",
    companyLinks: ["Términos y condiciones", "Política de privacidad", "Preferencias de cookies"],
    rights: "© 2026 Operaly. Todos los derechos reservados.",
  },
  en: {
    description:
      "Operaly is a product developed by Alderete Yangali Group Holding SAC, a company based in Peru with a view toward Latin America and the world.",
    product: "Product",
    productLinks: ["What Operaly does", "Plans", "Frequently asked questions", "Sign in"],
    resources: "Resources",
    resourcesLinks: ["Contact us", "support@operaly.app"],
    company: "Company",
    companyLinks: ["Terms and conditions", "Privacy policy", "Cookie settings"],
    rights: "© 2026 Operaly. All rights reserved.",
  },
  pt: {
    description:
      "Operaly é um produto desenvolvido pela Alderete Yangali Group Holding SAC, empresa com base no Peru e visão para a América Latina e o mundo.",
    product: "Produto",
    productLinks: ["O que a Operaly faz", "Planos", "Perguntas frequentes", "Entrar"],
    resources: "Recursos",
    resourcesLinks: ["Fale conosco", "support@operaly.app"],
    company: "Empresa",
    companyLinks: ["Termos e condições", "Política de privacidade", "Preferências de cookies"],
    rights: "© 2026 Operaly. Todos os direitos reservados.",
  },
  fr: {
    description:
      "Operaly est un produit développé par Alderete Yangali Group Holding SAC, une entreprise basée au Pérou avec une vision pour l’Amérique latine et le monde.",
    product: "Produit",
    productLinks: ["Ce que fait Operaly", "Offres", "Questions fréquentes", "Entrer"],
    resources: "Ressources",
    resourcesLinks: ["Contactez-nous", "support@operaly.app"],
    company: "Entreprise",
    companyLinks: ["Conditions générales", "Politique de confidentialité", "Préférences de cookies"],
    rights: "© 2026 Operaly. Tous droits réservés.",
  },
  de: {
    description:
      "Operaly ist ein Produkt der Alderete Yangali Group Holding SAC, einem Unternehmen mit Sitz in Peru und Blick auf Lateinamerika und die Welt.",
    product: "Produkt",
    productLinks: ["Was Operaly macht", "Pläne", "Häufige Fragen", "Anmelden"],
    resources: "Ressourcen",
    resourcesLinks: ["Kontaktieren Sie uns", "support@operaly.app"],
    company: "Unternehmen",
    companyLinks: ["Allgemeine Geschäftsbedingungen", "Datenschutz", "Cookie-Einstellungen"],
    rights: "© 2026 Operaly. Alle Rechte vorbehalten.",
  },
  it: {
    description:
      "Operaly è un prodotto sviluppato da Alderete Yangali Group Holding SAC, azienda con sede in Perù e visione per l’America Latina e il mondo.",
    product: "Prodotto",
    productLinks: ["Cosa fa Operaly", "Piani", "Domande frequenti", "Accedi"],
    resources: "Risorse",
    resourcesLinks: ["Contattaci", "support@operaly.app"],
    company: "Azienda",
    companyLinks: ["Termini e condizioni", "Informativa sulla privacy", "Preferenze cookie"],
    rights: "© 2026 Operaly. Tutti i diritti riservati.",
  },
}

export function Footer({ locale = "es" }: { locale?: string }) {
  const t = footerCopy[locale] || footerCopy.es

  return (
    <footer id="contacto" className="bg-[linear-gradient(180deg,#09112B_0%,#0F1F63_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-16 lg:grid-cols-[1.2fr_0.85fr_0.8fr_0.85fr]">
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
                { label: "Instagram", short: "ig", href: "https://www.instagram.com/operaly.app" },
                { label: "Facebook", short: "f", href: "https://www.facebook.com/operaly.app" },
                { label: "TikTok", short: "tt", href: "https://www.tiktok.com/@operaly.app" },
                { label: "LinkedIn", short: "in", href: "https://www.linkedin.com/company/operaly" },
                { label: "X", short: "x", href: "https://x.com/operaly_app" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white/84"
                  aria-label={social.label}
                >
                  {social.short}
                </a>
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
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">{t.company}</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              <li><a href="/terminos-y-condiciones" className="hover:text-white">{t.companyLinks[0]}</a></li>
              <li><a href="/politica-de-privacidad" className="hover:text-white">{t.companyLinks[1]}</a></li>
              <li><a href="/cookies" className="hover:text-white">{t.companyLinks[2]}</a></li>
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
