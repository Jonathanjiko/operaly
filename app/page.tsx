import { Header } from "@/components/landing/header"
import { CommercialLanding } from "@/components/landing/commercial-landing"
import { Pricing } from "@/components/landing/pricing"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { headers } from "next/headers"

const _SITE_META: Record<string, { title: string; description: string }> = {
  es: {
    title: "Operaly | Tu asistente de IA para WhatsApp",
    description: "Operaly es el asistente de IA para WhatsApp que ayuda a profesionales a gestionar clientes, agenda y tareas diarias.",
  },
  en: {
    title: "Operaly | Your AI Assistant for WhatsApp",
    description: "Operaly is the AI assistant for WhatsApp that helps professionals manage clients, schedule appointments, and automate daily tasks.",
  },
  pt: {
    title: "Operaly | Seu Assistente de IA para WhatsApp",
    description: "Operaly é o assistente de IA para WhatsApp que ajuda profissionais a gerenciar clientes e automatizar tarefas.",
  },
  fr: {
    title: "Operaly | Votre Assistant IA pour WhatsApp",
    description: "Operaly est l'assistant IA pour WhatsApp qui aide les professionnels à gérer clients et tâches.",
  },
  de: {
    title: "Operaly | Ihr KI-Assistent für WhatsApp",
    description: "Operaly ist der KI-Assistent für WhatsApp für Fachleute und Unternehmen.",
  },
  it: {
    title: "Operaly | Il Tuo Assistente IA per WhatsApp",
    description: "Operaly è l'assistente IA per WhatsApp per professionisti e aziende.",
  },
}

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

const languages = ["es", "en", "pt", "fr", "de", "it"]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang } = await searchParams
  const locale = lang ?? "es"
  const meta = _SITE_META[locale] ?? _SITE_META["es"]
  return {
    title: meta.title,
    description: meta.description,
    keywords: "WhatsApp, IA, asistente virtual, agenda, automatización, profesionales",
  }
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

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = (await searchParams) || {}
  const requestedLanguage = String(params.lang || "").toLowerCase()
  const locale = languages.includes(requestedLanguage) ? requestedLanguage : await getRequestLocale()

  return (
    <main className="min-h-screen bg-background">
      <Header locale={locale} />
      <CommercialLanding locale={locale} />
      <Pricing locale={locale} />
      <FinalCTA locale={locale} />
      <Footer locale={locale} />
    </main>
  )
}
