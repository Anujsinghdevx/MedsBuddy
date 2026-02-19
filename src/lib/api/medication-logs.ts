import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/types/supabase"

export type MedicationLogInsert = TablesInsert<"medication_logs">

export async function fetchLogsByDate(date: string) {
  const supabase = createClient()

  await supabase
    .from("medication_logs")
    .update({ status: "missed" })
    .lt("scheduled_at", new Date().toISOString())
    .eq("status", "pending")

  const { data, error } = await supabase
    .from("medication_logs")
    .select("*")
    .eq("scheduled_for", date)
    .order("scheduled_at", { ascending: true })

  if (error) throw error

  return data
}

export async function markMedicationTaken(logId: string, file?: File) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  const formData = new FormData()
  if (file) formData.append("proof", file)

  const res = await fetch(`/api/medication-logs/${logId}/mark-taken`, {
    method: "POST",
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data?.error || "Failed to mark medication as taken")
  }

  return res.json()
}


