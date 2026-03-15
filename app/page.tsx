import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import LogoCloud from "@/components/landing/logo-cloud"
import TrustIndicators from "@/components/landing/trust-indicators"
import Solutions from "@/components/landing/solutions"
import HowItWorks from "@/components/landing/how-it-works"
import Sofia from "@/components/landing/sofia"
import Features from "@/components/landing/features"
import Integrations from "@/components/landing/integrations"
import Dashboard from "@/components/landing/dashboard"
import Pricing from "@/components/landing/pricing"
import FinalCTA from "@/components/landing/final-cta"
import Contact from "@/components/landing/contact"
import Footer from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <LogoCloud />
      <TrustIndicators />
      <Solutions />
      <HowItWorks />
      <Sofia />
      <Features />
      <Integrations />
      <Dashboard />
      <Pricing />
      <FinalCTA />
      <Contact />
      <Footer />
    </main>
  )
}
