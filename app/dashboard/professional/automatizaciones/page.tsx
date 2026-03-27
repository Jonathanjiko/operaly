"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

export default function AutomatizacionesPage() {
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState<any[]>([])

  const [title, setTitle] = useState("")
  const [repeatType, setRepeatType] = useState("weekly")
  const [interval, setInterval] = useState(1)

  useEffect(() => {
    const init = async () => {
      const id = await getCurrentClientId()
      setClientId(id)
      load(id)
    }
    init()
  }, [])

  const load = async (clientId: string) => {
    const { data } = await supabase
      .from("recurring_tasks")
      .select("*")
      .eq("client_id", clientId)

    setItems(data || [])
  }

  const create = async () => {
    await supabase.from("recurring_tasks").insert({
      client_id: clientId,
      title,
      repeat_type: repeatType,
      repeat_interval: interval,
      status: "active",
      start_at: new Date().toISOString(),
    })

    setTitle("")
    load(clientId)
  }

  const toggle = async (id: string, status: string) => {
    await supabase
      .from("recurring_tasks")
      .update({ status: status === "active" ? "paused" : "active" })
      .eq("id", id)

    load(clientId)
  }

  const remove = async (id: string) => {
    await supabase.from("recurring_tasks").delete().eq("id", id)
    load(clientId)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Automatizaciones</h1>

      {/* CREAR */}
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
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={create}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Crear automatización
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="bg-white p-4 rounded-xl shadow">
            <p className="font-medium">{i.title}</p>
            <p className="text-sm text-gray-500">
              {i.repeat_type} cada {i.repeat_interval}
            </p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => toggle(i.id, i.status)}
                className="text-sm px-3 py-1 bg-gray-200 rounded"
              >
                {i.status === "active" ? "Pausar" : "Activar"}
              </button>

              <button
                onClick={() => remove(i.id)}
                className="text-sm px-3 py-1 bg-red-400 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
