import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: logId } = await context.params

    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

      if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("medication_logs")
      .update({
        status: "taken",
        taken_at: new Date().toISOString(),
        proof_url: filePath
      })
      .eq("id", logId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    let signedUrl: string | null = null
    if (filePath) {
      const { data: urlData, error: urlError } = await supabase.storage
        .from("proof-photos")
        .createSignedUrl(filePath, 60 * 60)

      if (!urlError) signedUrl = urlData.signedUrl
    }

    return NextResponse.json({
      message: "Medication marked as taken",
      data: { ...data, proof_url: signedUrl }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}