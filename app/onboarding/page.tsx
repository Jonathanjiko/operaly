"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Globe, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const professionalCategories = [
  { id: "law", label: "Abogado" },
  { id: "medical", label: "Medico" },
  { id: "psychology", label: "Psicologo" },
  { id: "consulting", label: "Consultor" },
  { id: "coach", label: "Coach" },
  { id: "accountant", label: "Contador" },
  { id: "architect", label: "Arquitecto" },
  { id: "engineer", label: "Ingeniero" },
  { id: "other", label: "Otro" },
]

const languages = [
  { id: "es", label: "Espanol", flag: "ES" },
  { id: "en", label: "English", flag: "EN" },
  { id: "pt", label: "Portugues", flag: "PT" },
  { id: "fr", label: "Francais", flag: "FR" },
  { id: "de", label: "Deutsch", flag: "DE" },
  { id: "it", label: "Italiano", flag: "IT" },
]

const countries = [
  { id: "pe", label: "Peru" },
  { id: "mx", label: "Mexico" },
  { id: "co", label: "Colombia" },
  { id: "ar", label: "Argentina" },
  { id: "cl", label: "Chile" },
  { id: "ec", label: "Ecuador" },
  { id: "es", label: "Espana" },
  { id: "us", label: "Estados Unidos" },
  { id: "other", label: "Otro" },
]

function OnboardingContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [professionalName, setProfessionalName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("es")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")

  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      return
    }

    router.push("/connect-whatsapp?type=professional")
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      return
    }

    router.push("/select-account-type")
  }

  const canContinue = () => {
    switch (step) {
      case 1:
        return professionalName.length > 0
      case 2:
        return selectedCategory.length > 0
      case 3:
        return selectedCountry.length > 0 && city.length > 0
      case 4:
        return phone.length > 0
      case 5:
        return selectedLanguage.length > 0
      default:
        return false
    }
  }

  const renderNameStep = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F63]">Tu nombre profesional</h2>
          <p className="text-muted-foreground">
            Este nombre usara Operaly para identificarte y personalizar tu operacion.
          </p>
        </div>
      </div>

      <Input
        type="text"
        value={professionalName}
        onChange={(event) => setProfessionalName(event.target.value)}
        placeholder="Ej: Dr. Juan Perez"
        className="h-14 rounded-xl text-lg"
      />
    </div>
  )

  const renderCategoryStep = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F1F63] mb-2">Tu especialidad</h2>
        <p className="text-muted-foreground">
          Esto ayuda a personalizar Operaly para tu contexto profesional.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {professionalCategories.map((category) => {
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20"
                  : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
              }`}
            >
              <span className={`text-sm font-medium ${isSelected ? "text-[#3B82F6]" : "text-foreground"}`}>
                {category.label}
              </span>
              {isSelected ? <Check className="w-4 h-4 mt-1 text-[#3B82F6]" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderLocationStep = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F63]">Tu ubicacion</h2>
          <p className="text-muted-foreground">
            Esto ayuda a personalizar la experiencia para tu region.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Pais</label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map((country) => {
              const isSelected = selectedCountry === country.id

              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => setSelectedCountry(country.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                    isSelected
                      ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20"
                      : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? "text-[#3B82F6]" : "text-foreground"}`}>
                    {country.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Ciudad</label>
          <Input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ej: Lima, Ciudad de Mexico, Bogota"
            className="h-14 rounded-xl text-lg"
          />
        </div>
      </div>
    </div>
  )

  const renderPhoneStep = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center">
          <Phone className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F63]">Numero de telefono</h2>
          <p className="text-muted-foreground">
            Este sera el numero que conectaras con WhatsApp.
          </p>
        </div>
      </div>

      <Input
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="+51 999 999 999"
        className="h-14 rounded-xl text-lg"
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Asegurate de que este numero este activo y pueda recibir mensajes de WhatsApp.
      </p>
    </div>
  )

  const renderLanguageStep = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
          <Globe className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F63]">Idioma principal</h2>
          <p className="text-muted-foreground">
            Operaly usara este idioma como base para tu operacion.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {languages.map((language) => {
          const isSelected = selectedLanguage === language.id

          return (
            <button
              key={language.id}
              type="button"
              onClick={() => setSelectedLanguage(language.id)}
              className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${
                isSelected
                  ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20"
                  : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
              }`}
            >
              <span className="text-sm font-semibold text-muted-foreground">{language.flag}</span>
              <span className={`font-medium ${isSelected ? "text-[#3B82F6]" : "text-foreground"}`}>
                {language.label}
              </span>
              {isSelected ? <Check className="w-5 h-5 text-[#3B82F6] ml-auto" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )

  const steps = [
    renderNameStep(),
    renderCategoryStep(),
    renderLocationStep(),
    renderPhoneStep(),
    renderLanguageStep(),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#3B82F6]/10 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={140}
            height={140}
            className="h-12 w-auto mx-auto mb-6"
          />
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Paso {step} de {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-10">
          {steps[step - 1]}

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Atras
            </button>

            <Button
              onClick={handleNext}
              disabled={!canContinue()}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 text-white font-semibold disabled:opacity-50"
            >
              {step === totalSteps ? "Continuar" : "Siguiente"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}
