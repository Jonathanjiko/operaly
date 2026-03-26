export const ASSISTANT_PROFESSIONS = [
  { code: "abogado", label: "Abogado" },
  { code: "medico", label: "Médico" },
  { code: "psicologo", label: "Psicólogo" },
  { code: "consultor", label: "Consultor" },
  { code: "coach", label: "Coach" },
  { code: "contador", label: "Contador" },
  { code: "arquitecto", label: "Arquitecto" },
  { code: "ingeniero", label: "Ingeniero" },
  { code: "otro", label: "Otro" },
]

export const ASSISTANT_COUNTRIES = [
  { code: "PE", label: "Perú" },
  { code: "MX", label: "México" },
  { code: "CO", label: "Colombia" },
  { code: "AR", label: "Argentina" },
  { code: "CL", label: "Chile" },
  { code: "EC", label: "Ecuador" },
  { code: "ES", label: "España" },
  { code: "US", label: "Estados Unidos" },
  { code: "OT", label: "Otro" },
]

export const ASSISTANT_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
]

const COUNTRY_DIAL_CODES: Record<string, string> = {
  PE: "51",
  MX: "52",
  CO: "57",
  AR: "54",
  CL: "56",
  EC: "593",
  ES: "34",
  US: "1",
}

export function normalizePhone(input: string, countryCode: string) {
  const raw = (input || "").trim()

  if (!raw) {
    return {
      ok: false,
      value: "",
      error: "Ingresa tu número de teléfono.",
    }
  }

  const cleaned = raw.replace(/[^\d+]/g, "")

  const COUNTRY_RULES: Record<
    string,
    { dial: string; nationalMin: number; nationalMax: number }
  > = {
    PE: { dial: "51", nationalMin: 9, nationalMax: 9 },
    MX: { dial: "52", nationalMin: 10, nationalMax: 10 },
    CO: { dial: "57", nationalMin: 10, nationalMax: 10 },
    AR: { dial: "54", nationalMin: 10, nationalMax: 10 },
    CL: { dial: "56", nationalMin: 9, nationalMax: 9 },
    EC: { dial: "593", nationalMin: 9, nationalMax: 9 },
    ES: { dial: "34", nationalMin: 9, nationalMax: 9 },
    US: { dial: "1", nationalMin: 10, nationalMax: 10 },
  }

  const rule = COUNTRY_RULES[countryCode]

  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1).replace(/\D/g, "")

    if (digits.length < 8 || digits.length > 15) {
      return {
        ok: false,
        value: "",
        error: "Tu número con código país debe tener entre 8 y 15 dígitos.",
      }
    }

    if (rule && digits.startsWith(rule.dial)) {
      const national = digits.slice(rule.dial.length)

      if (
        national.length < rule.nationalMin ||
        national.length > rule.nationalMax
      ) {
        return {
          ok: false,
          value: "",
          error: `El número no coincide con el formato esperado para ${countryCode}.`,
        }
      }
    }

    return {
      ok: true,
      value: `+${digits}`,
      error: "",
    }
  }

  const localDigits = cleaned.replace(/\D/g, "")

  if (!rule) {
    return {
      ok: false,
      value: "",
      error: "Selecciona un país válido o escribe tu número con +código país.",
    }
  }

  if (
    localDigits.length < rule.nationalMin ||
    localDigits.length > rule.nationalMax
  ) {
    return {
      ok: false,
      value: "",
      error: `El número no coincide con el formato esperado para ${countryCode}.`,
    }
  }

  return {
    ok: true,
    value: `+${rule.dial}${localDigits}`,
    error: "",
  }
}
