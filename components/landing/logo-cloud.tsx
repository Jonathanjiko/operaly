export function LogoCloud() {
  const companies = [
    "Clínica Dental Sur",
    "Estudio Legal MX",
    "FitGym Pro",
    "Beauty Salón",
    "Auto Service",
    "Consultora ABC",
  ]

  return (
    <section className="py-12 border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          Más de 2,500 profesionales y empresas confían en Operaly
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <div
              key={company}
              className="text-lg font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
