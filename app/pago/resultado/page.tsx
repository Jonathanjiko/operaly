"use client"

import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2, XCircle, Clock, ArrowRight,
  RefreshCw, Sparkles, MessageSquare, LayoutDashboard,
} from "lucide-react"

type PaymentStatus = "approved" | "pending" | "rejected" | "loading"

function ResultContent() {
  const searchParams  = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>("loading")
  const [planCode, setPlanCode] = useState("")

  useEffect(() => {
    // MercadoPago returns: collection_status, status, payment_status
    const s = (
      searchParams.get("collection_status") ||
      searchParams.get("status") ||
      searchParams.get("payment_status") ||
      ""
    ).toLowerCase()
    const plan = searchParams.get("plan") || searchParams.get("external_reference") || ""
    setPlanCode(plan)

    if (s === "approved" || s === "authorized") setStatus("approved")
    else if (s === "pending" || s === "in_process") setStatus("pending")
    else if (s === "rejected" || s === "cancelled") setStatus("rejected")
    else setStatus("approved") // default optimistic for redirect back
  }, [searchParams])

  const configs = {
    approved: {
      icon:      CheckCircle2,
      iconColor: "#10B981",
      iconBg:    "bg-[#10B981]/10",
      title:     "¡Pago completado!",
      subtitle:  "Tu suscripción a Operaly está activa",
      message:   "Ya tienes acceso completo a tu asistente IA. En segundos recibirás un mensaje de Operaly en WhatsApp para empezar.",
      cta:       "/dashboard/professional",
      ctaLabel:  "Ir a mi dashboard",
      ctaIcon:   LayoutDashboard,
      secondary: null,
    },
    pending: {
      icon:      Clock,
      iconColor: "#F59E0B",
      iconBg:    "bg-[#F59E0B]/10",
      title:     "Pago en proceso",
      subtitle:  "Tu pago está siendo verificado",
      message:   "Mercado Pago está confirmando tu pago. Esto puede tomar unos minutos. Te avisaremos por WhatsApp cuando esté confirmado.",
      cta:       "/dashboard/professional",
      ctaLabel:  "Ver mi dashboard",
      ctaIcon:   LayoutDashboard,
      secondary: "/precios",
    },
    rejected: {
      icon:      XCircle,
      iconColor: "#EF4444",
      iconBg:    "bg-[#EF4444]/10",
      title:     "Pago no completado",
      subtitle:  "Hubo un problema con tu pago",
      message:   "No se pudo procesar el pago. Puedes intentarlo nuevamente o usar un método diferente.",
      cta:       "/precios",
      ctaLabel:  "Intentar de nuevo",
      ctaIcon:   RefreshCw,
      secondary: "/dashboard/professional",
    },
    loading: null,
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#3B82F6] animate-spin" />
          <p className="text-sm text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  const cfg = configs[status]!
  const Icon = cfg.icon

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/images/operaly-logo.png" alt="Operaly" width={110} height={40} className="h-8 w-auto" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          {/* Main card */}
          <div className="bg-white rounded-3xl border border-border shadow-lg overflow-hidden">
            {/* Top accent */}
            <div className="h-1.5 w-full" style={{ backgroundColor: cfg.iconColor }} />

            <div className="px-8 py-8 text-center">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-full ${cfg.iconBg} flex items-center justify-center mx-auto mb-5`}>
                <Icon className="w-10 h-10" style={{ color: cfg.iconColor }} />
              </div>

              <h1 className="text-2xl font-bold text-[#0F1F63]">{cfg.title}</h1>
              <p className="text-base font-medium mt-1" style={{ color: cfg.iconColor }}>{cfg.subtitle}</p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{cfg.message}</p>
            </div>

            {/* WhatsApp nudge for approved */}
            {status === "approved" && (
              <div className="mx-6 mb-6 bg-[#F0FDF4] border border-[#10B981]/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F1F63]">Revisa tu WhatsApp</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Operaly ya está activo en tu número. Escríbele para empezar.
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="px-6 pb-6 space-y-2.5">
              <Link href={cfg.cta}
                className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90"
                style={{ backgroundColor: cfg.iconColor }}>
                <cfg.ctaIcon className="w-4 h-4" />
                {cfg.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {cfg.secondary && (
                <Link href={cfg.secondary}
                  className="w-full h-10 rounded-2xl border border-border text-sm font-medium text-muted-foreground flex items-center justify-center hover:bg-secondary transition-colors">
                  Ver planes
                </Link>
              )}
            </div>
          </div>

          {/* What's next for approved */}
          {status === "approved" && (
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" /> Próximos pasos
              </p>
              {[
                "Tu acceso está activo — entra al dashboard",
                "Configura tu asistente: profesión, tono y contexto",
                "Escríbele a Operaly por WhatsApp y empieza a operar",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#0F1F63]">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* Support note */}
          <p className="text-center text-xs text-muted-foreground">
            ¿Tienes dudas? Escríbenos a{" "}
            <a href="mailto:soporte@operaly.app" className="text-[#3B82F6] hover:underline">
              soporte@operaly.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PagoResultadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <RefreshCw className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
