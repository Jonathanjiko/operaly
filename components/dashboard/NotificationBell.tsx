"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"

type NotificationRow = {
  id: string
  client_id: string
  type: string
  title: string
  message: string
  severity: string
  entity_type: string | null
  entity_id: string | null
  action_url: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

function formatRelativeDate(value: string, locale = "es-PE") {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function severityClasses(severity: string) {
  if (severity === "success") return "bg-emerald-50 border-emerald-200"
  if (severity === "warning") return "bg-amber-50 border-amber-200"
  if (severity === "error") return "bg-red-50 border-red-200"
  return "bg-white border-slate-200"
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [clientId, setClientId] = useState<string | null>(null)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const channelRef = useRef<any>(null)

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length
  }, [notifications])

  // ---------------------------
  // INIT
  // ---------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const currentClientId = await getCurrentClientId()
        setClientId(currentClientId)
        await loadNotifications(currentClientId)
      } catch (err) {
        console.error("Error init notifications:", err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // ---------------------------
  // REALTIME (FIX CRÍTICO)
  // ---------------------------
  useEffect(() => {
    if (!clientId) return

    // 🔥 LIMPIAR SI YA EXISTE
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase.channel(`notifications-${clientId}`)

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `client_id=eq.${clientId}`,
      },
      () => {
        loadNotifications(clientId)
      }
    )

    channel.subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [clientId])

  // ---------------------------
  // CLICK OUTSIDE
  // ---------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // ---------------------------
  // DATA
  // ---------------------------
  const loadNotifications = async (currentClientId: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("client_id", currentClientId)
        .order("created_at", { ascending: false })
        .limit(25)

      if (error) throw error

      setNotifications((data || []) as NotificationRow[])
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  const markOneRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc("mark_notification_read", {
        p_notification_id: notificationId,
      })

      if (error) throw error

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : item
        )
      )
    } catch (err) {
      console.error("Error markOneRead:", err)
    }
  }

  const markAllRead = async () => {
    try {
      const { error } = await supabase.rpc("mark_all_notifications_read")

      if (error) throw error

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || new Date().toISOString(),
        }))
      )
    } catch (err) {
      console.error("Error markAllRead:", err)
    }
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50"
      >
        <Bell className="h-5 w-5 text-slate-700" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notificaciones
              </h3>
              <p className="text-xs text-slate-500">
                {unreadCount} sin leer
              </p>
            </div>

            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todo
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {loading ? (
              <div className="px-2 py-6 text-sm text-slate-500">
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-2 py-6 text-sm text-slate-500">
                No tienes notificaciones.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={async () => {
                      if (!item.is_read) {
                        await markOneRead(item.id)
                      }

                      if (item.action_url) {
                        window.location.href = item.action_url
                      }
                    }}
                    className={`block w-full rounded-xl border p-3 text-left transition hover:bg-slate-50 ${severityClasses(
                      item.severity
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.message}
                        </p>
                      </div>

                      {!item.is_read && (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatRelativeDate(item.created_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
