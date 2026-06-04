"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, AlertTriangle, Mail, FolderOpen, MessageCircle } from "lucide-react"
import { fetchDashboardJson } from "@/lib/dashboard-runtime"
import {
  type DashboardStatusPayload,
  formatPlanStatusDate,
  getUsagePercent,
  isDashboardPlanActive,
  normalizeDashboardStatus,
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

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const payload = await fetchDashboardJson<DashboardStatusPayload>("/api/dashboard/status")
        if (payload?.ok) setStatus(payload)
      } catch {
        setStatus(null)
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

  if (!status) {
    return (
      <div className="w-full max-w-[340px] rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p className="text-sm text-slate-500">Cargando estado del plan...</p>
      </div>
    )
  }

  const active = isDashboardPlanActive(status.plan.status)

  if (!active) {
    const expiredLabel =
      normalizeDashboardStatus(status.plan.status) === "cancelled" ? "Tu suscripción fue cancelada" : "Tu suscripción venció"

    return (
      <div className="w-full max-w-[340px] rounded-[26px] border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">{expiredLabel}</p>
            <p className="mt-1 text-sm text-amber-800">
              Plan {status.plan.name}
              {status.plan.current_period_end ? ` — venció el ${formatPlanStatusDate(status.plan.current_period_end)}` : ""}
            </p>
            <Link
              href="/dashboard/professional/configuracion"
              className="mt-4 inline-flex rounded-full bg-[#0F1F63] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Actualizar plan →
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
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Activo
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
