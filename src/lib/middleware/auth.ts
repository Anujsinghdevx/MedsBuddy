import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { AuthenticationError } from "@/lib/errors"
import type { User } from "@supabase/supabase-js"

export async function requireAuth(req: NextRequest): Promise<User> {
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
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthenticationError("Authentication required. Please log in.")
  }

  return user
}

export async function requireServiceAuth(req: NextRequest): Promise<User> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthenticationError("Missing or invalid authorization header")
  }

  const token = authHeader.split(" ")[1]

  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new AuthenticationError("Invalid or expired token")
  }

  return user
}
