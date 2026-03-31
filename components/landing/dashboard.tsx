"use client"

import {
  AudioLines,
  Bell,
  CalendarRange,
  ChevronRight,
  FolderLock,
  LayoutDashboard,
  PhoneCall,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Resumen", active: true },
  { icon: CalendarRange, label: "Agenda", active: false },
  { icon: Bell, label: "Pendientes", active: false },
  { icon: Users, label: "Contactos", active: false },
  { icon: FolderLock, label: "Baúl privado", active: false },
]

const statCards = [
  { label: "Pendientes activos", value: "14", icon: AudioLines, hint: "4 por audio" },
  { label: "Contactos con seguimiento", value: "28", icon: Users, hint: "6 hoy" },
  { label: "Automatizaciones", value: "09", icon: Sparkles, hint: "2 corriendo" },
  { label: "Archivos privados", value: "132", icon: FolderLock, hint: "100% seguros" },
]

const kanbanColumns = [
  { title: "Hoy", items: ["Enviar contrato a Carla", "Reservar restaurante 4 pm"] },
  { title: "En seguimiento", items: ["Caso Herrera · esperando respuesta", "Pago de proveedor · recordar mañana"] },
  { title: "Automatizado", items: ["Cumpleaños de Luis · 8:00 am", "Resumen nocturno · 9:30 pm"] },
]

export function Dashboard() {
  return (
    <section id="dashboard" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1F63]/[0.015] via-transparent to-[#3B82F6]/[0.04]" />
      <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_68%)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/15 bg-[#3B82F6]/10 px-4 py-1.5 text-sm font-semibold text-[#2563EB]">
            <Sparkles className="h-4 w-4" />
            Panel de control privado
          </span>
          <h2 className="mt-5 text-3xl font-bold text-[#0F1F63] sm:text-4xl md:text-5xl">
            Lo que en WhatsApp se siente simple,
            <span className="block">en tu dashboard se ve poderoso.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Operaly no solo conversa contigo. También te da una vista visual para entender tu día, tus tareas, tus archivos y todo lo que sigue abierto.
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-r from-[#7C3AED]/20 via-[#3B82F6]/20 to-[#06B6D4]/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_34px_90px_-25px_rgba(15,31,99,0.28)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-black/5 bg-gradient-to-r from-[#F8FAFD] to-[#EFF6FF] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="hidden items-center rounded-lg border border-black/5 bg-white px-4 py-1.5 shadow-sm sm:flex">
                  <Search className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">app.operaly.com/dashboard</span>
                </div>
              </div>
              <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#059669]">Operaly sincronizado</span>
            </div>

            <div className="flex min-h-[580px]">
              <aside className="hidden w-64 border-r border-black/5 bg-[#FBFDFF] p-4 md:flex md:flex-col">
                <div className="mb-8 flex items-center gap-3 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] text-sm font-bold text-white shadow-lg">
                    O
                  </div>
                  <div>
                    <div className="font-semibold text-[#0F1F63]">Operaly Assistant</div>
                    <div className="text-[11px] text-muted-foreground">Perfil profesional</div>
                  </div>
                </div>

                <nav className="space-y-1.5 text-sm font-medium">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
                        item.active
                          ? "bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white shadow-lg shadow-[#3B82F6]/20"
                          : "text-[#0F1F63]/70 hover:bg-[#0F1F63]/5"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>

                <div className="mt-auto rounded-[24px] border border-[#DBE8FF] bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3B82F6]">Consumo del plan</p>
                  <div className="mt-4 h-2 rounded-full bg-[#EAF1FF]">
                    <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]" />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">62% de tus operaciones disponibles este ciclo.</p>
                </div>
              </aside>

              <div className="flex-1 bg-gradient-to-br from-[#FBFDFF] via-white to-[#F6FBFF] p-5 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-[#E6ECF8] pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0F1F63]">Buenos días, Diego</h3>
                    <p className="mt-1 text-sm text-muted-foreground">3 prioridades activas, 2 seguimientos urgentes y 1 llamada programada.</p>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F8] bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Resumen nocturno</p>
                    <p className="mt-1 text-sm text-[#0F1F63]">Operaly te dirá qué avanzaste y qué quedó pendiente.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-4">
                  {statCards.map((item) => (
                    <div key={item.label} className="rounded-[24px] border border-[#E6ECF8] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <item.icon className="h-4 w-4 text-[#3B82F6]" />
                      </div>
                      <p className="mt-4 text-3xl font-bold text-[#0F1F63]">{item.value}</p>
                      <p className="mt-1 text-xs font-medium text-[#3B82F6]">{item.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[28px] border border-[#E6ECF8] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-[#0F1F63]">Agenda tipo Kanban</h4>
                        <p className="text-sm text-muted-foreground">Visualiza y mueve lo importante.</p>
                      </div>
                      <button className="rounded-full bg-[#F3F7FF] p-2 text-[#3B82F6]">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {kanbanColumns.map((column) => (
                        <div key={column.title} className="rounded-[22px] bg-[#F8FBFF] p-4">
                          <p className="text-sm font-semibold text-[#0F1F63]">{column.title}</p>
                          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                            {column.items.map((item) => (
                              <div key={item} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <div className="rounded-[28px] border border-[#E6ECF8] bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                        <PhoneCall className="h-4 w-4 text-[#7C3AED]" />
                        Llamadas y encargos
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <div className="rounded-2xl bg-[#F8FBFF] px-4 py-3">Llamar a restaurante · 4:00 pm · reserva para 4 personas</div>
                        <div className="rounded-2xl bg-[#F8FBFF] px-4 py-3">Avisar a Lucía que el research estará listo hoy</div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#E6ECF8] bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F63]">
                        <Send className="h-4 w-4 text-[#06B6D4]" />
                        Últimas entregas
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start justify-between rounded-2xl bg-[#F8FBFF] px-4 py-3">
                          <span>PDF del caso enviado a cliente</span>
                          <span className="text-xs font-semibold text-[#10B981]">Enviado</span>
                        </div>
                        <div className="flex items-start justify-between rounded-2xl bg-[#F8FBFF] px-4 py-3">
                          <span>Audio con pendientes del día</span>
                          <span className="text-xs font-semibold text-[#3B82F6]">Listo</span>
                        </div>
                        <div className="flex items-start justify-between rounded-2xl bg-[#F8FBFF] px-4 py-3">
                          <span>Recordatorio de cumpleaños programado</span>
                          <span className="text-xs font-semibold text-[#7C3AED]">Mañana</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
