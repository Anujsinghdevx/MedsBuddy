import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/types/supabase"

export type MedicationInsert = TablesInsert<"medications">

export async function fetchMedications() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return []
  }

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createMedication(values: MedicationInsert) {
  const res = await fetch("/api/medication/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...values,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create medication")
  }

  return res.json()
}

export async function deleteMedication(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("medications").delete().eq("id", id)

  if (error) throw error
}
