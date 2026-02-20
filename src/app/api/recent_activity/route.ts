"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { AuthenticationError, DatabaseError } from "@/lib/errors"

interface Medication {
  name: string
  dosage?: string
}

interface MedicationLog {
  id: string
  scheduled_for: string
  status: "taken" | "missed" | "skipped" | "pending" | null
  proof_url?: string | null
  medications: Medication[]
}

interface RecentLog extends MedicationLog {
  hasProof: boolean
  proof_url?: string | null
}

export async function GET() {
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

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from("medication_logs")
      .select(
        `
        id,
        scheduled_for,
        status,
        proof_url,
        medications!inner (
          name,
          dosage
        )
      `
      )
      .lte("scheduled_for", today.toISOString())
      .order("scheduled_for", { ascending: false })

    if (error) {
      throw new DatabaseError("Failed to fetch recent activity", {
        code: error.code,
        details: error.details,
      })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: { logs: [] },
      })
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const BUCKET_NAME = "proof-photos"

    const recentLogs: RecentLog[] = data.slice(0, 5).map((log) => {
      const medication = log.medications

      let fullProofUrl: string | null = null
      if (log.proof_url) {
        fullProofUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${log.proof_url}`
      }

      return {
        ...log,
        medications: medication,
        hasProof: log.status === "taken" && !!fullProofUrl,
        proof_url: fullProofUrl,
      }
    })

    return NextResponse.json({
      success: true,
      data: { logs: recentLogs },
    })
  } catch (error) {
    console.error("Recent Activity Error:", error)

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
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
          message: "Failed to fetch recent activity",
        },
      },
      { status: 500 }
    )
  }
}
