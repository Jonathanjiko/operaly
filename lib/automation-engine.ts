export function calculateNextRun(task: any) {
  const now = new Date(task.next_run || task.start_at)

  if (task.repeat_type === "daily") {
    now.setDate(now.getDate() + task.repeat_interval)
  }

  if (task.repeat_type === "weekly") {
    now.setDate(now.getDate() + 7 * task.repeat_interval)
  }

  if (task.repeat_type === "monthly") {
    now.setMonth(now.getMonth() + task.repeat_interval)
  }

  return now
}
