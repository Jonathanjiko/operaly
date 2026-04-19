import Image from "next/image"

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
]

export function Footer({ locale = "es" }: { locale?: string }) {
  return (
    <footer id="contacto" className="bg-[#0F1F63] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Image
              src="/images/operaly-logo.png"
              alt="Operaly"
              width={160}
              height={160}
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              El asistente de IA para WhatsApp que le ayuda a ordenar agenda, correos, contactos, documentos y pendientes en serio.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {languages.map((language) => (
                <a
                  key={language.code}
                  href={`/?lang=${language.code}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    locale === language.code
                      ? "bg-white text-[#0F1F63]"
                      : "bg-white/10 text-white/75 hover:bg-white/15"
                  }`}
                >
                  {language.label}
                </a>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              {["instagram", "facebook", "tiktok", "linkedin", "x"].map((social) => (
                <span
                  key={social}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white/80"
                >
                  {social === "facebook" ? "f" : social === "linkedin" ? "in" : social === "instagram" ? "ig" : social === "tiktok" ? "tt" : "x"}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Producto</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><a href="#producto" className="hover:text-white">Qué hace Operaly</a></li>
              <li><a href="#como-funciona" className="hover:text-white">Cómo funciona</a></li>
              <li><a href="#precios" className="hover:text-white">Planes</a></li>
              <li><a href="/dashboard" className="hover:text-white">Entrar al panel</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Recursos</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><a href="/contacto" className="hover:text-white">Contáctese con nosotros</a></li>
              <li><a href="mailto:support@operaly.app" className="hover:text-white">support@operaly.app</a></li>
              <li><a href="/libro-de-reclamaciones" className="hover:text-white">Libro de reclamaciones</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Empresa</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><a href="/aviso-legal" className="hover:text-white">Aviso legal</a></li>
              <li><a href="/terminos-y-condiciones" className="hover:text-white">Términos y condiciones</a></li>
              <li><a href="/politica-de-privacidad" className="hover:text-white">Política de privacidad</a></li>
              <li><a href="/cookies" className="hover:text-white">Cookies</a></li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Contacto directo</p>
            <p className="mt-3 text-2xl font-black leading-tight">Si necesita hablar con nosotros, aquí lo tiene fácil.</p>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Escríbanos o use el formulario. Queremos que Operaly le resuelva el día, no que le complique el soporte.
            </p>
            <div className="mt-5 grid gap-2">
              <a href="/contacto" className="inline-flex h-11 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0F1F63]">
                Abrir formulario
              </a>
              <a href="mailto:support@operaly.app" className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-white">
                support@operaly.app
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-sm text-white/50">
          © 2026 Operaly. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
