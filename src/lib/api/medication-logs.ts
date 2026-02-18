import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/types/supabase"

export type MedicationLogInsert = TablesInsert<"medication_logs">

// Fetch logs for a specific date
export async function fetchLogsByDate(date: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("medication_logs")
    .select("*")
    .eq("scheduled_for", date)

  if (error) throw error

  return data
}

// Mark medication as taken
export async function markMedicationTaken(
  medicationId: string,
  userId: string,
  date: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("medication_logs")
    .insert({
      medication_id: medicationId,
      user_id: userId,
      scheduled_for: date,
      taken_at: new Date().toISOString(),
      status: "taken",
    })
    .select()
    .single()

  if (error) throw error

  return data
}
