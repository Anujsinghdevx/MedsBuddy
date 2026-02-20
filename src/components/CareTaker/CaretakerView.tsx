"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MedicationLogWithMedications } from "@/types/supabase"
import { calculateCaretakerStats } from "@/lib/utils"
import { GreetingSection } from "./GreetingSection"
import { StatsGrid } from "./StatsGrid"
import { RecentActivity } from "./RecentActivity"
import { QuickActions } from "./QuickActions"
import CaretakerAddMedicationForm from "./CaretakerAddMedication"
import { CalendarOverview } from "./CalendarOverview"

export function CaretakerView() {
  const supabase = createClient()
  const [logs, setLogs] = useState<MedicationLogWithMedications[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("medication_logs")
      .select(
        `
        *,
        medications (name, dosage)
      `
      )
      .order("scheduled_at", { ascending: false })

    setLogs((data as MedicationLogWithMedications[]) || [])
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  const stats = calculateCaretakerStats(logs)

  return (
    <div className="space-y-8">
      <GreetingSection userType="Caretaker" />
      <StatsGrid stats={stats} />
      <RecentActivity />
      <QuickActions />
      <CaretakerAddMedicationForm />
      <CalendarOverview logs={logs} />
    </div>
  )
}
