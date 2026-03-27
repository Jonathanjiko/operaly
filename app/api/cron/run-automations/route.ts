import { NextResponse } from "next/server"

function buildDisabledResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Cron moved to backend. This frontend route is disabled.",
    },
    { status: 410 }
  )
}

export async function GET() {
  return buildDisabledResponse()
}

export async function POST() {
  return buildDisabledResponse()
}
