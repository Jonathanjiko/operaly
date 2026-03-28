"use client"

import { useEffect, useMemo, useState } from "react"

type CalendarEvent = {
  id: string
  title: string
  dateKey: string
  timeLabel?: string
  type?: "task" | "automation"
  sourceAt?: string
}

type CalendarViewProps = {
  events: CalendarEvent[]
  locale?: string
  selectedDate?: string
  onSelectDate?: (dateKey: string) => void
}

type ViewMode = "month" | "week" | "day" | "agenda"

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function addDays(dateKey: string, days: number): string {
  const base = parseDateKey(dateKey)
  base.setDate(base.getDate() + days)
  return formatDateKey(base)
}

function buildMonthMatrix(monthKey: string): string[][] {
  const [year, month] = monthKey.split("-").map(Number)

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const firstWeekDay = (firstDay.getDay() + 6) % 7
  const start = new Date(firstDay)
  start.setDate(start.getDate() - firstWeekDay)

  const lastWeekDay = (lastDay.getDay() + 6) % 7
  const end = new Date(lastDay)
  end.setDate(end.getDate() + (6 - lastWeekDay))

  const allDays: string[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    allDays.push(formatDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  const weeks: string[][] = []

  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return weeks
}

function getMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7)
}

function formatMonthTitle(monthKey: string, locale: string): string {
  const date = parseDateKey(`${monthKey}-01`)

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatDayNumber(dateKey: string): string {
  return String(Number(dateKey.slice(8, 10)))
}

function isSameMonth(dateKey: string, monthKey: string): boolean {
  return dateKey.startsWith(monthKey)
}

function getLabels(locale: string) {
  if (locale.startsWith("en")) {
    return {
      today: "Today",
      back: "Back",
      next: "Next",
      month: "Month",
      week: "Week",
      day: "Day",
      agenda: "Agenda",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      noEvents: "No events for this date.",
      noRegistered: "No registered events.",
    }
  }

  return {
    today: "Hoy",
    back: "Atrás",
    next: "Siguiente",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    weekDays: ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"],
    noEvents: "No hay eventos para esta fecha.",
    noRegistered: "No hay eventos registrados.",
  }
}

export default function CalendarView({
  events,
  locale = "es-PE",
  selectedDate = "",
  onSelectDate,
}: CalendarViewProps) {
  const todayKey = formatDateKey(new Date())
  const labels = getLabels(locale)

  const [view, setView] = useState<ViewMode>("month")
  const [currentDateKey, setCurrentDateKey] = useState<string>(
    selectedDate || todayKey
  )

  useEffect(() => {
    if (selectedDate) {
      setCurrentDateKey(selectedDate)
    }
  }, [selectedDate])

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()

    for (const event of events) {
      const key = event.dateKey
      const current = map.get(key) || []
      current.push(event)
      map.set(key, current)
    }

    return map
  }, [events])

  const monthKey = getMonthKey(currentDateKey)

  const monthMatrix = useMemo(() => {
    return buildMonthMatrix(monthKey)
  }, [monthKey])

  const effectiveSelectedDate = selectedDate || currentDateKey

  const selectedEvents = useMemo(() => {
    return eventMap.get(effectiveSelectedDate) || []
  }, [eventMap, effectiveSelectedDate])

  const goToday = () => {
    setCurrentDateKey(todayKey)
    onSelectDate?.(todayKey)
  }

  const goPrev = () => {
    if (view === "month") {
      const [year, month] = monthKey.split("-").map(Number)
      const prev = new Date(year, month - 2, 1)
      setCurrentDateKey(formatDateKey(prev))
      return
    }

    if (view === "week") {
      setCurrentDateKey(addDays(currentDateKey, -7))
      return
    }

    setCurrentDateKey(addDays(currentDateKey, -1))
  }

  const goNext = () => {
    if (view === "month") {
      const [year, month] = monthKey.split("-").map(Number)
      const next = new Date(year, month, 1)
      setCurrentDateKey(formatDateKey(next))
      return
    }

    if (view === "week") {
      setCurrentDateKey(addDays(currentDateKey, 7))
      return
    }

    setCurrentDateKey(addDays(currentDateKey, 1))
  }

  return (
    <div className="rounded-2xl border border-border p-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50"
          >
            {labels.today}
          </button>

          <button
            onClick={goPrev}
            className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50"
          >
            {labels.back}
          </button>

          <button
            onClick={goNext}
            className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50"
          >
            {labels.next}
          </button>
        </div>

        <div className="text-2xl font-semibold text-[#0F1F63] capitalize">
          {formatMonthTitle(monthKey, locale)}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-lg border ${
              view === "month"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            {labels.month}
          </button>

          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg border ${
              view === "week"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            {labels.week}
          </button>

          <button
            onClick={() => setView("day")}
            className={`px-4 py-2 rounded-lg border ${
              view === "day"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            {labels.day}
          </button>

          <button
            onClick={() => setView("agenda")}
            className={`px-4 py-2 rounded-lg border ${
              view === "agenda"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            {labels.agenda}
          </button>
        </div>
      </div>

      {view === "month" && (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-border">
            {labels.weekDays.map((day) => (
              <div
                key={day}
                className="px-3 py-2 text-sm font-semibold text-center text-[#0F1F63]"
              >
                {day}
              </div>
            ))}
          </div>

          <div>
            {monthMatrix.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((dateKey) => {
                  const items = eventMap.get(dateKey) || []
                  const isSelected = effectiveSelectedDate === dateKey
                  const currentMonth = isSameMonth(dateKey, monthKey)

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => onSelectDate?.(dateKey)}
                      className={`min-h-[140px] border-r border-b border-border p-2 text-left align-top transition-colors ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      } ${!currentMonth ? "text-slate-400" : "text-[#0F1F63]"}`}
                    >
                      <div className="flex justify-end">
                        <span className="text-sm font-medium">
                          {formatDayNumber(dateKey)}
                        </span>
                      </div>

                      <div className="mt-2 space-y-2">
                        {items.slice(0, 3).map((item) => (
                          <div
                            key={`${item.id}-${item.dateKey}`}
                            className="rounded-md bg-[#2B6CB0] px-2 py-1 text-xs text-white truncate"
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-muted-foreground">
              {labels.noRegistered}
            </div>
          ) : (
            events.map((event) => (
              <button
                key={`${event.id}-${event.dateKey}`}
                onClick={() => onSelectDate?.(event.dateKey)}
                className="w-full text-left rounded-xl border border-border p-4 hover:bg-slate-50"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {event.dateKey}
                  {event.timeLabel ? ` ${event.timeLabel}` : ""}
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {view === "day" && (
        <div className="space-y-3">
          {selectedEvents.length === 0 ? (
            <div className="text-muted-foreground">
              {labels.noEvents}
            </div>
          ) : (
            selectedEvents.map((event) => (
              <div
                key={`${event.id}-${event.dateKey}`}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {event.dateKey}
                  {event.timeLabel ? ` ${event.timeLabel}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {view === "week" && (
        <div className="space-y-3">
          {selectedEvents.length === 0 ? (
            <div className="text-muted-foreground">
              {labels.noEvents}
            </div>
          ) : (
            selectedEvents.map((event) => (
              <div
                key={`${event.id}-${event.dateKey}`}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {event.dateKey}
                  {event.timeLabel ? ` ${event.timeLabel}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
