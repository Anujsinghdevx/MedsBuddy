"use client"

import { Card } from "@/components/ui/card"

interface MedicationCalendarProps {
  logs: any[]
}

export function MedicationCalendar({ logs }: MedicationCalendarProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const logsMap: Record<string, any[]> = {}

  logs.forEach((log) => {
    const dateStr = log.scheduled_for
    if (!logsMap[dateStr]) logsMap[dateStr] = []
    logsMap[dateStr].push(log)
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "bg-green-500"
      case "missed":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Medication Calendar</h2>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2 text-sm font-medium text-gray-500 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(year, month, i + 1)
            const dateStr = date.toLocaleDateString("en-CA")
            const dayLogs = logsMap[dateStr] || []

            const isToday =
              date.getDate() === now.getDate() &&
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()

            return (
              <div
                key={i}
                className={`h-20 flex flex-col items-center justify-start rounded-md p-1 text-sm cursor-pointer border ${isToday ? "border-blue-500" : "border-transparent"
                  } hover:border-gray-400 transition-colors`}
                title={
                  dayLogs.length > 0
                    ? dayLogs
                      .map(
                        (log) =>
                          `${log.medications.name}: ${log.status}`
                      )
                      .join("\n")
                    : "No medications scheduled"
                }
              >
                <div className="w-full text-center font-medium mb-1">
                  {i + 1}
                </div>

                <div className="flex flex-wrap justify-center gap-1">
                  {dayLogs.map((log, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        log.status
                      )}`}
                    ></span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex space-x-4 mt-4 text-sm items-center">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Taken
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            Missed
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-300 rounded-full mr-1"></span>
            Pending
          </div>
        </div>
      </Card>
    </div>
  )
}
