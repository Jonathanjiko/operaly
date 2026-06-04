"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarClock, CheckCircle2, ChevronRight, MessageCircle, PlugZap, Wallet, X } from "lucide-react"
import { fetchDashboardJson } from "@/lib/dashboard-runtime"
import {
  canonicalDashboardPlanStatus,
  normalizeWhatsappActivationStatus,
  type DashboardStatusPayload,
} from "@/lib/dashboard-status"

type FirstActionChecklistProps = {
  agendaReady: boolean
}

type ChecklistStep = {
  id: "billing" | "whatsapp" | "google" | "agenda"
  title: string
  description: string
  href: string
  cta: string
  done: boolean
}

const DISMISS_KEY = "operaly:first-action-checklist:dismissed"

export function FirstActionChecklist({ agendaReady }: FirstActionChecklistProps) {
  const [status, setStatus] = useState<DashboardStatusPayload | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [statusState, setStatusState] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true")
    } catch {
      setDismissed(false)
    }
  }, [])

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const payload = await fetchDashboardJson<DashboardStatusPayload>("/api/dashboard/status")
        if (payload?.ok) {
          setStatus(payload)
          setStatusState("ready")
          return
        }
        setStatusState("error")
      } catch {
        setStatus(null)
        setStatusState("error")
      }
    }

    void loadStatus()
  }, [])

  const steps = useMemo<ChecklistStep[]>(() => {
    const planStatus = canonicalDashboardPlanStatus(status?.plan.status)
    const paymentReady = status
      ? Boolean(status.plan.gate_allowed) && ["active", "trialing"].includes(planStatus)
      : false
    const checkoutHref = status?.payment.checkout_url || "/dashboard/professional/configuracion"
    const whatsappReady =
      paymentReady &&
      (Boolean(status?.whatsapp.welcome_sent) ||
        normalizeWhatsappActivationStatus(status?.whatsapp.activation_status) === "active")
    const googleReady = paymentReady && Boolean(status?.google.connected)

    if (status && !paymentReady && status.plan.code !== "trial") {
      return [
        {
          id: "billing",
          title: "Activa tu plan",
          description: "Tu cuenta todavía no queda operativa hasta que el backend confirme el pago.",
          href: checkoutHref,
          cta: "Completar pago",
          done: false,
        },
        {
          id: "whatsapp",
          title: "WhatsApp quedará listo después",
          description: "El número se considera listo cuando el pago se aprueba y la bienvenida ya fue enviada.",
          href: "/dashboard/professional/configuracion",
          cta: "Ver número",
          done: false,
        },
        {
          id: "google",
          title: "Google se habilita al activar",
          description: "Tus integraciones deben sentirse activas solo cuando el plan ya quedó vigente.",
          href: "/dashboard/professional/integraciones",
          cta: "Revisar integraciones",
          done: false,
        },
      ]
    }

    return [
      {
        id: "whatsapp",
        title: "Conecta tu WhatsApp",
        description: "Solo queda listo cuando la bienvenida ya fue enviada o el backend marcó la activación.",
        href: "/dashboard/professional/configuracion",
        cta: whatsappReady ? "Listo" : "Revisar WhatsApp",
        done: whatsappReady,
      },
      {
        id: "google",
        title: "Conecta Google Suite",
        description: "Gmail, Calendar y Drive hacen que el asistente se sienta completo.",
        href: "/dashboard/professional/integraciones",
        cta: googleReady ? "Conectado" : "Conectar Google",
        done: googleReady,
      },
      {
        id: "agenda",
        title: "Crea tu primera acción",
        description: "Agenda una cita o deja una tarea para que Operaly empiece a ayudarte.",
        href: "/dashboard/professional/agenda",
        cta: paymentReady && agendaReady ? "En marcha" : "Ir a agenda",
        done: paymentReady && agendaReady,
      },
    ]
  }, [agendaReady, status])

  const completed = steps.filter((step) => step.done).length
  const allDone = completed === steps.length

  if (dismissed || allDone) return null

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#D9E1EC] bg-white shadow-sm">
      <div className="bg-[linear-gradient(135deg,#0F1F63_0%,#3B82F6_58%,#A855F7_100%)] px-6 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Primeros pasos</p>
            <h2 className="mt-2 text-xl font-semibold">Deja Operaly listo para ayudarte de verdad</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78">
              Completa estas acciones una sola vez. Después tu día empieza mucho más ordenado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDismissed(true)
              try {
                window.localStorage.setItem(DISMISS_KEY, "true")
              } catch {}
            }}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white transition hover:bg-white/16"
            aria-label="Ocultar checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/18">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#25D366_0%,#8B5CF6_100%)] transition-all"
              style={{ width: `${Math.round((completed / steps.length) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-white/86">
            {completed}/{steps.length}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        {statusState === "error" ? (
          <div className="md:col-span-3 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No pudimos verificar ahora mismo el estado de WhatsApp o Google. Puede seguir y revisarlos desde Configuración e Integraciones.
          </div>
        ) : null}

        {steps.map((step) => {
          const Icon =
            step.id === "billing"
              ? Wallet
              : step.id === "whatsapp"
                ? MessageCircle
                : step.id === "google"
                  ? PlugZap
                  : CalendarClock

          return (
            <div
              key={step.id}
              className={`rounded-[22px] border p-4 transition ${
                step.done ? "border-emerald-200 bg-emerald-50/70" : "border-[#E4ECF7] bg-[#F8FBFF]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0F1F63] shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                {step.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#0F1F63]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              {statusState === "loading" && step.id !== "agenda" ? (
                <p className="mt-2 text-xs text-slate-500">Verificando estado...</p>
              ) : null}
              {statusState === "error" && step.id !== "agenda" ? (
                <p className="mt-2 text-xs text-amber-700">Estado no confirmado todavía.</p>
              ) : null}

              <Link
                href={step.href}
                className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${
                  step.done ? "text-emerald-700" : "text-[#2563EB]"
                }`}
              >
                {step.cta}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
