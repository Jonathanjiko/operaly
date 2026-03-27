import { createClient } from "@supabase/supabase-js"
import { calculateNextRun } from "@/lib/automation-engine"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()

  const { data: tasks } = await supabase
    .from("recurring_tasks")
    .select("*")
    .lte("next_run", now)
    .eq("status", "active")

  for (const task of tasks || []) {
    // Crear recordatorio
    await supabase.from("task_reminders").insert({
      task_id: task.id,
      client_id: task.client_id,
      remind_at: new Date(),
      sent: false,
      channel: "whatsapp",
    })

    // Calcular siguiente ejecución
    const nextRun = calculateNextRun(task)

    await supabase
      .from("recurring_tasks")
      .update({ next_run: nextRun })
      .eq("id", task.id)
  }

  return Response.json({ ok: true })
}
