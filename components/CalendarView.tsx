"use client"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import es from "date-fns/locale/es"

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function CalendarView({ events }: any) {
  return (
    <div className="h-[700px] bg-white rounded-2xl p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="es"
      />
    </div>
  )
}
