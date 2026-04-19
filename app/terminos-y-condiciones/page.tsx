const sections = [
  {
    title: "1. Aceptación del servicio",
    body: [
      "Al registrarse, acceder o usar Operaly, usted acepta estos términos y condiciones, así como nuestras políticas complementarias de privacidad y cookies.",
      "Si utiliza Operaly en representación de una empresa, declara que tiene facultades suficientes para obligarla conforme a estos términos.",
    ],
  },
  {
    title: "2. Qué es Operaly",
    body: [
      "Operaly es un servicio digital operado por una empresa peruana que ayuda a ordenar tareas, agenda, recordatorios, correos, contactos, documentos, llamadas y seguimientos desde canales como WhatsApp y desde un panel privado.",
      "El servicio puede apoyarse en proveedores e integraciones externas para prestar determinadas funciones, incluyendo mensajería, voz, pagos, almacenamiento e integraciones de terceros.",
    ],
  },
  {
    title: "3. Cuenta, acceso y responsabilidad",
    body: [
      "Usted es responsable de mantener la confidencialidad de sus credenciales, de la información de su cuenta y del uso que se haga desde ella.",
      "Operaly puede suspender o restringir el acceso cuando detecte actividades que comprometan la seguridad, infrinjan estos términos o afecten la continuidad del servicio.",
    ],
  },
  {
    title: "4. Planes, pagos y extras",
    body: [
      "Operaly ofrece planes de uso y también extras o ampliaciones según el producto vigente. El detalle aplicable se informa en el sitio web, en el panel y en el flujo de compra correspondiente.",
      "Los cobros recurrentes se procesan de forma periódica según el plan o la ampliación mensual activa. Los extras de pago único tienen la vigencia que se indique antes de la compra.",
    ],
  },
  {
    title: "5. Uso permitido",
    body: [
      "No puede usar Operaly para actividades ilícitas, fraudes, suplantación, spam, acoso, vulneración de derechos de terceros o tratamiento de información sin base legítima.",
      "Tampoco puede intentar descompilar, afectar la disponibilidad del servicio o interferir con su funcionamiento normal.",
    ],
  },
  {
    title: "6. Datos, contenido e integraciones",
    body: [
      "Usted conserva la titularidad del contenido que suba o gestione mediante Operaly. Nos autoriza únicamente a tratarlo en la medida necesaria para prestar el servicio y mantener su funcionamiento.",
      "Cuando conecte integraciones de terceros, como herramientas de correo, calendario o almacenamiento, acepta también las reglas y limitaciones impuestas por esos proveedores.",
    ],
  },
  {
    title: "7. Disponibilidad y mejoras",
    body: [
      "Operaly procura mantener una experiencia estable y segura, pero no garantiza disponibilidad ininterrumpida ni ausencia total de errores.",
      "Podemos actualizar funciones, límites, experiencia visual, proveedores y componentes del servicio para mejorar el producto o para cumplir exigencias técnicas, legales o de seguridad.",
    ],
  },
  {
    title: "8. Limitación de responsabilidad",
    body: [
      "En la máxima medida permitida por la ley peruana aplicable, Operaly no será responsable por daños indirectos, lucro cesante, pérdida de oportunidad o efectos derivados del uso de proveedores externos o integraciones de terceros.",
      "Nada de lo anterior limita derechos que no puedan ser válidamente excluidos por la normativa de protección al consumidor o por la legislación aplicable.",
    ],
  },
  {
    title: "9. Ley aplicable y contacto",
    body: [
      "Estos términos se interpretan conforme a la legislación de la República del Perú, sin perjuicio de la normativa imperativa que resulte aplicable a usuarios de otros países.",
      "Si necesita contactarnos por estos términos, puede escribir a support@operaly.app o utilizar el formulario disponible en la sección de contacto.",
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EEF5FF_0%,#FFFFFF_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[36px] border border-[#DCE7F5] bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,31,99,0.35)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">Operaly · Legal</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0F1F63] sm:text-5xl">
            Términos y condiciones
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Estas condiciones regulan el uso de Operaly en Perú y frente a usuarios de otros países. Buscan explicar de forma clara cómo funciona el servicio, qué responsabilidades asume cada parte y cómo se aplican los planes, pagos e integraciones.
          </p>

          <div className="mt-12 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FBFF] p-6">
                <h2 className="text-xl font-black text-[#0F1F63]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
