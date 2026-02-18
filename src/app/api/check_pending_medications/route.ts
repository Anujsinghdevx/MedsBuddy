import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: pendingMeds, error } = await supabase
      .from('medication_logs')
      .select('id, user_id, scheduled_at, status')
      .eq('status', 'taken') 
      .lte('scheduled_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) 

    if (error) throw error

    for (const med of pendingMeds || []) {
      await supabase
        .from('medication_logs')
        .update({ status: 'missed' })
        .eq('id', med.id)

      const { data: user } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', med.user_id)
        .single()

      if (user) {
        await supabase.functions.invoke('send-email', {
          body: JSON.stringify({
            to: user.email,
            subject: 'Medication Missed',
            html: `<p>Hi ${user.full_name},</p>
                   <p>You missed your scheduled medication at ${med.scheduled_at}.</p>`,
          }),
        })
      }
    }

    return new Response(JSON.stringify({ message: 'Processed pending meds' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
