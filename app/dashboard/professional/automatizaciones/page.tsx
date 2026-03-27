"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { calculateNextRun } from "@/lib/automation-engine"

type RecurringTaskRow = {
  id: string
  client_id: string
  title: string | null
  repeat_type: string | null
  repeat_interval: number | null
  status: string | null
  start_at: string | null
  next_run: string | null
}

export default function AutomatizacionesPage() {
  const [clientId, setClientId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<RecurringTaskRow[]>([])

  const [title, setTitle] = useState("")
  const [repeatType, setRepeatType] = useState("weekly")
  const [interval, setInterval] = useState(1)

  useEffect(() => {
    const init = async () => {
      try {
        const id = await getCurrentClientId()
        setClientId(id)
        await load(id)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const load = async (currentClientId: string) => {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .select("*")
      .eq("client_id", currentClientId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    setItems((data || []) as RecurringTaskRow[])
  }

  const create = async () => {
    if (!clientId) {
      return
    }

    if (!title.trim()) {
      alert("Debes ingresar un título.")
      return
    }

    if (interval < 1) {
      alert("El intervalo debe ser mayor o igual a 1.")
      return
    }

    setSaving(true)

    try {
      const startAt = new Date().toISOString()
      const nextRun = calculateNextRun({
        start_at: startAt,
        repeat_type: repeatType,
        repeat_interval: interval,
      })

      const { error } = await supabase.from("recurring_tasks").insert({
        client_id: clientId,
        title: title.trim(),
        repeat_type: repeatType,
        repeat_interval: interval,
        status: "active",
        start_at: startAt,
        next_run: nextRun.toISOString(),
      })

      if (error) {
        throw error
      }

      setTitle("")
      setRepeatType("weekly")
      setInterval(1)

      await load(clientId)
    } catch (err: any) {
      alert(err.message || "No se pudo crear la automatización.")
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (id: string, status: string | null) => {
    try {
      const nextStatus = status === "active" ? "paused" : "active"

      const { error } = await supabase
        .from("recurring_tasks")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      await load(clientId)
    } catch (err: any) {
      alert(err.message || "No se pudo actualizar la automatización.")
    }
  }

  const remove = async (id: string) => {
    const ok = window.confirm("¿Eliminar esta automatización?")

    if (!ok) {
      return
    }

    try {
      const { error } = await supabase
        .from("recurring_tasks")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      await load(clientId)
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar la automatización.")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F1F63]">Automatizaciones</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <select
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="daily">Diaria</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>

        <input
          type="number"
          min={1}
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={create}
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {saving ? "Guardando..." : "Crear automatización"}
        </button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Cargando automatizaciones...</div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-muted-foreground">
              Todavía no tienes automatizaciones.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow">
                <p className="font-medium">{item.title || "Automatización"}</p>

                <p className="text-sm text-gray-500">
                  {item.repeat_type} cada {item.repeat_interval}
                </p>

                <p className="text-sm text-gray-500">
                  Próxima ejecución: {item.next_run || "—"}
                </p>

                <p className="text-sm text-gray-500">
                  Estado: {item.status || "—"}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggle(item.id, item.status)}
                    className="text-sm px-3 py-1 bg-gray-200 rounded"
                  >
                    {item.status === "active" ? "Pausar" : "Activar"}
                  </button>

                  <button
                    onClick={() => remove(item.id)}
                    className="text-sm px-3 py-1 bg-red-400 text-white rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
