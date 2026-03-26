"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

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
      alert(err.message || "No se pudo cargar la agenda.")
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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1F63]">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Vista temporal de tareas y eventos recurrentes.
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
          <div className="space-y-6">
            {grouped.map(([date, dayItems]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="font-semibold text-[#0F1F63]">{date}</h2>
                </div>

                <div className="space-y-3">
                  {dayItems.map((item) => (
                    <div
                      key={item.source + item.id}
                      className="rounded-xl border border-border p-4 bg-secondary/20"
                    >
                      <p className="font-medium text-[#0F1F63]">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(item.when).toLocaleString()} · {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Estado: {item.status || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
