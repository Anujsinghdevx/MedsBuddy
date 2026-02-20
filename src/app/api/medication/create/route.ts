import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { AuthenticationError, DatabaseError, ValidationError } from "@/lib/errors"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { sanitizeMedicationInput } from "@/lib/sanitize"

export async function POST(req: NextRequest) {
  // Rate limiting: 10 medication creations per minute
  const rateLimitResult = rateLimit({ maxRequests: 10, interval: 60000 })(req)
  if (rateLimitResult) return rateLimitResult

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new AuthenticationError("Authentication required")
    }

    const rawBody = await req.json()

    // Sanitize and validate input
    const sanitizedBody = sanitizeMedicationInput(rawBody)
    
    if (!sanitizedBody) {
      throw new ValidationError("Invalid medication data provided", {
        hint: "Please check name, time array, and duration_days",
      })
    }

    const { data: medication, error } = await supabase
      .from("medications")
      .insert({
        ...sanitizedBody,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError("Failed to create medication", {
        code: error.code,
        details: error.details,
      })
    }

    const today = new Date().toISOString().split("T")[0]
    const logs = []

    for (let day = 0; day < medication.duration_days; day++) {
      const scheduledDate = new Date(today)
      scheduledDate.setDate(scheduledDate.getDate() + day)
      const formattedDate = scheduledDate.toISOString().split("T")[0]

      for (const time of medication.time) {
        logs.push({
          medication_id: medication.id,
          user_id: user.id,
          scheduled_for: formattedDate,
          scheduled_at: `${formattedDate}T${time}:00`,
          status: "pending",
        })
      }
    }

    const { error: logError } = await supabase.from("medication_logs").insert(logs)

    if (logError) {
      throw new DatabaseError("Failed to create medication logs", {
        code: logError.code,
        details: logError.details,
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: medication,
        message: "Medication created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create Medication Error:", error)

    if (
      error instanceof AuthenticationError ||
      error instanceof ValidationError ||
      error instanceof DatabaseError
    ) {
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
          message: "Failed to create medication",
        },
      },
      { status: 500 }
    )
  }
}
