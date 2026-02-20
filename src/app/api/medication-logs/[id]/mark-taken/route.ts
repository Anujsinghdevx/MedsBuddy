import { NextRequest } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { requireServiceAuth } from "@/lib/middleware/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { DatabaseError, ExternalServiceError, NotFoundError, ValidationError } from "@/lib/errors"

const GRACE_PERIOD_MINUTES = 30

async function handler(req: NextRequest, context?: { params: Promise<Record<string, string>> }) {
  const { id: logId } = await context!.params
  const user = await requireServiceAuth(req)

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: logData, error: logError } = await supabase
    .from("medication_logs")
    .select("id, scheduled_at, status, user_id")
    .eq("id", logId)
    .eq("user_id", user.id)
    .single()

  if (logError || !logData) {
    throw new NotFoundError("Medication log")
  }

  const now = new Date()
  const scheduledTime = new Date(logData.scheduled_at)

  // Calculate time difference in minutes
  const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60)

  if (diffMinutes < -GRACE_PERIOD_MINUTES) {
    const hoursUntil = Math.abs(Math.floor(diffMinutes / 60))
    const minutesUntil = Math.abs(Math.floor(diffMinutes % 60))

    throw new ValidationError("Cannot mark medication as taken before scheduled time", {
      scheduled_at: scheduledTime.toISOString(),
      current_time: now.toISOString(),
      time_until_scheduled: hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}m` : `${minutesUntil}m`,
      grace_period_minutes: GRACE_PERIOD_MINUTES,
    })
  }

  if (logData.status === "taken") {
    throw new ValidationError("Medication already marked as taken")
  }
  const formData = await req.formData()
  const file = formData.get("proof") as File | null

  let filePath: string | null = null

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileExt = file.name.split(".").pop()
    filePath = `${user.id}/${uuidv4()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("proof-photos")
      .upload(filePath, buffer, { contentType: file.type })

    if (uploadError) {
      throw new ExternalServiceError(
        "Storage",
        `Failed to upload proof photo: ${uploadError.message}`
      )
    }
  }

  const { data, error } = await supabase
    .from("medication_logs")
    .update({
      status: "taken",
      taken_at: new Date().toISOString(),
      proof_url: filePath,
    })
    .eq("id", logId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new DatabaseError("Failed to update medication log", {
      code: error.code,
      details: error.details,
    })
  }

  let signedUrl: string | null = null
  if (filePath) {
    const { data: urlData, error: urlError } = await supabase.storage
      .from("proof-photos")
      .createSignedUrl(filePath, 60 * 60)

    if (!urlError) signedUrl = urlData.signedUrl
  }

  return ApiResponse.success({ ...data, proof_url: signedUrl }, "Medication marked as taken")
}

export const POST = withErrorHandling(handler)
