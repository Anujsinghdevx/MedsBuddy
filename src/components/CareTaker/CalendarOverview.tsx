"use client"

import { Card } from "@/components/ui/card"
import { MedicationLogWithMedications } from "@/types/supabase"

interface CalendarOverviewProps {
  logs: MedicationLogWithMedications[]
}

export function CalendarOverview({ logs }: CalendarOverviewProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startingWeekday = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = firstDayOfMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const logsMap: Record<string, MedicationLogWithMedications[]> = {}
  logs.forEach((log) => {
    const dateStr = log.scheduled_for
    if (!logsMap[dateStr]) logsMap[dateStr] = []
    logsMap[dateStr].push(log)
  })

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "taken":
        return "bg-emerald-500"
      case "missed":
        return "bg-destructive"
      default:
        return "bg-muted-foreground/30"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{monthLabel}</h2>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="text-muted-foreground mb-4 grid grid-cols-7 text-center text-sm font-medium">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: startingWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

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
                className={`min-h-22.5 rounded-xl border p-2 text-sm transition-all
                  ${
                    isToday
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                title={
                  dayLogs.length > 0
                    ? dayLogs
                        .map(
                          (log) =>
                            `${log.medications?.name || "Unknown"} - ${log.status || "pending"}`
                        )
                        .join("\n")
                    : "No medications scheduled"
                }
              >
                <div className="mb-2 text-right text-xs font-medium">{i + 1}</div>

                <div className="flex flex-wrap gap-1">
                  {dayLogs.map((log, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${getStatusColor(log.status)}`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-muted-foreground mt-6 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            Taken
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-destructive h-3 w-3 rounded-full" />
            Missed
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-muted-foreground/30 h-3 w-3 rounded-full" />
            Pending
          </div>
        </div>
      </Card>
    </div>
  )
}
