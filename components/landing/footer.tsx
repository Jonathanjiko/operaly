import Image from "next/image"

export function Footer() {
  const footerLinks = {
    Producto: [
      { label: "Funcionalidades", href: "#funciones" },
      { label: "Precios", href: "#precios" },
      { label: "Integraciones", href: "#" },
      { label: "API", href: "#" },
    ],
    Soluciones: [
      { label: "Para Profesionales", href: "#soluciones" },
      { label: "Para Empresas", href: "#soluciones" },
      { label: "Para Clínicas", href: "#" },
      { label: "Para Restaurantes", href: "#" },
    ],
    Recursos: [
      { label: "Blog", href: "#" },
      { label: "Centro de ayuda", href: "#" },
      { label: "Tutoriales", href: "#" },
      { label: "Casos de éxito", href: "#" },
    ],
    Empresa: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Contacto", href: "#" },
      { label: "Empleo", href: "#" },
      { label: "Prensa", href: "#" },
    ],
  }

  return (
    <footer className="bg-[#0F1F63] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-4">
              <Image 
                src="/images/operaly-logo.png" 
                alt="Operaly" 
                width={140} 
                height={140}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-white/60 text-sm max-w-xs mb-6">
              El asistente de IA para WhatsApp que transforma la forma en que gestionas tu negocio.
            </p>
            <div className="flex items-center gap-3">
              {/* Social icons */}
              {[
                { name: "instagram", href: "#", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /> },
                { name: "tiktok", href: "#", icon: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /> },
                { name: "linkedin", href: "#", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
                { name: "x", href: "#", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={social.name}
                >
                  <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal credibility & Languages */}
        <div className="py-8 border-t border-white/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Credibility note */}
            <div className="text-sm text-white/50 space-y-1">
              <p>
                Operaly es un producto desarrollado por{" "}
                <span className="text-white/70 font-medium">Alderete Yangali Group Holding SAC</span>, 
                empresa con base en Perú.
              </p>
              <p>Disponible para Latinoamérica y el mundo.</p>
            </div>
            
            {/* Supported languages */}
            <div className="flex flex-col md:items-end gap-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Idiomas disponibles</p>
              <div className="flex flex-wrap gap-2">
                {["Español", "English", "Português", "Français", "Deutsch", "Italiano"].map((lang) => (
                  <span 
                    key={lang} 
                    className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white/70"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © 2026 Operaly. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              Términos de servicio
            </a>
            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
