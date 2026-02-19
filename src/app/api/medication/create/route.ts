import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const { data: medication, error } = await supabase
    .from("medications")
    .insert({
      ...body,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
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

  const { error: logError } = await supabase
    .from("medication_logs")
    .insert(logs)

  if (logError) {
    return NextResponse.json(
      { message: logError.message },
      { status: 400 }
    )
  }

  return NextResponse.json(medication)
}
