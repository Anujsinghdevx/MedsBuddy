"use client"

import { MedicationCard } from "./MedicationCard"
import { MedicationLogWithMedications } from "@/types/supabase"
import { Pill } from "lucide-react"

interface TodayMedicationsProps {
  logs: MedicationLogWithMedications[]
}

export function TodayMedications({ logs }: TodayMedicationsProps) {
  const today = new Date().toISOString().split("T")[0]

  const todayLogs = logs.filter(
    (log: MedicationLogWithMedications) =>
      log.scheduled_for === today
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 space-y-8">

      <div className="flex items-center gap-4">
        <div className="bg-teal-50 text-teal-600 p-3 rounded-xl">
          <Pill size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Today’s Medications
          </h2>

          <p className="text-gray-600 text-base">
            {todayLogs.length > 0
              ? `${todayLogs.length} scheduled for today`
              : "Nothing scheduled for today"}
          </p>
        </div>
      </div>

      {todayLogs.length === 0 && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-6">
          <p className="text-teal-700 text-base leading-relaxed">
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