"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Mail, MessageCircle } from "lucide-react"
import { fetchDashboardJson } from "@/lib/dashboard-runtime"
import {
  canonicalDashboardPlanStatus,
  type DashboardStatusPayload,
  formatPlanStatusDate,
  getDashboardPlanPresentation,
  getUsagePercent,
  isDashboardPlanActive,
} from "@/lib/dashboard-status"

function UsageRow({
  label,
  used,
  limit,
  tone,
}: {
  label: string
  used: number
  limit: number
  tone: string
}) {
  const pct = getUsagePercent(used, limit)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function PlanStatusWidget() {
  const [status, setStatus] = useState<DashboardStatusPayload | null>(null)
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const payload = await fetchDashboardJson<DashboardStatusPayload>("/api/dashboard/status")
        if (payload?.ok) {
          setStatus(payload)
          setLoadState("ready")
          return
        }
        setLoadState("error")
      } catch {
        setStatus(null)
        setLoadState("error")
      }
    }

    void loadStatus()
  }, [])

  const googleSummary = useMemo(() => {
    const products = status?.google.products
    if (!products) return []

    return [
      { label: "Gmail", active: products.gmail },
      { label: "Drive", active: products.drive },
    ]
  }, [status])

  if (loadState === "loading") {
    return (
      <div className="w-full max-w-[340px] rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p className="text-sm text-slate-500">Cargando estado del plan...</p>
      </div>
    )
  }

  if (loadState === "error" || !status) {
    return (
      <div className="w-full max-w-[340px] rounded-[26px] border border-amber-200 bg-white/92 p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#0F1F63]">Estado de plan no disponible</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No pudimos confirmar ahora mismo su consumo, Google o WhatsApp. Puede revisar su plan e integraciones desde el panel.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/professional/configuracion"
            className="inline-flex rounded-full bg-[#0F1F63] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Ver plan
          </Link>
          <Link
            href="/dashboard/professional/integraciones"
            className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Revisar Google
          </Link>
        </div>
      </div>
    )
  }

  const normalizedStatus = canonicalDashboardPlanStatus(status.plan.status)
  const presentation = getDashboardPlanPresentation(status.plan.status)
  const active = isDashboardPlanActive(status.plan.status)

  if (!active) {
    const detailLabel =
      normalizedStatus === "pending_payment"
        ? "Tu plan sigue pendiente de pago. No mostraremos este plan como activo hasta que el backend confirme el cobro."
        : normalizedStatus === "past_due"
          ? "Tu último pago no se confirmó y el acceso operativo quedó restringido."
          : normalizedStatus === "canceled"
            ? "Tu suscripción fue cancelada y el acceso operativo quedó cerrado."
            : normalizedStatus === "expired_trial"
              ? "Tu periodo de prueba terminó y ahora necesitas elegir un plan."
              : "Tu suscripción venció y el acceso operativo quedó restringido."

    return (
      <div className="w-full max-w-[340px] rounded-[26px] border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-amber-900">{presentation.title}</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${presentation.badgeClass}`}>
                {presentation.badgeLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-amber-800">
              Plan {status.plan.name}
              {status.plan.current_period_end ? ` — ${normalizedStatus === "pending_payment" ? "vence" : "cerró"} el ${formatPlanStatusDate(status.plan.current_period_end)}` : ""}
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-800">{detailLabel}</p>
            <Link
              href="/dashboard/professional/configuracion"
              className="mt-4 inline-flex rounded-full bg-[#0F1F63] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              {normalizedStatus === "pending_payment" ? "Completar pago →" : "Actualizar plan →"}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[340px] rounded-[26px] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Tu plan</p>
          <p className="text-lg font-semibold text-[#0F1F63]">{status.plan.name}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${presentation.badgeClass}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          {presentation.badgeLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <UsageRow
          label="Mensajes IA"
          used={status.usage.messages_used}
          limit={status.usage.messages_limit}
          tone="bg-[#3B82F6]"
        />
        <UsageRow
          label="Llamadas"
          used={status.usage.calls_used}
          limit={status.usage.calls_limit}
          tone="bg-[#7C3AED]"
        />
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Mail className="h-4 w-4 text-[#34A853]" />
          <span className="font-medium">
            Google: {status.google.connected ? "✓ Conectado" : "No conectado"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {googleSummary.map((item) => (
            <span
              key={item.label}
              className={`rounded-full px-2 py-1 ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
            >
              {item.label} {item.active ? "✓" : "—"}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span className="font-medium">WhatsApp: {status.whatsapp.connected ? `✓ ${status.whatsapp.phone || ""}` : "Pendiente"}</span>
        </div>
      </div>

      <Link
        href="/dashboard/professional/configuracion"
        className="mt-4 inline-flex rounded-full bg-gradient-to-r from-[#25D366] via-[#3B82F6] to-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
      >
        Upgrade →
      </Link>
    </div>
  )
}
