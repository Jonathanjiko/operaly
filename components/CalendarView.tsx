"use client"

import "react-big-calendar/lib/css/react-big-calendar.css"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import es from "date-fns/locale/es"

const locales = {
  es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

type CalendarEvent = {
  title: string
  start: Date
  end: Date
}

export default function CalendarView({
  events,
}: {
  events: CalendarEvent[]
}) {
  return (
    <div className="h-[760px] bg-white rounded-2xl p-4 shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="es"
        views={["month", "week", "day", "agenda"]}
        defaultView="month"
        popup
        style={{ height: "100%" }}
      />
    </div>
  )
}
