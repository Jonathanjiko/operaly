import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type SearchParams = {
  status?: string
  collection_status?: string
  payment_id?: string
  paymentId?: string
  preapproval_id?: string
  preapprovalId?: string
  external_reference?: string
  externalReference?: string
  merchant_order_id?: string
  merchantOrderId?: string
}

function normalizeStatus(searchParams: SearchParams) {
  const raw = String(
    searchParams.status ||
      searchParams.collection_status ||
      ""
  )
    .trim()
    .toLowerCase()

  if (["approved", "authorized", "success", "successful"].includes(raw)) {
    return "success"
  }

  if (["pending", "in_process", "inprocess"].includes(raw)) {
    return "pending"
  }

  if (["rejected", "failure", "failed", "cancelled", "canceled"].includes(raw)) {
    return "error"
  }

  return "pending"
}

function getStatusConfig(status: string) {
  if (status === "success") {
    return {
      title: "Pago recibido correctamente",
      description:
        "Tu checkout fue procesado y Operaly registrará la confirmación automáticamente cuando el proveedor termine de sincronizar el evento.",
      badge: "Confirmación recibida",
      icon: CheckCircle2,
      panelClass:
        "border-emerald-200 bg-emerald-50 text-emerald-900",
      iconWrapClass: "bg-emerald-100 text-emerald-700",
      points: [
        "El evento de pago debe quedar trazado en billing_intents.",
        "El webhook terminará de confirmar el estado en backend.",
        "Cuando aplique, el plan o add-on se activará automáticamente.",
      ],
    }
  }

  if (status === "error") {
    return {
      title: "No se pudo completar el pago",
      description:
        "La operación no terminó correctamente o fue cancelada. Puedes intentarlo otra vez sin perder el contexto de tu cuenta.",
      badge: "Pago no completado",
      icon: AlertCircle,
      panelClass:
        "border-red-200 bg-red-50 text-red-900",
      iconWrapClass: "bg-red-100 text-red-700",
      points: [
        "No se confirmó un cobro exitoso.",
        "Puedes volver al checkout y reintentar con el mismo plan.",
        "Si el problema persiste, revisaremos el intento desde billing_intents.",
      ],
    }
  }

  return {
    title: "Tu pago está siendo procesado",
    description:
      "La operación quedó en estado pendiente. Operaly actualizará el resultado final cuando Mercado Pago confirme el evento correspondiente.",
    badge: "Procesando confirmación",
    icon: Clock3,
    panelClass:
      "border-amber-200 bg-amber-50 text-amber-900",
    iconWrapClass: "bg-amber-100 text-amber-700",
    points: [
      "El proveedor todavía no marcó el cobro como finalizado.",
      "El webhook de backend cerrará el estado real del intento.",
      "No necesitas repetir el pago mientras siga pendiente.",
    ],
  }
}

export default async function PagoResultadoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const normalizedStatus = normalizeStatus(params)
  const config = getStatusConfig(normalizedStatus)
  const StatusIcon = config.icon

  const paymentId = params.payment_id || params.paymentId || null
  const preapprovalId = params.preapproval_id || params.preapprovalId || null
  const externalReference =
    params.external_reference || params.externalReference || null
  const merchantOrderId =
    params.merchant_order_id || params.merchantOrderId || null

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0F1F63_0%,#162C8A_65%,#2440BF_100%)] px-6 py-8 md:px-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Resultado del checkout
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Estado de tu operación
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-[15px]">
                Esta pantalla resume el estado devuelto por la pasarela y sirve
                como punto de continuidad mientras el backend termina de sincronizar
                el evento real del cobro.
              </p>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className={`rounded-[28px] border p-5 md:p-6 ${config.panelClass}`}>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconWrapClass}`}
                    >
                      <StatusIcon className="h-7 w-7" />
                    </div>

                    <div>
                      <div className="inline-flex items-center rounded-full border border-current/10 bg-white/50 px-3 py-1 text-[11px] font-medium">
                        {config.badge}
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold">
                        {config.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 opacity-90">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {config.points.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/50 bg-white/60 px-4 py-3"
                    >
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                      <p className="text-sm leading-6">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">
                    Identificadores del proveedor
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Status recibido
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {normalizedStatus}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Payment ID
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {paymentId || "No informado"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Preapproval ID
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {preapprovalId || "No informado"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      External reference
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {externalReference || "No informada"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Merchant order ID
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {merchantOrderId || "No informado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-6">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Siguientes acciones
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Continúa desde una ruta clara sin perder el contexto del cobro.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <Button
                  asChild
                  className="h-14 w-full rounded-2xl bg-[#0F1F63] px-6 text-base font-medium text-white hover:bg-[#12297f]"
                >
                  <Link href="/dashboard/professional/configuracion">
                    Ir a configuración y facturación
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-slate-300 text-base"
                >
                  <Link href="/iniciar-pago?plan=pro">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Volver al checkout
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-slate-300 text-base"
                >
                  <Link href="/dashboard/professional">
                    <Home className="mr-2 h-4 w-4" />
                    Ir al dashboard
                  </Link>
                </Button>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Qué valida Operaly internamente
              </p>

              <div className="mt-4 space-y-3">
                {[
                  "El backend registra cada intento en billing_intents.",
                  "Las métricas owner consumen ese funnel en tiempo real.",
                  "La activación final debe cerrarse con webhook y confirmación del proveedor.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    </div>
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
