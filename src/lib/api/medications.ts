import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/types/supabase"

export type MedicationInsert = TablesInsert<"medications">

export async function fetchMedications() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("medications")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw error

    return data
}

export async function createMedication(
    values: MedicationInsert,
    userId: string
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("medications")
        .insert({
            ...values,
            user_id: userId,
        })
        .select()
        .single()

    if (error) throw error

    return data
}


export async function deleteMedication(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id)

    if (error) throw error
}
