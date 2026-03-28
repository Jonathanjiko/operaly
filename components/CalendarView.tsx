"use client"

import { useMemo, useState } from "react"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  type?: "task" | "automation"
  sourceAt?: string
}

type CalendarViewProps = {
  events: CalendarEvent[]
  locale?: string
  timeZone?: string
  selectedDate?: string
  onSelectDate?: (dateKey: string) => void
}

type ViewMode = "month" | "week" | "day" | "agenda"

function getDateKeyInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return formatter.format(date)
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  })

  const parts = formatter.formatToParts(date)

  const map: Record<string, string> = {}

  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: map.weekday || "",
  }
}

function buildMonthMatrix(baseDate: Date) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const start = new Date(firstDay)
  const dayOfWeek = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dayOfWeek)

  const end = new Date(lastDay)
  const endDayOfWeek = (end.getDay() + 6) % 7
  end.setDate(end.getDate() + (6 - endDayOfWeek))

  const days: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return weeks
}

function formatMonthTitle(date: Date, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatTime(date: Date, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export default function CalendarView({
  events,
  locale = "es-PE",
  timeZone = "America/Lima",
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [view, setView] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()

    for (const event of events) {
      const key = getDateKeyInTimeZone(event.start, timeZone)
      const current = map.get(key) || []
      current.push(event)
      map.set(key, current)
    }

    for (const [key, value] of map.entries()) {
      value.sort((a, b) => a.start.getTime() - b.start.getTime())
      map.set(key, value)
    }

    return map
  }, [events, timeZone])

  const monthMatrix = useMemo(() => {
    return buildMonthMatrix(currentDate)
  }, [currentDate])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return eventMap.get(selectedDate) || []
  }, [eventMap, selectedDate])

  const goToday = () => {
    const now = new Date()
    setCurrentDate(now)

    if (onSelectDate) {
      onSelectDate(getDateKeyInTimeZone(now, timeZone))
    }
  }

  const goPrev = () => {
    const next = new Date(currentDate)

    if (view === "month") {
      next.setMonth(next.getMonth() - 1)
    } else if (view === "week") {
      next.setDate(next.getDate() - 7)
    } else {
      next.setDate(next.getDate() - 1)
    }

    setCurrentDate(next)
  }

  const goNext = () => {
    const next = new Date(currentDate)

    if (view === "month") {
      next.setMonth(next.getMonth() + 1)
    } else if (view === "week") {
      next.setDate(next.getDate() + 7)
    } else {
      next.setDate(next.getDate() + 1)
    }

    setCurrentDate(next)
  }

  const handleSelectDay = (date: Date) => {
    const key = getDateKeyInTimeZone(date, timeZone)

    if (onSelectDate) {
      onSelectDate(key)
    }
  }

  return (
    <div className="rounded-2xl border border-border p-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50"
          >
            Today
          </button>

          <button
            onClick={goPrev}
            className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50"
          >
            Back
          </button>

          <button
            onClick={goNext}
            className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50"
          >
            Next
          </button>
        </div>

        <div className="text-2xl font-semibold text-[#0F1F63] capitalize">
          {formatMonthTitle(currentDate, locale, timeZone)}
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
            Month
          </button>

          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg border ${
              view === "week"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            Week
          </button>

          <button
            onClick={() => setView("day")}
            className={`px-4 py-2 rounded-lg border ${
              view === "day"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            Day
          </button>

          <button
            onClick={() => setView("agenda")}
            className={`px-4 py-2 rounded-lg border ${
              view === "agenda"
                ? "bg-slate-100 border-slate-300"
                : "bg-white border-border hover:bg-slate-50"
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      {view === "month" && (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-border">
            {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((day) => (
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
                {week.map((date) => {
                  const dateKey = getDateKeyInTimeZone(date, timeZone)
                  const items = eventMap.get(dateKey) || []
                  const isSelected = selectedDate === dateKey
                  const currentMonth = isSameMonth(date, currentDate)

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleSelectDay(date)}
                      className={`min-h-[140px] border-r border-b border-border p-2 text-left align-top transition-colors ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      } ${!currentMonth ? "text-slate-400" : "text-[#0F1F63]"}`}
                    >
                      <div className="flex justify-end">
                        <span className="text-sm font-medium">
                          {getDatePartsInTimeZone(date, timeZone).day}
                        </span>
                      </div>

                      <div className="mt-2 space-y-2">
                        {items.slice(0, 3).map((item) => (
                          <div
                            key={`${item.id}-${item.start.toISOString()}`}
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
              No hay eventos registrados.
            </div>
          ) : (
            events
              .slice()
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map((event) => {
                const dateKey = getDateKeyInTimeZone(event.start, timeZone)

                return (
                  <button
                    key={`${event.id}-${event.start.toISOString()}`}
                    onClick={() => onSelectDate?.(dateKey)}
                    className="w-full text-left rounded-xl border border-border p-4 hover:bg-slate-50"
                  >
                    <p className="font-medium text-[#0F1F63]">{event.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatTime(event.start, locale, timeZone)}
                    </p>
                  </button>
                )
              })
          )}
        </div>
      )}

      {view === "day" && (
        <div className="space-y-3">
          {selectedEvents.length === 0 ? (
            <div className="text-muted-foreground">
              No hay eventos para este día.
            </div>
          ) : (
            selectedEvents.map((event) => (
              <div
                key={`${event.id}-${event.start.toISOString()}`}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatTime(event.start, locale, timeZone)}
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
              No hay eventos para la fecha seleccionada.
            </div>
          ) : (
            selectedEvents.map((event) => (
              <div
                key={`${event.id}-${event.start.toISOString()}`}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium text-[#0F1F63]">{event.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatTime(event.start, locale, timeZone)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
