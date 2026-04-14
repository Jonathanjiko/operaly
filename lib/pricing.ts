export const USD_TO_PEN_RATE = 5

export type SupportedCurrency = "PEN" | "USD"

export function normalizeCurrency(value: string | null | undefined): SupportedCurrency {
  return String(value || "PEN").toUpperCase() === "USD" ? "USD" : "PEN"
}

export function toPenAmount(amount: number | string | null | undefined, currency?: string | null) {
  const numericAmount = Number(amount || 0)
  return normalizeCurrency(currency) === "USD" ? numericAmount * USD_TO_PEN_RATE : numericAmount
}

export function toRegionalDisplayAmount(
  amountPen: number | string | null | undefined,
  isPeru: boolean
) {
  const numericAmount = Number(amountPen || 0)
  return isPeru ? numericAmount : numericAmount / USD_TO_PEN_RATE
}

export function getRegionalDisplayCurrency(isPeru: boolean): SupportedCurrency {
  return isPeru ? "PEN" : "USD"
}

export function formatMoney(
  currency: SupportedCurrency,
  amount: number | string | null | undefined,
  locale?: string
) {
  const numericAmount = Number(amount || 0)
  const resolvedLocale =
    locale || (currency === "PEN" ? "es-PE" : "en-US")

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch {
    const symbol = currency === "PEN" ? "S/" : "$"
    return `${symbol}${numericAmount}`
  }
}

export function formatRegionalMoneyFromPen(
  amountPen: number | string | null | undefined,
  isPeru: boolean
) {
  const currency = getRegionalDisplayCurrency(isPeru)
  const amount = toRegionalDisplayAmount(amountPen, isPeru)
  return formatMoney(currency, amount)
}

export function formatCatalogMoney(
  amount: number | string | null | undefined,
  storedCurrency: string | null | undefined,
  isPeru: boolean
) {
  const amountPen = toPenAmount(amount, storedCurrency)
  return formatRegionalMoneyFromPen(amountPen, isPeru)
}
