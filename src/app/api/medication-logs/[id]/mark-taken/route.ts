import { NextRequest } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { requireServiceAuth } from "@/lib/middleware/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { DatabaseError, ExternalServiceError, NotFoundError } from "@/lib/errors"

async function handler(req: NextRequest, context?: { params: Promise<Record<string, string>> }) {
  const { id: logId } = await context!.params
  const user = await requireServiceAuth(req)

  const formData = await req.formData()
  const file = formData.get("proof") as File | null

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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
    if (error.code === "PGRST116") {
      throw new NotFoundError("Medication log")
    }
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
