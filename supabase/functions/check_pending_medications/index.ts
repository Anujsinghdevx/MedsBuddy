
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function sendEmail(to: string, subject: string, body: string) {
  console.log(`Sending email to ${to} - Subject: ${subject}\n${body}`)

}

Deno.serve(async (req) => {
  try {
    const now = new Date()

    const { data: pendingLogs, error } = await supabase
      .from('medication_logs')
      .select(`
        id,
        user_id,
        scheduled_at,
        status,
        user:users(full_name, email)
      `)
      .eq('status', 'taken')
      .lte('scheduled_at', new Date(now.getTime() - 60 * 60 * 1000)) 
    if (error) throw error

    if (!pendingLogs || pendingLogs.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending medications' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (const log of pendingLogs) {
      await supabase
        .from('medication_logs')
        .update({ status: 'missed' })
        .eq('id', log.id)

      await sendEmail(
        log.user.email,
        'Medication Missed Reminder',
        `Hello ${log.user.full_name},\n\nYou missed your medication scheduled at ${log.scheduled_at}. Please take it as soon as possible.`
      )
    }

    return new Response(JSON.stringify({ message: 'Processed pending medications', count: pendingLogs.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error in check_pending_medications:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
