"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchMedications, deleteMedication } from "@/lib/api/medications"
import { fetchLogsByDate, markMedicationTaken } from "@/lib/api/medication-logs"
import { createClient } from "@/lib/supabase/client"

export default function MedicationList() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const today = new Date().toISOString().split("T")[0]

  // Fetch medications
  const { data: medications, isLoading: medsLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: fetchMedications,
  })

  // Fetch today's logs
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["today-logs", today],
    queryFn: () => fetchLogsByDate(today),
  })

  if (medsLoading || logsLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      {medications?.map((med) => {
        const log = logs?.find(
          (l) => l.medication_id === med.id
        )

        return (
          <div key={med.id} className="border p-4 rounded">
            <h3 className="font-bold">{med.name}</h3>
            <p>Dosage: {med.dosage}</p>
            <p>Frequency: {med.frequency}</p>

            {/* Status Logic */}
            {log?.status === "taken" ? (
              <p className="text-green-600 font-semibold mt-2">
                Taken Today
              </p>
            ) : (
              <button
                onClick={async () => {
                  const {
                    data: { user },
                  } = await supabase.auth.getUser()

                  if (!user) return

                  await markMedicationTaken(
                    med.id,
                    user.id,
                    today
                  )

                  queryClient.invalidateQueries({
                    queryKey: ["today-logs", today],
                  })
                }}
                className="bg-black text-white px-3 py-1 mt-2"
              >
                Mark as Taken
              </button>
            )}

            <button
              onClick={async () => {
                await deleteMedication(med.id)
                queryClient.invalidateQueries({
                  queryKey: ["medications"],
                })
              }}
              className="text-red-500 mt-2 block"
            >
              Delete
            </button>
          </div>
        )
      })}
    </div>
  )
}
