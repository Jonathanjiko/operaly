import { Header } from "@/components/landing/header"
import { CommercialLanding } from "@/components/landing/commercial-landing"
import { Pricing } from "@/components/landing/pricing"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { headers } from "next/headers"

const COUNTRY_LOCALE: Record<string, string> = {
  AR: "es",
  BO: "es",
  CL: "es",
  CO: "es",
  CR: "es",
  EC: "es",
  ES: "es",
  MX: "es",
  PA: "es",
  PE: "es",
  PY: "es",
  UY: "es",
  VE: "es",
  BR: "pt",
  PT: "pt",
  DE: "de",
  AT: "de",
  CH: "de",
  FR: "fr",
  CA: "en",
  GB: "en",
  US: "en",
}

async function getRequestLocale() {
  const requestHeaders = await headers()
  const country = String(
    requestHeaders.get("x-vercel-ip-country") ||
      requestHeaders.get("cf-ipcountry") ||
      ""
  ).toUpperCase()
  return COUNTRY_LOCALE[country] || "en"
}

export default async function Home() {
  const locale = await getRequestLocale()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CommercialLanding locale={locale} />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}
