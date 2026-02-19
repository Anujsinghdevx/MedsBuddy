"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GreetingSection } from "./GreetingSection"
import { StatsGrid } from "./StatsGrid"
import { TodayMedications } from "./TodayMedications"
import { MedicationCalendar } from "./MedicationCalendar"
import { calculateStats } from "@/lib/utils"

export function PatientView() {
  const supabase = createClient()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("medication_logs")
      .select(`
        *,
        medications (
          name,
          dosage
        )
      `)
      .order("scheduled_at", { ascending: true })

    setLogs(data || [])
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  const stats = calculateStats(logs)

  return (
    <div className="space-y-8">
      <GreetingSection />
      <TodayMedications logs={logs} />
      <StatsGrid stats={stats} />
      <MedicationCalendar logs={logs} />
    </div>
  )
}
