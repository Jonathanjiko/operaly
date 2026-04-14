"use client"

import { Layers3, Plus, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OwnerCatalog } from "@/lib/owner-catalog"

type OwnerCatalogManagerProps = {
  catalog: OwnerCatalog | null
  saving: boolean
  onPlanFieldChange: (planCode: string, field: "price", value: number) => void
  onPlanLimitChange: (planCode: string, limitKey: string, value: number) => void
  onAddonFieldChange: (
    addonCode: string,
    field:
      | "price"
      | "name"
      | "description"
      | "extra_messages"
      | "extra_minutes"
      | "extra_storage_gb"
      | "extra_automations",
    value: string | number
  ) => void
  onSave: () => void
}

const LIMIT_LABELS: Array<{ key: string; label: string; unit: string }> = [
  { key: "ia_limit", label: "Mensajes IA", unit: "msg" },
  { key: "calls_minutes", label: "Minutos voz", unit: "min" },
  { key: "storage_gb", label: "Storage", unit: "GB" },
  { key: "contacts_limit", label: "Contactos", unit: "cts" },
  { key: "automations_limit", label: "Automatizaciones", unit: "auto" },
]

const ADDON_EFFECT_LABELS: Array<{ key: string; label: string; unit: string }> = [
  { key: "extra_messages", label: "Mensajes extra", unit: "msg" },
  { key: "extra_minutes", label: "Minutos extra", unit: "min" },
  { key: "extra_storage_gb", label: "Storage extra", unit: "GB" },
  { key: "extra_automations", label: "Automatizaciones extra", unit: "auto" },
]

export default function OwnerCatalogManager({
  catalog,
  saving,
  onPlanFieldChange,
  onPlanLimitChange,
  onAddonFieldChange,
  onSave,
}: OwnerCatalogManagerProps) {
  if (!catalog) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Cargando catálogo editable...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <Sparkles className="h-3.5 w-3.5" />
              Owner catalog control
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#0F1F63]">
              Catálogo editable de planes y add-ons
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Ajusta precios y límites desde este panel. Los add-ons visibles en analíticas
              profesionales salen de este catálogo dinámico.
            </p>
          </div>

          <Button
            className="rounded-2xl bg-[#0F1F63] text-white hover:bg-[#132672]"
            onClick={onSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar catálogo"}
          </Button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="text-xl font-semibold text-[#0F1F63]">Planes</h3>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {catalog.plans.map((plan) => (
            <div key={plan.code} className="rounded-3xl border border-slate-200 bg-[#F8FAFF] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#0F1F63]">{plan.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {plan.code}
                  </p>
                </div>
                <div className="w-32">
                  <p className="mb-2 text-xs font-medium text-slate-500">Precio</p>
                  <Input
                    type="number"
                    min={0}
                    value={plan.price}
                    onChange={(event) =>
                      onPlanFieldChange(plan.code, "price", Number(event.target.value || 0))
                    }
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {LIMIT_LABELS.map((limit) => (
                  <div key={`${plan.code}-${limit.key}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">{limit.label}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={plan.limits[limit.key as keyof typeof plan.limits]}
                        onChange={(event) =>
                          onPlanLimitChange(
                            plan.code,
                            limit.key,
                            Number(event.target.value || 0)
                          )
                        }
                        className="h-10 rounded-xl border-slate-200"
                      />
                      <span className="text-xs text-slate-400">{limit.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#7C3AED]" />
          <h3 className="text-xl font-semibold text-[#0F1F63]">Add-ons</h3>
        </div>

        <div className="space-y-4">
          {catalog.addons.map((addon) => (
            <div key={addon.code} className="rounded-3xl border border-slate-200 bg-[#FCFCFF] p-5">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">Nombre</p>
                      <Input
                        value={addon.name}
                        onChange={(event) =>
                          onAddonFieldChange(addon.code, "name", event.target.value)
                        }
                        className="h-10 rounded-xl border-slate-200"
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">Precio</p>
                      <Input
                        type="number"
                        min={0}
                        value={addon.price}
                        onChange={(event) =>
                          onAddonFieldChange(
                            addon.code,
                            "price",
                            Number(event.target.value || 0)
                          )
                        }
                        className="h-10 rounded-xl border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Descripción</p>
                    <Input
                      value={addon.description}
                      onChange={(event) =>
                        onAddonFieldChange(addon.code, "description", event.target.value)
                      }
                      className="h-10 rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {ADDON_EFFECT_LABELS.map((effect) => (
                    <div key={`${addon.code}-${effect.key}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-medium text-slate-500">{effect.label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={addon[effect.key as keyof typeof addon] as number}
                          onChange={(event) =>
                            onAddonFieldChange(
                              addon.code,
                              effect.key as
                                | "extra_messages"
                                | "extra_minutes"
                                | "extra_storage_gb"
                                | "extra_automations",
                              Number(event.target.value || 0)
                            )
                          }
                          className="h-10 rounded-xl border-slate-200"
                        />
                        <span className="text-xs text-slate-400">{effect.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
