"use client"

import { useState, Suspense } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft, Check, Building2, Briefcase, Globe, Package, Wrench, MapPin, Phone, Upload, User } from "lucide-react"

const productCategories = [
  { id: "hardware", label: "Ferretería" },
  { id: "bookstore", label: "Librería" },
  { id: "clothing", label: "Ropa" },
  { id: "footwear", label: "Calzado" },
  { id: "accessories", label: "Accesorios" },
  { id: "technology", label: "Tecnología" },
  { id: "food", label: "Alimentos / Bebidas" },
  { id: "other", label: "Otros" },
]

const serviceCategories = [
  { id: "travel", label: "Agencia de viajes" },
  { id: "education", label: "Educación / Cursos" },
  { id: "accounting", label: "Servicios contables" },
  { id: "consulting", label: "Consultoría" },
  { id: "workshop", label: "Talleres" },
  { id: "veterinary", label: "Veterinaria" },
  { id: "medical", label: "Rubro médico" },
  { id: "agency", label: "Agencia" },
  { id: "restaurant", label: "Restaurante / Cafetería" },
  { id: "salon", label: "Salón de belleza" },
  { id: "other", label: "Otros" },
]

const professionalCategories = [
  { id: "law", label: "Abogado" },
  { id: "medical", label: "Médico" },
  { id: "psychology", label: "Psicólogo" },
  { id: "consulting", label: "Consultor" },
  { id: "coach", label: "Coach" },
  { id: "accountant", label: "Contador" },
  { id: "architect", label: "Arquitecto" },
  { id: "engineer", label: "Ingeniero" },
  { id: "other", label: "Otro" },
]

const languages = [
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "pt", label: "Português", flag: "🇧🇷" },
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "de", label: "Deutsch", flag: "🇩🇪" },
  { id: "it", label: "Italiano", flag: "🇮🇹" },
]

const countries = [
  { id: "pe", label: "Perú", flag: "🇵🇪" },
  { id: "mx", label: "México", flag: "🇲🇽" },
  { id: "co", label: "Colombia", flag: "🇨🇴" },
  { id: "ar", label: "Argentina", flag: "🇦🇷" },
  { id: "cl", label: "Chile", flag: "🇨🇱" },
  { id: "ec", label: "Ecuador", flag: "🇪🇨" },
  { id: "es", label: "España", flag: "🇪🇸" },
  { id: "us", label: "Estados Unidos", flag: "🇺🇸" },
  { id: "other", label: "Otro", flag: "🌍" },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountType = searchParams.get("type") || "professional"
  const isBusiness = accountType === "business"
  
  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState<"products" | "services" | "">("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("es")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")

  // For business: 6 steps, for professional: 5 steps
  const totalSteps = isBusiness ? 6 : 5

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      router.push(`/connect-whatsapp?type=${accountType}`)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push("/select-account-type")
    }
  }

  const canContinue = () => {
    if (isBusiness) {
      switch (step) {
        case 1: return businessName.length > 0
        case 2: return businessType !== ""
        case 3: return selectedCategory.length > 0
        case 4: return selectedCountry.length > 0 && city.length > 0
        case 5: return phone.length > 0
        case 6: return selectedLanguage.length > 0
        default: return false
      }
    } else {
      switch (step) {
        case 1: return businessName.length > 0
        case 2: return selectedCategory.length > 0
        case 3: return selectedCountry.length > 0 && city.length > 0
        case 4: return phone.length > 0
        case 5: return selectedLanguage.length > 0
        default: return false
      }
    }
  }

  const getStepContent = () => {
    const businessSteps = [
      { num: 1, content: renderNameStep() },
      { num: 2, content: renderBusinessTypeStep() },
      { num: 3, content: renderCategoryStep() },
      { num: 4, content: renderLocationStep() },
      { num: 5, content: renderPhoneStep() },
      { num: 6, content: renderLanguageStep() },
    ]
    
    const professionalSteps = [
      { num: 1, content: renderNameStep() },
      { num: 2, content: renderCategoryStep() },
      { num: 3, content: renderLocationStep() },
      { num: 4, content: renderPhoneStep() },
      { num: 5, content: renderLanguageStep() },
    ]

    const steps = isBusiness ? businessSteps : professionalSteps
    return steps.find(s => s.num === step)?.content
  }

  const renderNameStep = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isBusiness 
            ? "bg-gradient-to-br from-[#34D399] to-[#06B6D4]" 
            : "bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]"
        }`}>
          {isBusiness ? (
            <Building2 className="w-7 h-7 text-white" />
          ) : (
            <User className="w-7 h-7 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F63]">
            {isBusiness ? "Nombre de tu negocio" : "Tu nombre profesional"}
          </h2>
          <p className="text-muted-foreground">
            {isBusiness 
              ? "Este nombre aparecerá en las conversaciones con tus clientes."
              : "Este nombre usará Sofía para identificarte."}
          </p>
        </div>
      </div>

      <Input
        type="text"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        placeholder={isBusiness ? "Ej: Restaurante El Buen Sabor" : "Ej: Dr. Juan Pérez"}
        className="h-14 rounded-xl text-lg"
      />
    </div>
  )

  const renderBusinessTypeStep = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F1F63] mb-2">
          ¿Qué ofrece tu negocio?
        </h2>
        <p className="text-muted-foreground">
          Esto nos ayuda a configurar el catálogo y las funciones adecuadas.
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setBusinessType("products")}
          className={`flex items-center gap-5 p-6 rounded-2xl border text-left transition-all ${
            businessType === "products"
              ? "border-[#34D399] bg-[#34D399]/5 ring-2 ring-[#34D399]/20"
              : "border-border hover:border-[#34D399]/50 hover:bg-secondary/50"
          }`}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            businessType === "products" ? "bg-[#34D399]" : "bg-secondary"
          }`}>
            <Package className={`w-7 h-7 ${businessType === "products" ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${businessType === "products" ? "text-[#047857]" : "text-foreground"}`}>
              Productos
            </h3>
            <p className="text-sm text-muted-foreground">
              Vendo artículos físicos como ropa, tecnología, alimentos, etc.
            </p>
          </div>
          {businessType === "products" && <Check className="w-6 h-6 text-[#34D399]" />}
        </button>

        <button
          onClick={() => setBusinessType("services")}
          className={`flex items-center gap-5 p-6 rounded-2xl border text-left transition-all ${
            businessType === "services"
              ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20"
              : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
          }`}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            businessType === "services" ? "bg-[#3B82F6]" : "bg-secondary"
          }`}>
            <Wrench className={`w-7 h-7 ${businessType === "services" ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${businessType === "services" ? "text-[#1E40AF]" : "text-foreground"}`}>
              Servicios
            </h3>
            <p className="text-sm text-muted-foreground">
              Ofrezco servicios como consultas, cursos, reservas, etc.
            </p>
          </div>
          {businessType === "services" && <Check className="w-6 h-6 text-[#3B82F6]" />}
        </button>
      </div>
    </div>
  )

  const renderCategoryStep = () => {
    const categories = isBusiness 
      ? (businessType === "products" ? productCategories : serviceCategories)
      : professionalCategories
    
    const accentColor = isBusiness 
      ? (businessType === "products" ? "#34D399" : "#3B82F6")
      : "#3B82F6"

    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0F1F63] mb-2">
            {isBusiness ? "Categoría de tu negocio" : "Tu especialidad"}
          </h2>
          <p className="text-muted-foreground">
            Esto nos ayuda a personalizar Sofía para tu contexto específico.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedCategory === category.id
                  ? `border-[${accentColor}] bg-[${accentColor}]/5 ring-2 ring-[${accentColor}]/20`
                  : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
              }`}
              style={selectedCategory === category.id ? {
                borderColor: accentColor,
                backgroundColor: `${accentColor}10`,
              } : {}}
            >
              <span className={`text-sm font-medium ${
                selectedCategory === category.id ? "text-[#0F1F63]" : "text-foreground"
              }`}>
                {category.label}
              </span>
              {selectedCategory === category.id && (
                <Check className="w-4 h-4 mt-1" style={{ color: accentColor }} />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderLocationStep = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F63]">
            Tu ubicación
          </h2>
          <p className="text-muted-foreground">
            Esto nos ayuda a personalizar la experiencia para tu región.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">País</label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                  selectedCountry === country.id
                    ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20"
                    : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span className={`text-sm font-medium ${
                  selectedCountry === country.id ? "text-[#3B82F6]" : "text-foreground"
                }`}>
                  {country.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Ciudad</label>
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ej: Lima, Ciudad de México, Bogotá"
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
          <h2 className="text-2xl font-bold text-[#0F1F63]">
            Número de teléfono
          </h2>
          <p className="text-muted-foreground">
            Este será el número que conectarás con WhatsApp Business.
          </p>
        </div>
      </div>

      <Input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+51 999 999 999"
        className="h-14 rounded-xl text-lg"
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Asegúrate de que este número esté activo y pueda recibir mensajes de WhatsApp.
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
          <h2 className="text-2xl font-bold text-[#0F1F63]">
            Idioma principal
          </h2>
          <p className="text-muted-foreground">
            Sofía usará este idioma para comunicarse con tus clientes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {languages.map((language) => (
          <button
            key={language.id}
            onClick={() => setSelectedLanguage(language.id)}
            className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${
              selectedLanguage === language.id
                ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-2 ring-[#3B82F6]/20"
                : "border-border hover:border-[#3B82F6]/50 hover:bg-secondary/50"
            }`}
          >
            <span className="text-3xl">{language.flag}</span>
            <span className={`font-medium ${
              selectedLanguage === language.id ? "text-[#3B82F6]" : "text-foreground"
            }`}>
              {language.label}
            </span>
            {selectedLanguage === language.id && (
              <Check className="w-5 h-5 text-[#3B82F6] ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#3B82F6]/10 via-[#06B6D4]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/operaly-logo.png"
            alt="Operaly"
            width={140}
            height={140}
            className="h-12 w-auto mx-auto mb-6"
          />
        </div>

        {/* Progress bar */}
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

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-10">
          {getStepContent()}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
