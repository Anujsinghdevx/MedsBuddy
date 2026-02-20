import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "./email"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function processPendingMedications() {
  try {
    const { data: pendingMeds, error } = await supabase
      .from("medication_logs")
      .select(`id, user_id, scheduled_at, status`)
      .eq("status", "taken")
      .lte("scheduled_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) throw error
    if (!pendingMeds || pendingMeds.length === 0) return { message: "No pending medications" }

    for (const med of pendingMeds) {
      await supabase.from("medication_logs").update({ status: "missed" }).eq("id", med.id)

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", med.user_id)
        .single()

      if (userError) console.error(userError)
      if (user) {
        const html = `
          <p>Hi ${user.full_name},</p>
          <p>You missed your scheduled medication at ${med.scheduled_at}.</p>
          <p>Please take it as soon as possible.</p>
        `
        await sendEmail(user.email, "Medication Missed", html)
      }
    }

    return { message: "Pending medications processed" }
  } catch (err) {
    console.error(err)
    return { error: "Internal Server Error" }
  }
}
