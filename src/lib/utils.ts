import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MedicationLog, MedicationStats, CaretakerStats } from "@/types/supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStats(logs: MedicationLog[]): MedicationStats {
  const today = new Date().toISOString().split("T")[0]

  const todayLogs = logs.filter((l) => l.scheduled_for === today)

  const takenToday = todayLogs.filter((l) => l.status === "taken").length

  const todayStatus =
    todayLogs.length === 0 ? "No meds" : takenToday === todayLogs.length ? "Complete" : "Pending"

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  const monthlyLogs = logs.filter((l) => {
    const d = new Date(l.scheduled_for)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const monthlyTaken = monthlyLogs.filter((l) => l.status === "taken").length

  const monthlyRate =
    monthlyLogs.length === 0 ? 0 : Math.round((monthlyTaken / monthlyLogs.length) * 100)

  const sorted = [...logs].sort(
    (a, b) => new Date(b.scheduled_for).getTime() - new Date(a.scheduled_for).getTime()
  )

  let streak = 0
  for (const log of sorted) {
    if (log.status === "taken") streak++
    else break
  }

  return {
    streak,
    todayStatus,
    monthlyRate,
  }
}

export function calculateCaretakerStats(logs: MedicationLog[]): CaretakerStats {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))

  const monthlyLogs = logs.filter((l) => {
    const d = new Date(l.scheduled_for)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const weeklyLogs = logs.filter((l) => {
    const d = new Date(l.scheduled_for)
    return d >= weekStart
  })

  const takenLogs = logs.filter((l) => l.status === "taken")
  const monthlyTaken = monthlyLogs.filter((l) => l.status === "taken").length
  const missedThisMonth = monthlyLogs.filter((l) => l.status === "missed").length
  const takenThisWeek = weeklyLogs.filter((l) => l.status === "taken").length
  const adherenceRate =
    monthlyLogs.length === 0 ? 0 : Math.round((monthlyTaken / monthlyLogs.length) * 100)

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.scheduled_for).getTime() - new Date(a.scheduled_for).getTime()
  )
  let streak = 0
  for (const log of sortedLogs) {
    if (log.status === "taken") streak++
    else break
  }

  return {
    adherenceRate,
    streak,
    missedThisMonth,
    takenThisWeek,
  }
}
