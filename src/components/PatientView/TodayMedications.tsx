"use client"

import { MedicationCard } from "./MedicationCard"
import { MedicationLogWithMedications } from "@/types/supabase"
import { Pill } from "lucide-react"

interface TodayMedicationsProps {
  logs: MedicationLogWithMedications[]
}

export function TodayMedications({ logs }: TodayMedicationsProps) {
  const today = new Date().toISOString().split("T")[0]

  const todayLogs = logs.filter((log: MedicationLogWithMedications) => log.scheduled_for === today)

  return (
    <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
          <Pill size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Today’s Medications</h2>

          <p className="text-base text-gray-600">
            {todayLogs.length > 0
              ? `${todayLogs.length} scheduled for today`
              : "Nothing scheduled for today"}
          </p>
        </div>
      </div>

      {todayLogs.length === 0 && (
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-6">
          <p className="text-base leading-relaxed text-teal-700">
            You’re all set for today. Take this time to rest and stay well.
          </p>
        </div>
      )}

      {todayLogs.length > 0 && (
        <div className="space-y-6">
          {todayLogs.map((log: MedicationLogWithMedications) => (
            <MedicationCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
