// hooks/usePricingCurrency.ts
// Detects user country and returns pricing in the correct currency
// Peru → PEN (S/49, S/99, S/199)
// Rest of world → USD ($12, $24, $48)

"use client"

import { useEffect, useState } from "react"

export type PricingCurrency = "PEN" | "USD"

export type PlanPricing = {
  currency: PricingCurrency
  symbol: string
  prices: {
    core: number
    pro: number
    pro_plus: number
    addon_voice: number
    addon_storage: number
    addon_google: number
  }
  format: (amount: number) => string
}

const USD_PRICING: PlanPricing = {
  currency: "USD",
  symbol: "$",
  prices: { core: 12, pro: 24, pro_plus: 48, addon_voice: 10, addon_storage: 5, addon_google: 8 },
  format: (n) => `$${n}`,
}

const PEN_PRICING: PlanPricing = {
  currency: "PEN",
  symbol: "S/",
  prices: { core: 49, pro: 99, pro_plus: 199, addon_voice: 50, addon_storage: 25, addon_google: 40 },
  format: (n) => `S/${n}`,
}

export function usePricingCurrency(): { pricing: PlanPricing; loading: boolean } {
  const [pricing, setPricing] = useState<PlanPricing>(USD_PRICING)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detect = async () => {
      try {
        // 1. Check localStorage override
        const stored = localStorage.getItem("operaly_country_code")
        if (stored === "PE") { setPricing(PEN_PRICING); setLoading(false); return }
        if (stored && stored !== "PE") { setPricing(USD_PRICING); setLoading(false); return }

        // 2. Check from registration profile
        const profile = localStorage.getItem("operaly_assistant_profile")
        if (profile) {
          const parsed = JSON.parse(profile)
          if (parsed?.countryCode === "PE") { setPricing(PEN_PRICING); setLoading(false); return }
        }

        // 3. IP detection via free API (no key needed)
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const data = await res.json()
          const code = data?.country_code || data?.country || ""
          localStorage.setItem("operaly_country_code", code)
          if (code === "PE") { setPricing(PEN_PRICING); setLoading(false); return }
        }
      } catch {
        // Default to USD on any error
      }
      setPricing(USD_PRICING)
      setLoading(false)
    }
    detect()
  }, [])

  return { pricing, loading }
}
