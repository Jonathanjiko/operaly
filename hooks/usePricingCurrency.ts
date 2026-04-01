"use client"

import { useEffect, useState } from "react"

export type PricingCurrency = "PEN" | "USD"

export type PlanPrices = {
  core: number
  pro: number
  pro_plus: number
  addon_voice: number
  addon_storage: number
  addon_google: number
}

export type PricingConfig = {
  currency: PricingCurrency
  symbol: string
  display: PlanPrices
  charge_pen: PlanPrices
  fmt: (n: number) => string
  fmtPEN: (n: number) => string
}

const PERU: PricingConfig = {
  currency: "PEN", symbol: "S/",
  display:    { core: 49,  pro: 99,  pro_plus: 199, addon_voice: 50, addon_storage: 25, addon_google: 40 },
  charge_pen: { core: 49,  pro: 99,  pro_plus: 199, addon_voice: 50, addon_storage: 25, addon_google: 40 },
  fmt:    (n) => `S/${n}`,
  fmtPEN: (n) => `S/${n}`,
}

const INTL: PricingConfig = {
  currency: "USD", symbol: "$",
  display:    { core: 12,  pro: 24,  pro_plus: 48,  addon_voice: 10, addon_storage: 5,  addon_google: 8  },
  charge_pen: { core: 60,  pro: 120, pro_plus: 240, addon_voice: 50, addon_storage: 25, addon_google: 40 },
  fmt:    (n) => `$${n}`,
  fmtPEN: (n) => `S/${n}`,
}

export function usePricingCurrency(): { pricing: PricingConfig; loading: boolean; isPeru: boolean } {
  const [pricing, setPricing] = useState<PricingConfig>(INTL)
  const [loading, setLoading] = useState(true)
  const [isPeru, setIsPeru]   = useState(false)

  useEffect(() => {
    const detect = async () => {
      try {
        const cached = localStorage.getItem("operaly_country_code")
        if (cached) {
          const peru = cached === "PE"
          setPricing(peru ? PERU : INTL); setIsPeru(peru); setLoading(false); return
        }
        const profile = localStorage.getItem("operaly_assistant_profile")
        if (profile) {
          const p = JSON.parse(profile)
          if (p?.countryCode) {
            const peru = p.countryCode === "PE"
            localStorage.setItem("operaly_country_code", p.countryCode)
            setPricing(peru ? PERU : INTL); setIsPeru(peru); setLoading(false); return
          }
        }
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const data = await res.json()
          const code = (data?.country_code || "").toUpperCase()
          localStorage.setItem("operaly_country_code", code)
          const peru = code === "PE"
          setPricing(peru ? PERU : INTL); setIsPeru(peru)
        }
      } catch {}
      setLoading(false)
    }
    detect()
  }, [])

  return { pricing, loading, isPeru }
}
