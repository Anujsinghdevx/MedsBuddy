"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMedications } from "@/lib/api/medications"
import { fetchLogsByDate } from "@/lib/api/medication-logs"
import MedicationCard from "./medication-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/providers/supabase-provider"
import { useEffect, useState } from "react"
import { MedicationLogWithMedications, Medication } from "@/types/supabase"

export default function MedicationList() {
  const today = new Date().toISOString().split("T")[0]

  const supabase = useSupabase()
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setSessionReady(true)
    })
  }, [supabase])

  const { data: medications, isLoading: medsLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: fetchMedications,
    enabled: sessionReady, 
  })

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["today-logs", today],
    queryFn: () => fetchLogsByDate(today),
  })

  if (medsLoading || logsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }

  if (!medications?.length) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No medications added yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {medications.map((med: Medication) => {
        const log = logs?.find(
          (l: MedicationLogWithMedications) => l.medication_id === med.id
        )

        if (!log) {
          return null
        }

        return (
          <MedicationCard
            key={med.id}
            medication={med}
            log={log}
            today={today}
          />
        )
      })}
    </div>
  )
}
