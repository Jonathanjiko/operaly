"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, RefreshCw, Clock3, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { AppToast } from "@/components/ui/app-toast"

type AgendaItem = {
  id: string
  title: string
  when: string
  source: "task" | "recurring"
  status: string | null
}

export default function ProfessionalAgendaPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<AgendaItem[]>([])

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")
  const [toastMessage, setToastMessage] = useState("")

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message)
    setToastType(type)
    setToastOpen(true)
  }

  const closeToast = () => {
    setToastOpen(false)
    setToastMessage("")
  }

  const loadAgenda = async () => {
    setLoading(true)

    try {
      const clientId = await getCurrentClientId()

      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, due_at, status")
        .eq("client_id", clientId)
        .not("due_at", "is", null)

      if (tasksError) {
        throw tasksError
      }

      const { data: recurring, error: recurringError } = await supabase
        .from("recurring_tasks")
        .select("id, title, next_run, status")
        .eq("client_id", clientId)
        .not("next_run", "is", null)

      if (recurringError) {
        throw recurringError
      }

      const merged: AgendaItem[] = [
        ...(tasks || []).map((t: any) => ({
          id: t.id,
          title: t.title || "Tarea",
          when: t.due_at,
          source: "task" as const,
          status: t.status || null,
        })),
        ...(recurring || []).map((r: any) => ({
          id: r.id,
          title: r.title || "Recurrente",
          when: r.next_run,
          source: "recurring" as const,
          status: r.status || null,
        })),
      ].sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime())

      setItems(merged)
    } catch (err: any) {
      showToast(err.message || "No se pudo cargar la agenda.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgenda()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, AgendaItem[]>()

    for (const item of items) {
      const key = new Date(item.when).toLocaleDateString()

      if (!map.has(key)) {
        map.set(key, [])
      }

      map.get(key)!.push(item)
    }

    return Array.from(map.entries())
  }, [items])

  return (
    <>
      <AppToast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={closeToast}
      />

      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1F63]">Agenda</h1>
            <p className="text-muted-foreground mt-1">
              Vista temporal de tareas y automatizaciones.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={loadAgenda}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          {loading ? (
            <p className="text-muted-foreground">Cargando agenda...</p>
          ) : grouped.length === 0 ? (
            <p className="text-muted-foreground">
              No tienes eventos agendados todavía.
            </p>
          ) : (
            <div className="space-y-8">
              {grouped.map(([date, dayItems]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-5 h-5 text-[#3B82F6]" />
                    <h2 className="font-semibold text-[#0F1F63]">{date}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {dayItems.map((item) => (
                      <div
                        key={item.source + item.id}
                        className="rounded-2xl border border-border bg-secondary/20 p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#0F1F63]">
                              {item.title}
                            </p>

                            <p className="text-sm text-muted-foreground mt-1">
                              Estado: {item.status || "—"}
                            </p>
                          </div>

                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              item.source === "task"
                                ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                                : "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                            }`}
                          >
                            {item.source === "task" ? (
                              <Clock3 className="w-5 h-5" />
                            ) : (
                              <Repeat className="w-5 h-5" />
                            )}
                          </div>
                        </div>

                        <div className="mt-5 text-sm text-muted-foreground">
                          {new Date(item.when).toLocaleString()}
                        </div>

                        <div className="mt-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              item.source === "task"
                                ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                                : "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                            }`}
                          >
                            {item.source === "task" ? "Tarea" : "Automatización"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
