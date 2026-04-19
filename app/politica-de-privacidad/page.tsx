const sections = [
  {
    title: "1. Responsable del tratamiento",
    body: [
      "Operaly es un servicio operado por una empresa peruana. Para cualquier consulta sobre privacidad o tratamiento de datos personales puede escribir a support@operaly.app.",
      "Tratamos datos personales en cumplimiento de la normativa aplicable, incluida la legislación peruana y, cuando corresponda, otras reglas obligatorias que protejan al usuario en su jurisdicción.",
    ],
  },
  {
    title: "2. Qué datos podemos tratar",
    body: [
      "Podemos tratar datos de identificación, contacto, facturación, actividad dentro del servicio, preferencias, historial de uso, información operativa y datos necesarios para integraciones activadas por usted.",
      "También podemos tratar archivos, mensajes, audios, recordatorios, listas, correos o metadatos relacionados con la prestación del servicio, siempre dentro del alcance funcional autorizado por el usuario.",
    ],
  },
  {
    title: "3. Para qué usamos sus datos",
    body: [
      "Usamos sus datos para crear y administrar la cuenta, prestar el servicio, procesar pagos, aplicar límites del plan, mantener trazabilidad operativa, mejorar la experiencia y atender solicitudes de soporte.",
      "También podemos usarlos para seguridad, prevención de abuso, auditoría interna, cumplimiento legal y mejora del producto.",
    ],
  },
  {
    title: "4. Base de legitimación",
    body: [
      "Tratamos datos porque son necesarios para ejecutar el contrato del servicio, cumplir obligaciones legales, atender intereses legítimos del negocio o en función del consentimiento cuando corresponda.",
      "Cuando una función dependa de una integración externa o de un permiso específico, Operaly utilizará solo los accesos necesarios para el fin solicitado.",
    ],
  },
  {
    title: "5. Integraciones y terceros",
    body: [
      "Operaly puede apoyarse en terceros para infraestructura, mensajería, voz, pagos, almacenamiento y herramientas conectadas por el usuario. Cada uno de esos proveedores actúa conforme a sus propias políticas y estándares.",
      "Cuando usted active integraciones como correo, calendario o almacenamiento externo, entiende que Operaly procesará la información necesaria para ejecutar las acciones que usted solicite.",
    ],
  },
  {
    title: "6. Conservación y seguridad",
    body: [
      "Conservamos la información durante el tiempo necesario para prestar el servicio, cumplir obligaciones legales, resolver incidencias, mantener trazabilidad y proteger la seguridad de la plataforma.",
      "Aplicamos medidas técnicas y organizativas razonables para proteger la confidencialidad, integridad y disponibilidad de la información.",
    ],
  },
  {
    title: "7. Derechos del usuario",
    body: [
      "Puede solicitar acceso, rectificación, actualización, oposición o eliminación de sus datos en la medida permitida por la ley aplicable.",
      "Para ejercer derechos o hacer consultas, escríbanos a support@operaly.app y atenderemos su caso por el canal correspondiente.",
    ],
  },
  {
    title: "8. Transferencias y cambios",
    body: [
      "Algunos proveedores pueden procesar información fuera de su país. Cuando eso ocurra, Operaly procurará adoptar salvaguardas razonables conforme al marco legal aplicable.",
      "Esta política puede actualizarse cuando el producto, las integraciones, la normativa o la estructura operativa lo requieran. La versión vigente será la publicada en este sitio.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EEF5FF_0%,#FFFFFF_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[36px] border border-[#DCE7F5] bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,31,99,0.35)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">Operaly · Privacidad</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#0F1F63] sm:text-5xl">
            Política de privacidad
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Queremos que tenga claro qué información tratamos, para qué la usamos y qué control mantiene sobre sus datos cuando utiliza Operaly desde WhatsApp, desde el panel o mediante integraciones activadas por usted.
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
