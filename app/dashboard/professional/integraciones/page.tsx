"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  FolderOpen,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentClientId } from "@/lib/dashboard-client"
import { getEffectivePlanCode, type EffectiveLimitsRuntime } from "@/lib/effective-limits"
import { getDisplayPlanName } from "@/lib/plans"

type GoogleStatusPayload = {
  ok?: boolean
  google_enabled?: boolean
  capability?: {
    google_enabled?: boolean
  }
  connection?: {
    status?: string | null
    connection_status?: string | null
    external_account_email?: string | null
    connected_at?: string | null
    granted_scopes?: string[] | null
    authorized_products?: string[] | null
  } | null
  products?: Partial<Record<GoogleProduct, GoogleProductState>>
  calendar?: GoogleProductState
  drive?: GoogleProductState
  gmail?: GoogleProductState
  contacts?: GoogleProductState
}

type GoogleProduct = "calendar" | "drive" | "gmail" | "contacts"

type GoogleProductState = {
  enabled?: boolean | null
  sync_status?: string | null
  last_synced_at?: string | null
  last_error?: string | null
  metadata?: Record<string, any> | null
}

type IntegrationCard = {
  id: "google_drive" | "google_calendar" | "gmail" | "google_contacts"
  product: GoogleProduct
  name: string
  description: string
  icon: () => JSX.Element
  useCases: string[]
}

type IntegrationRuntimeStatus = "blocked" | "connected" | "ready_to_connect" | "coming_soon" | "error"

type ContactsSnapshot = {
  total: number
  google: number
  merged: number
  birthdays: number
  withEmail: number
  synced: number
  lastSyncedAt: string | null
  bridgeStatus: "active" | "pending" | "base_only"
}

const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
)

const GmailIcon = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h48V192l160 112 160-112v256h48c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM256 272 96 160h320L256 272z" fill="#EA4335" />
  </svg>
)

const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <rect x="5" y="10" width="90" height="85" rx="8" fill="white" stroke="#DADCE0" strokeWidth="4" />
    <rect x="5" y="10" width="90" height="25" rx="4" fill="#1A73E8" />
    <rect x="5" y="30" width="90" height="5" fill="#1A73E8" />
    <text x="50" y="75" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#1A73E8">31</text>
    <rect x="25" y="2" width="10" height="18" rx="5" fill="#EA4335" />
    <rect x="65" y="2" width="10" height="18" rx="5" fill="#EA4335" />
  </svg>
)

const GoogleContactsIcon = () => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#34A853]/10 text-[#34A853]">
    <Users className="h-4 w-4" />
  </div>
)

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: "google_drive",
    product: "drive",
    name: "Google Drive",
    description: "Consultar, descargar y analizar archivos del Drive desde Operaly, incluso para compartirlos o usarlos en flujos por WhatsApp.",
    icon: GoogleDriveIcon,
    useCases: [
      "Buscar archivos por nombre o contexto",
      "Analizar PDFs, hojas y documentos",
      "Enviar archivos a terceros desde Operaly",
    ],
  },
  {
    id: "google_calendar",
    product: "calendar",
    name: "Google Calendar",
    description: "Sincronizar tu agenda real con Operaly para verla desde WhatsApp, crear eventos y mantener recordatorios consistentes.",
    icon: GoogleCalendarIcon,
    useCases: [
      "Ver agenda del dia desde WhatsApp",
      "Crear y mover eventos",
      "Sincronizar cambios con Operaly",
    ],
  },
  {
    id: "gmail",
    product: "gmail",
    name: "Gmail",
    description: "Preparar borradores, confirmar el contenido y luego enviar correos finales con o sin adjuntos desde Operaly.",
    icon: GmailIcon,
    useCases: [
      "Redactar correos con confirmacion previa",
      "Adjuntar archivos y enviar a contactos",
      "Trabajar respuestas desde el dashboard o WhatsApp",
    ],
  },
  {
    id: "google_contacts",
    product: "contacts",
    name: "Google Contacts",
    description: "Sincronizar personas desde Google para usarlas en agenda, Gmail, casos, llamadas y archivos sin duplicar la libreta.",
    icon: GoogleContactsIcon,
    useCases: [
      "Traer nombres, telefonos y emails",
      "Resolver cumpleanos y relaciones si existen",
      "Fusionar sin duplicados absurdos",
    ],
  },
]

function getProductLabel(product: GoogleProduct) {
  if (product === "calendar") return "Calendar"
  if (product === "drive") return "Drive"
  if (product === "gmail") return "Gmail"
  return "Contacts"
}

function getProductState(status: GoogleStatusPayload | null, product: GoogleProduct) {
  return status?.products?.[product] || status?.[product] || null
}

function normalizeGoogleError(payload: any, fallback: string) {
  const detail = payload?.detail
  const error = detail?.error || payload?.error || payload?.detail
  if (error === "google_oauth_not_configured") return "Google OAuth todavia no esta listo en el servidor."
  if (error === "google_addon_required") return "Activa el add-on Google Suite para conectar tu cuenta."
  if (error === "google_contacts_scope_required") return "Falta conceder el permiso de Google Contacts para poder sincronizar personas."
  if (typeof error === "string" && error.trim()) return error
  return fallback
}

function StatusPill({ status }: { status: IntegrationRuntimeStatus }) {
  if (status === "blocked") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
        <Lock className="h-3 w-3" />
        Requiere add-on
      </span>
    )
  }
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
        <Check className="h-3 w-3" />
        Conectado
      </span>
    )
  }
  if (status === "ready_to_connect") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
        <ExternalLink className="h-3 w-3" />
        Listo
      </span>
    )
  }
  if (status === "coming_soon") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
        <Clock3 className="h-3 w-3" />
        Proximo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
      <AlertCircle className="h-3 w-3" />
      Error
    </span>
  )
}

export default function IntegracionesPage() {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [planCode, setPlanCode] = useState("trial")
  const [googleStatus, setGoogleStatus] = useState<GoogleStatusPayload | null>(null)
  const [statusError, setStatusError] = useState("")
  const [contactsSyncState, setContactsSyncState] = useState<{
    status: "not_connected" | "scope_required" | "syncing" | "ok" | "partial" | "error" | ""
    message: string
    counts?: Record<string, number>
    lastSyncedAt?: string | null
  }>({ status: "", message: "" })
  const [contactsSnapshot, setContactsSnapshot] = useState<ContactsSnapshot>({
    total: 0,
    google: 0,
    merged: 0,
    birthdays: 0,
    withEmail: 0,
    synced: 0,
    lastSyncedAt: null,
    bridgeStatus: "base_only",
  })

  const googleServerConfigured = !statusError.toLowerCase().includes("google oauth todavia no esta listo en el servidor")

  const loadContactsSnapshot = async (clientId: string) => {
    const extendedResponse = await supabase
      .from("contacts")
      .select("id,email,birthday,source,sync_status,last_synced_at")
      .eq("client_id", clientId)

    if (!extendedResponse.error) {
      const rows = extendedResponse.data || []
      const google = rows.filter((contact) => String(contact.source || "").toLowerCase().includes("google")).length
      const merged = rows.filter((contact) => String(contact.source || "").toLowerCase().includes("merge")).length
      const googleLikeCount = google + merged
      const synced = rows.filter((contact) => {
        const normalized = String(contact.sync_status || "").toLowerCase()
        return normalized.includes("ok") || normalized.includes("sync")
      }).length
      const lastSyncedAt =
        rows
          .map((contact) => String(contact.last_synced_at || ""))
          .filter(Boolean)
          .sort()
          .at(-1) || null

      setContactsSnapshot({
        total: rows.length,
        google,
        merged,
        birthdays: rows.filter((contact) => Boolean(contact.birthday)).length,
        withEmail: rows.filter((contact) => Boolean(contact.email)).length,
        synced,
        lastSyncedAt,
        bridgeStatus: googleLikeCount > 0 ? "active" : rows.length > 0 ? "pending" : "base_only",
      })
      return
    }

    const baseResponse = await supabase
      .from("contacts")
      .select("id,email,birthday,source")
      .eq("client_id", clientId)

    const rows = baseResponse.data || []
    const google = rows.filter((contact) => String(contact.source || "").toLowerCase().includes("google")).length
    const merged = rows.filter((contact) => String(contact.source || "").toLowerCase().includes("merge")).length
    const googleLikeCount = google + merged
    setContactsSnapshot({
      total: rows.length,
      google,
      merged,
      birthdays: rows.filter((contact) => Boolean(contact.birthday)).length,
      withEmail: rows.filter((contact) => Boolean(contact.email)).length,
      synced: googleLikeCount,
      lastSyncedAt: null,
      bridgeStatus: googleLikeCount > 0 ? "active" : rows.length > 0 ? "pending" : "base_only",
    })
  }

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error("No hay sesion activa.")
    return { Authorization: `Bearer ${token}` }
  }

  const loadContactsStatus = async () => {
    try {
      const response = await fetch("/api/google/contacts/status", {
        method: "GET",
        cache: "no-store",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) return
      setContactsSyncState({
        status: String(payload?.sync_status || "") as
          | "not_connected"
          | "scope_required"
          | "syncing"
          | "ok"
          | "partial"
          | "error"
          | "",
        message: String(payload?.message || ""),
        counts: payload?.counts || undefined,
        lastSyncedAt: payload?.last_synced_at || payload?.lastSyncedAt || null,
      })
    } catch (error) {
      console.error("No se pudo leer el estado de Google Contacts:", error)
    }
  }

  const loadGoogleStatus = async () => {
    const headers = await getAuthHeaders()
    const response = await fetch("/api/google/status", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload?.error || "No se pudo consultar Google.")
    setGoogleStatus(payload as GoogleStatusPayload)
    const enabled = payload?.capability?.google_enabled ?? payload?.google_enabled
    if (typeof enabled === "boolean") setGoogleEnabled(Boolean(enabled))
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (contactsSyncState.status !== "syncing") return
    const interval = window.setInterval(() => {
      loadContactsStatus()
      loadData()
    }, 4000)
    return () => window.clearInterval(interval)
  }, [contactsSyncState.status])

  const loadData = async () => {
    setLoading(true)
    setStatusError("")
    try {
      const cid = await getCurrentClientId()
      const { data: limits, error: limitsError } = await supabase.rpc("get_my_effective_limits")
      if (limitsError) throw limitsError

      const effectiveLimits = (limits || {}) as EffectiveLimitsRuntime
      setPlanCode(getEffectivePlanCode(effectiveLimits))
      setGoogleEnabled(Boolean(limits?.google_enabled ?? false))

      await loadContactsSnapshot(cid)

      await loadGoogleStatus()
      await loadContactsStatus()
    } catch (err) {
      console.error(err)
      setStatusError(err instanceof Error ? err.message : "No se pudo cargar el estado de Google.")
    } finally {
      setLoading(false)
    }
  }

  const integrationStatuses = useMemo(() => {
    return INTEGRATIONS.map((integration) => {
      const productState = getProductState(googleStatus, integration.product)
      const authorizedProducts = googleStatus?.connection?.authorized_products || []
      const hasLegacyCalendarConnection =
        integration.product === "calendar" &&
        !googleStatus?.products &&
        (googleStatus?.connection?.connection_status === "connected" || googleStatus?.connection?.status === "connected")

      const isProductConnected =
        Boolean(productState?.enabled) || authorizedProducts.includes(integration.product) || hasLegacyCalendarConnection

      const runtimeStatus: IntegrationRuntimeStatus = !googleEnabled
        ? "blocked"
        : isProductConnected
          ? "connected"
          : productState?.sync_status === "error"
            ? "error"
            : "ready_to_connect"

      return { ...integration, runtimeStatus }
    })
  }, [googleEnabled, googleStatus])

  const connectedProductsCount = useMemo(
    () => integrationStatuses.filter((integration) => integration.runtimeStatus === "connected").length,
    [integrationStatuses]
  )

  const contactsProductConnected =
    integrationStatuses.find((integration) => integration.product === "contacts")?.runtimeStatus === "connected"

  const handleSyncContacts = async () => {
    setActionLoading("sync:contacts")
    setStatusError("")
    try {
      const response = await fetch("/api/google/contacts/sync", {
        method: "POST",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(normalizeGoogleError(payload, "No se pudo sincronizar Google Contacts."))
      setContactsSyncState({
        status: String(payload?.sync_status || "syncing") as
          | "not_connected"
          | "scope_required"
          | "syncing"
          | "ok"
          | "partial"
          | "error"
          | "",
        message: String(payload?.message || "Estoy trayendo sus contactos en segundo plano."),
        counts: payload?.counts || undefined,
        lastSyncedAt: payload?.last_synced_at || null,
      })
      await loadData()
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "No se pudo sincronizar Google Contacts.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleConnectProduct = async (product: GoogleProduct) => {
    setActionLoading(`connect:${product}`)
    setStatusError("")
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/google/${product}/connect`, {
        method: "GET",
        headers,
        cache: "no-store",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(normalizeGoogleError(payload, `No se pudo iniciar Google ${getProductLabel(product)}.`))
      const authUrl = String(payload?.auth_url || "")
      if (!authUrl) throw new Error("Google no devolvio una URL de autorizacion.")
      window.location.href = authUrl
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : `No se pudo conectar Google ${getProductLabel(product)}.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleValidateProduct = async (product: GoogleProduct) => {
    setActionLoading(`validate:${product}`)
    setStatusError("")
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/google/${product}/validate`, {
        method: "POST",
        headers,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(normalizeGoogleError(payload, `No se pudo validar Google ${getProductLabel(product)}.`))
      await loadGoogleStatus()
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : `No se pudo validar Google ${getProductLabel(product)}.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisconnectProduct = async (product: GoogleProduct) => {
    setActionLoading(`disconnect:${product}`)
    setStatusError("")
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/google/${product}/disconnect`, {
        method: "POST",
        headers,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(normalizeGoogleError(payload, `No se pudo desconectar Google ${getProductLabel(product)}.`))
      await loadGoogleStatus()
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : `No se pudo desconectar Google ${getProductLabel(product)}.`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Cargando integraciones...
        </div>
      </div>
    )
  }

  const contactsStatusLabel =
    contactsSyncState.status === "ok"
      ? "Listo"
      : contactsSyncState.status === "syncing"
        ? "Sincronizando"
        : contactsSyncState.status === "partial"
          ? "Revisar"
          : contactsSyncState.status === "scope_required"
            ? "Falta permiso"
            : contactsSyncState.status === "error"
              ? "Error"
              : contactsSnapshot.bridgeStatus === "active"
                ? "Listo"
                : contactsProductConnected
                  ? "Falta traer personas"
                  : "Pendiente"

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F63]">Integraciones</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Conecte sus herramientas y déjelas listas para trabajar con Operaly.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34D399] to-[#3B82F6]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#4285F4]/15 bg-gradient-to-r from-[#4285F4]/5 via-[#34A853]/5 to-[#EA4335]/5 p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex items-center -space-x-1">
              {["#4285F4", "#34A853", "#FBBC05", "#EA4335"].map((color) => (
                <div key={color} className="h-3.5 w-3.5 rounded-full border border-white" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F1F63]">Suite de Google</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Desde aquí deja lista su agenda, sus archivos, su correo y sus contactos para usarlos después por WhatsApp.
              </p>
            </div>
            {googleEnabled ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Disponible en su cuenta
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
                <Lock className="h-3.5 w-3.5" />
                Falta activar Google
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F1F63]">Estado actual</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">plan</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{getDisplayPlanName(planCode)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">google</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleEnabled ? "Activa" : "Bloqueada"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">conexion</p>
              <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleServerConfigured ? "Lista" : "Pendiente"}</p>
            </div>
          </div>
        </div>
      </div>

      {statusError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statusError === "google_addon_required" ? "Activa el add-on Google Suite para conectar tu cuenta." : statusError}
        </div>
      )}

      <div className="rounded-2xl border border-[#1A73E8]/15 bg-gradient-to-r from-[#1A73E8]/5 via-white to-[#34A853]/5 px-4 py-3 text-sm text-slate-600">
        Usted conecta todo desde aquí. Después, Operaly lo usa por WhatsApp sin que tenga que repetir la configuración.
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">google listo</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">{googleServerConfigured ? "Sí" : "No"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {googleServerConfigured ? "Ya puede empezar a conectar productos." : "Todavía falta dejarlo listo."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">productos conectados</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {connectedProductsCount > 0 ? `${connectedProductsCount}/${INTEGRATIONS.length} conectadas` : "Pendiente"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aquí ve qué parte de Google ya quedó lista en su cuenta.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">usable en whatsapp</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {googleServerConfigured && googleEnabled && connectedProductsCount > 0 ? "Parcialmente" : "Todavia no"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Mientras más productos conecte, más puede hacer Operaly por usted.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">personas</p>
          <p className="mt-2 text-lg font-semibold text-[#0F1F63]">
            {contactsStatusLabel}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {contactsSnapshot.withEmail} con email · {contactsSnapshot.birthdays} con cumpleanos · utiles para Gmail, agenda y casos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {integrationStatuses.map((integration) => {
          const Icon = integration.icon
          const runtimeStatus = integration.runtimeStatus
          const productState = getProductState(googleStatus, integration.product)
          const productLabel = getProductLabel(integration.product)

          return (
            <div key={integration.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Icon />
                </div>
                <StatusPill status={runtimeStatus} />
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#0F1F63]">{integration.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{integration.description}</p>
              </div>

              <div className="mt-4 space-y-2">
                {integration.useCases.map((useCase) => (
                  <div key={useCase} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {useCase}
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {runtimeStatus === "connected" ? (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700">
                      <p className="font-semibold">Cuenta conectada</p>
                      <p className="mt-1">{googleStatus?.connection?.external_account_email || `Google ${productLabel} autorizado`}</p>
                      <p className="mt-1">Estado: {integration.product === "contacts" ? contactsStatusLabel : productState?.sync_status || "listo"}</p>
                      {integration.product === "contacts" && (
                        <p className="mt-1">
                          Puente visible: {contactsSnapshot.bridgeStatus === "active" ? "si" : "todavia no"} ·{" "}
                          {contactsSnapshot.google + contactsSnapshot.merged} Google/fusionados
                        </p>
                      )}
                      {productState?.last_error && <p className="mt-1 text-red-700">Ultimo error: {productState.last_error}</p>}
                    </div>
                    <div className={`grid gap-2 ${integration.product === "contacts" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
                      <button
                        onClick={() => handleValidateProduct(integration.product)}
                        disabled={Boolean(actionLoading)}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-60"
                      >
                        {actionLoading === `validate:${integration.product}` ? "Validando..." : "Validar"}
                      </button>
                      {integration.product === "contacts" && (
                        <button
                          onClick={handleSyncContacts}
                          disabled={Boolean(actionLoading)}
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {actionLoading === "sync:contacts"
                            ? "Sincronizando..."
                            : contactsSnapshot.bridgeStatus === "active"
                              ? "Re-sincronizar"
                              : "Sincronizar"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDisconnectProduct(integration.product)}
                        disabled={Boolean(actionLoading)}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                      >
                        {actionLoading === `disconnect:${integration.product}` ? "Desconectando..." : "Desconectar"}
                      </button>
                    </div>
                  </div>
                ) : runtimeStatus === "blocked" ? (
                  <Link href="/precios" className="block">
                    <button className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#7C3AED]/25 bg-[#7C3AED]/5 text-sm font-medium text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/10">
                      Activar add-on Google
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleConnectProduct(integration.product)}
                    disabled={Boolean(actionLoading) || !googleServerConfigured}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#1A73E8]/20 bg-[#1A73E8]/5 text-sm font-medium text-[#1A73E8] transition-colors hover:bg-[#1A73E8]/10 disabled:opacity-60"
                  >
                    {actionLoading === `connect:${integration.product}`
                      ? "Abriendo Google..."
                      : !googleServerConfigured
                        ? "Servidor pendiente"
                        : `Conectar ${productLabel}`}
                    {integration.product === "contacts" ? <Users className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                  </button>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                  {runtimeStatus === "blocked"
                    ? "Primero se habilita comercialmente. Luego se conectara por OAuth seguro desde este mismo dashboard."
                    : !googleServerConfigured
                      ? "El dashboard ya esta listo, pero el backend todavia no puede abrir el flujo OAuth."
                      : runtimeStatus === "connected"
                        ? "La infraestructura OAuth ya esta lista. Ahora esta integracion si puede empezar a usarse desde WhatsApp segun el producto."
                        : "El servidor ya esta listo. El siguiente paso real es conectar tu cuenta Google para este producto desde aqui."}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F1F63]/5">
            <AlertCircle className="h-4 w-4 text-[#0F1F63]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Qué gana al conectarlo</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[#34A853]" />
              <p className="text-sm font-semibold text-[#0F1F63]">Drive</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Buscar, traer y trabajar sus archivos sin salir de Operaly.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#1A73E8]" />
              <p className="text-sm font-semibold text-[#0F1F63]">Calendar</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Ver su agenda real y crear reuniones sin desordenar sus recordatorios.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#EA4335]" />
              <p className="text-sm font-semibold text-[#0F1F63]">Gmail</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Preparar correos, revisarlos con usted y enviarlos cuando lo confirme.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#34A853]" />
              <p className="text-sm font-semibold text-[#0F1F63]">Contacts</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Tener sus personas listas para correos, agenda, casos y llamadas.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          contactsSnapshot.bridgeStatus === "active"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : contactsSnapshot.bridgeStatus === "pending"
              ? "border-sky-200 bg-sky-50 text-sky-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {contactsSnapshot.bridgeStatus === "active"
          ? "Sus personas de Google ya empiezan a aparecer aquí junto con la libreta que ya tenía."
          : contactsSnapshot.bridgeStatus === "pending"
            ? contactsProductConnected
              ? "Google Contacts ya está conectado, pero todavía está trayendo o actualizando sus personas."
              : "Todavía falta conectar Google Contacts para completar su libreta."
            : "Por ahora solo está viendo su libreta interna. Cuando conecte Contacts, aquí aparecerán también sus personas de Google."}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F1F63]/5">
            <Users className="h-4 w-4 text-[#0F1F63]" />
          </div>
          <h2 className="font-semibold text-[#0F1F63]">Personas en Operaly</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-[#0F1F63]">Su libreta</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Operaly junta lo que usted ya tenía con lo que llegue desde Google, sin desordenarle los contactos.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-[#0F1F63]">Para qué sirve</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Sirve para escribir correos, agendar reuniones, ubicar cumpleaños, enviar archivos y trabajar casos.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-[#0F1F63]">Hoy en su cuenta</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Tiene {contactsSnapshot.total} contacto{contactsSnapshot.total !== 1 ? "s" : ""}. {contactsProductConnected ? "Google Contacts ya puede actualizar esta base." : "El siguiente paso es conectar Google Contacts."}
              </p>
            </div>
        </div>
      </div>
    </div>
  )
}
