export type SupportedLanguage = "es" | "en" | "pt" | "de" | "fr" | "it"

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["es", "en", "pt", "de", "fr", "it"]

export const COUNTRY_DIAL_CODES: Record<string, string> = {
  PE: "51",
  MX: "52",
  CO: "57",
  AR: "54",
  CL: "56",
  EC: "593",
  ES: "34",
  US: "1",
  CA: "1",
  GB: "44",
  BR: "55",
  FR: "33",
  DE: "49",
  IT: "39",
  PT: "351",
}

export function resolveLanguageCode(value: string | null | undefined): SupportedLanguage {
  const normalized = String(value || "es").trim().toLowerCase() as SupportedLanguage
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "es"
}

export function localeFromLanguage(value: string | null | undefined) {
  const language = resolveLanguageCode(value)

  switch (language) {
    case "en":
      return "en-US"
    case "pt":
      return "pt-BR"
    case "de":
      return "de-DE"
    case "fr":
      return "fr-FR"
    case "it":
      return "it-IT"
    case "es":
    default:
      return "es-PE"
  }
}

export function labelForLanguage(value: string | null | undefined) {
  switch (resolveLanguageCode(value)) {
    case "en":
      return "English"
    case "pt":
      return "Português"
    case "de":
      return "Deutsch"
    case "fr":
      return "Français"
    case "it":
      return "Italiano"
    case "es":
    default:
      return "Español"
  }
}

export function normalizeInternationalPhone(input: string, fallbackCountryCode = "PE") {
  const raw = String(input || "").trim()
  const sanitized = raw.replace(/[^\d+]/g, "")

  if (!sanitized) {
    return {
      ok: false,
      normalized: "",
      helperText: "Ingresa un teléfono para guardarlo.",
    }
  }

  if (sanitized.startsWith("+")) {
    const digits = sanitized.slice(1).replace(/\D/g, "")
    if (digits.length < 7 || digits.length > 15) {
      return {
        ok: false,
        normalized: "",
        helperText: "Usa un formato internacional válido entre 7 y 15 dígitos.",
      }
    }

    return {
      ok: true,
      normalized: `+${digits}`,
      helperText: `Se guardará como +${digits}.`,
    }
  }

  const localDigits = sanitized.replace(/\D/g, "")
  const dial = COUNTRY_DIAL_CODES[String(fallbackCountryCode || "PE").toUpperCase()]

  if (!dial) {
    return {
      ok: false,
      normalized: "",
      helperText: "Agrega el código país con + para evitar errores.",
    }
  }

  const normalized = `+${dial}${localDigits.replace(/^0+/, "")}`
  return {
    ok: true,
    normalized,
    helperText: `Se normalizará automáticamente como ${normalized}.`,
  }
}
