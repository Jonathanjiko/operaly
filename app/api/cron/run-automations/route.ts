import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateNextRun } from "@/lib/automation-engine"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const now = new Date().toISOString()

    const { data: tasks, error: tasksError } = await supabase
      .from("recurring_tasks")
      .select("*")
      .lte("next_run", now)
      .eq("status", "active")

    if (tasksError) {
      throw tasksError
    }

    for (const task of tasks || []) {
      const { error: reminderError } = await supabase
        .from("task_reminders")
        .insert({
          task_id: task.id,
          client_id: task.client_id,
          remind_at: new Date().toISOString(),
          sent: false,
          channel: task.channel || "whatsapp",
        })

      if (reminderError) {
        console.error("Error creando reminder:", reminderError)
        continue
      }

      if (task.channel === "whatsapp") {
        console.log("Pendiente integrar envío real por WhatsApp para:", task.id)
      }

      const nextRun = calculateNextRun(task)

      const { error: updateError } = await supabase
        .from("recurring_tasks")
        .update({
          next_run: nextRun.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id)

      if (updateError) {
        console.error("Error actualizando recurring_task:", updateError)
      }
    }

    return NextResponse.json({
      ok: true,
      processed: (tasks || []).length,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Unexpected cron error",
      },
      { status: 500 }
    )
  }
}
