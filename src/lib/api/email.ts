import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: JSON.stringify({ to, subject, html }),
  })

  if (error) console.error("Email sending error:", error)
  return data
}
