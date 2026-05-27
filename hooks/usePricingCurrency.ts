"use client"

import { useEffect, useState } from "react"
import {
  USD_TO_PEN_RATE,
  formatCatalogMoney,
  formatMoney,
  formatRegionalMoneyFromPen,
  getRegionalDisplayCurrency,
  toPenAmount,
  toRegionalDisplayAmount,
  type SupportedCurrency,
} from "@/lib/pricing"

export type PricingCurrency = SupportedCurrency

export type PricingConfig = {
  currency: PricingCurrency
  exchangeRatePenPerUsd: number
  formatCatalogMoney: (
    amount: number | string | null | undefined,
    storedCurrency?: string | null | undefined
  ) => string
  formatDisplayFromPen: (amountPen: number | string | null | undefined) => string
  formatPen: (amountPen: number | string | null | undefined) => string
  toDisplayAmountFromPen: (amountPen: number | string | null | undefined) => number
  toPenAmount: (
    amount: number | string | null | undefined,
    storedCurrency?: string | null | undefined
  ) => number
}

function createPricingConfig(isPeru: boolean): PricingConfig {
  const currency = getRegionalDisplayCurrency(isPeru)

  return {
    currency,
    exchangeRatePenPerUsd: USD_TO_PEN_RATE,
    formatCatalogMoney: (amount, storedCurrency) =>
      formatCatalogMoney(amount, storedCurrency, isPeru),
    formatDisplayFromPen: (amountPen) => formatRegionalMoneyFromPen(amountPen, isPeru),
    formatPen: (amountPen) => formatMoney("PEN", amountPen, "es-PE"),
    toDisplayAmountFromPen: (amountPen) => toRegionalDisplayAmount(amountPen, isPeru),
    toPenAmount: (amount, storedCurrency) => toPenAmount(amount, storedCurrency),
  }
}

export function usePricingCurrency(): { pricing: PricingConfig; loading: boolean; isPeru: boolean } {
  const [isPeru, setIsPeru] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detect = async () => {
      try {
        const cached = localStorage.getItem("operaly_country_code")
        if (cached) {
          setIsPeru(cached === "PE")
          setLoading(false)
          return
        }

        const profile = localStorage.getItem("operaly_assistant_profile")
        if (profile) {
          const parsed = JSON.parse(profile)
          if (parsed?.countryCode) {
            const countryCode = String(parsed.countryCode).toUpperCase()
            localStorage.setItem("operaly_country_code", countryCode)
            setIsPeru(countryCode === "PE")
            setLoading(false)
            return
          }
        }

        const response = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(3000),
        })

        if (response.ok) {
          const payload = await response.json()
          const countryCode = String(payload?.country_code || "").toUpperCase()
          localStorage.setItem("operaly_country_code", countryCode)
          setIsPeru(countryCode === "PE")
        }
      } catch {
        setIsPeru(false)
      }

      setLoading(false)
    }

    void detect()
  }, [])

  return {
    pricing: createPricingConfig(isPeru),
    loading,
    isPeru,
  }
}
