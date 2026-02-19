import { MedicationCard } from "./MedicationCard"
import { MedicationLogWithMedications } from "@/types/supabase"

interface TodayMedicationsProps {
  logs: MedicationLogWithMedications[]
}

export function TodayMedications({ logs }: TodayMedicationsProps) {
  const today = new Date().toISOString().split("T")[0]

  const todayLogs = logs.filter(
    (log: MedicationLogWithMedications) => log.scheduled_for === today
  )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Today's Medication
      </h2>

      {todayLogs.length === 0 && (
        <p className="text-muted-foreground">
          No medications scheduled today.
        </p>
      )}

      {todayLogs.map((log: MedicationLogWithMedications) => (
        <MedicationCard key={log.id} log={log} />
      ))}
    </div>
  )
}
