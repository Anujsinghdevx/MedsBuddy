"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GreetingSection } from "./GreetingSection"
import { StatsGrid } from "./StatsGrid"
import { RecentActivity } from "./RecentActivity"
import { QuickActions } from "./QuickActions"
import { CalendarOverview } from "./CalendarOverview"
import { calculateCaretakerStats } from "@/lib/utils"
import CaretakerAddMedicationForm from "./CaretakerAddMedication"
import { MedicationLogWithUser } from "@/types/supabase"

export function CaretakerView() {
  const supabase = createClient()
  const [logs, setLogs] = useState<MedicationLogWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("medication_logs")
      .select(`
        *,
        medications (name, dosage)
      `)
      .order("scheduled_at", { ascending: false })

    setLogs(data || [])
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  const stats = calculateCaretakerStats(logs)

  return (
    <div className="space-y-8">
      <GreetingSection userType="Caretaker" />
      <StatsGrid stats={stats} />
      <RecentActivity logs={logs} />
      <QuickActions />
      <CaretakerAddMedicationForm />
      <CalendarOverview logs={logs} />
    </div>
  )
}
