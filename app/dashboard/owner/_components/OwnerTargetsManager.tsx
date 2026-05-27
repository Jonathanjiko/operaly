"use client"

import { BarChart3, Save, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OwnerTargets } from "@/lib/owner-catalog"

type OwnerTargetsManagerProps = {
  targets: OwnerTargets | null
  saving: boolean
  activeWindow: "week" | "month"
  onChange: (windowKey: "week" | "month", field: "profitPen" | "salesPen" | "subscribers", value: number) => void
  onSave: () => void
}

const FIELD_CONFIG: Array<{
  key: "profitPen" | "salesPen" | "subscribers"
  label: string
  prefix?: string
}> = [
  { key: "profitPen", label: "Utilidad objetivo", prefix: "S/" },
  { key: "salesPen", label: "Ventas objetivo", prefix: "S/" },
  { key: "subscribers", label: "Suscriptores pagos" },
]

export default function OwnerTargetsManager({
  targets,
  saving,
  activeWindow,
  onChange,
  onSave,
}: OwnerTargetsManagerProps) {
  if (!targets) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Cargando metas owner...</p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <Target className="h-3.5 w-3.5" />
            Executive targets
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-[#0F1F63]">
            Metas persistentes por semana y mes
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Las métricas ejecutivas del owner reaccionan a estas metas. El filtro actual está
            leyendo <strong>{activeWindow === "week" ? "semana" : "mes"}</strong>.
          </p>
        </div>

        <Button
          className="rounded-2xl bg-[#0F1F63] text-white hover:bg-[#132672]"
          onClick={onSave}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar metas"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {(["week", "month"] as const).map((windowKey) => (
          <div
            key={windowKey}
            className={`rounded-3xl border p-5 ${
              activeWindow === windowKey
                ? "border-[#3B82F6]/30 bg-[#F8FAFF]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#3B82F6]" />
              <p className="text-lg font-semibold text-[#0F1F63]">
                Meta {windowKey === "week" ? "semanal" : "mensual"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {FIELD_CONFIG.map((field) => (
                <div key={`${windowKey}-${field.key}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">{field.label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {field.prefix ? (
                      <span className="text-sm font-semibold text-[#0F1F63]">{field.prefix}</span>
                    ) : null}
                    <Input
                      type="number"
                      min={0}
                      value={targets[windowKey][field.key]}
                      onChange={(event) =>
                        onChange(windowKey, field.key, Number(event.target.value || 0))
                      }
                      className="h-10 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
