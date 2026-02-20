import { createClient } from "@supabase/supabase-js"
import sgMail from "@sendgrid/mail"
import { NextRequest, NextResponse } from "next/server"
import { DatabaseError, ExternalServiceError } from "@/lib/errors"

type ReminderLog = {
  id: string
  scheduled_at: string
  medications: {
    name: string
    dosage: string
  }[]
  users: {
    email: string | null
  }[]
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error("CRON_SECRET not configured")
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Server configuration error"
          }
        },
        { status: 500 }
      )
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("Unauthorized CRON access attempt", {
        ip: req.headers.get("x-forwarded-for"),
        timestamp: new Date().toISOString()
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized"
          }
        },
        { status: 401 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (!process.env.SENDGRID_API_KEY) {
      throw new ExternalServiceError("SendGrid", "SendGrid API key not configured")
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const now = new Date()
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("medication_logs")
      .select(
        `
        id,
        scheduled_at,
        medications!inner (
          name,
          dosage
        ),
        users!inner (
          email
        )
      `
      )
      .gte("scheduled_at", startOfToday.toISOString())
      .lte("scheduled_at", now.toISOString())
      .eq("status", "pending")
      .eq("reminder_sent", false)

    if (error) {
      throw new DatabaseError("Failed to fetch pending medications", {
        code: error.code,
        details: error.details,
      })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: { sent: 0 },
        message: "No reminders to send",
      })
    }

    const logs: ReminderLog[] = data
    let sentCount = 0
    const failedEmails: string[] = []

    for (const log of logs) {
      const medication = log.medications?.[0]
      const user = log.users?.[0]

      if (!medication || !user?.email) continue

      try {
        const msg = {
          to: user.email,
          from: "anujsingh.devx@gmail.com",
          subject: "Medication Reminder 💊",
          text: `Reminder to take ${medication.name} (${medication.dosage})`,
          html: `
            <h2>Medication Reminder 💊</h2>
            <p>Please take your medication:</p>
            <strong>${medication.name}</strong><br/>
            Dosage: ${medication.dosage}
          `,
        }

        await sgMail.send(msg)

        await supabase
          .from("medication_logs")
          .update({ reminder_sent: true })
          .eq("id", log.id)
          .eq("reminder_sent", false)

        sentCount++
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError)
        failedEmails.push(user.email)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sent: sentCount,
        total: logs.length,
        ...(failedEmails.length > 0 && { failed: failedEmails }),
      },
      message: `Sent ${sentCount} of ${logs.length} reminder(s)`,
    })
  } catch (error) {
    console.error("Check Pending Medications Error:", error)

    if (error instanceof ExternalServiceError || error instanceof DatabaseError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            ...(error.details && { details: error.details }),
          },
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check pending medications",
        },
      },
      { status: 500 }
    )
  }
}
