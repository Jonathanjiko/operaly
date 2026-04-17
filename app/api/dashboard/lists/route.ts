import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function getAdminClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getAnonClient() {
  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function readBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) return ""
  return authHeader.slice(7).trim()
}

function resolveClientIdFromUser(user: {
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const fromAppMeta = user.app_metadata?.client_id
  if (typeof fromAppMeta === "string" && fromAppMeta.trim()) return fromAppMeta.trim()

  const fromUserMeta = user.user_metadata?.client_id
  if (typeof fromUserMeta === "string" && fromUserMeta.trim()) return fromUserMeta.trim()

  return ""
}

export async function GET(request: Request) {
  try {
    const token = readBearerToken(request)
    if (!token) {
      return NextResponse.json({ ok: false, error: "missing_bearer_token" }, { status: 401 })
    }

    const anon = getAnonClient()
    const admin = getAdminClient()

    const { data: authData, error: authError } = await anon.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 })
    }

    const clientId = resolveClientIdFromUser(authData.user as any)
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "missing_client_id" }, { status: 403 })
    }

    const [listsResp, checklistsResp] = await Promise.all([
      admin
        .from("lists")
        .select("id,title,list_type,status,created_at")
        .eq("client_id", clientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50),
      admin
        .from("checklists")
        .select("id,title,status,created_at")
        .eq("client_id", clientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50),
    ])

    if (listsResp.error) {
      return NextResponse.json({ ok: false, error: listsResp.error.message }, { status: 400 })
    }
    if (checklistsResp.error) {
      return NextResponse.json({ ok: false, error: checklistsResp.error.message }, { status: 400 })
    }

    const listIds = (listsResp.data || []).map((row) => row.id)
    const checklistIds = (checklistsResp.data || []).map((row) => row.id)

    const [listItemsResp, checklistItemsResp] = await Promise.all([
      listIds.length
        ? admin
            .from("list_items")
            .select("id,list_id,content,is_checked,position")
            .in("list_id", listIds)
            .order("position")
        : Promise.resolve({ data: [], error: null } as any),
      checklistIds.length
        ? admin
            .from("checklist_items")
            .select("id,checklist_id,content,is_checked,position")
            .in("checklist_id", checklistIds)
            .order("position")
        : Promise.resolve({ data: [], error: null } as any),
    ])

    if (listItemsResp.error) {
      return NextResponse.json({ ok: false, error: listItemsResp.error.message }, { status: 400 })
    }
    if (checklistItemsResp.error) {
      return NextResponse.json({ ok: false, error: checklistItemsResp.error.message }, { status: 400 })
    }

    const listItemsByParent = new Map<string, Array<Record<string, any>>>()
    for (const item of listItemsResp.data || []) {
      const list = listItemsByParent.get(item.list_id) || []
      list.push(item)
      listItemsByParent.set(item.list_id, list)
    }

    const checklistItemsByParent = new Map<string, Array<Record<string, any>>>()
    for (const item of checklistItemsResp.data || []) {
      const checklist = checklistItemsByParent.get(item.checklist_id) || []
      checklist.push(item)
      checklistItemsByParent.set(item.checklist_id, checklist)
    }

    const response = NextResponse.json({
      ok: true,
      clientId,
      lists: (listsResp.data || []).map((row) => ({
        ...row,
        expanded: false,
        items: listItemsByParent.get(row.id) || [],
      })),
      checklists: (checklistsResp.data || []).map((row) => ({
        ...row,
        expanded: false,
        items: checklistItemsByParent.get(row.id) || [],
      })),
    })
    response.headers.set("Cache-Control", "no-store, max-age=0")
    return response
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "dashboard_lists_read_failed",
        detail: typeof error?.message === "string" ? error.message : "Unexpected dashboard lists error.",
      },
      { status: 500 },
    )
  }
}
