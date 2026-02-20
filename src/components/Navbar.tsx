"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/supabase-provider"
import { useEffect, useState } from "react"

export default function Navbar() {
  const router = useRouter()
  const supabase = useSupabase()
  const [user, setUser] = useState<null | { id: string }>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user ?? null)
      setLoading(false)
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div
          className="flex cursor-pointer flex-col leading-tight "
          onClick={() => router.push("/")}
        >
          <span className="text-xl font-semibold text-teal-700">MedsBuddy</span>
          <span className="text-xs text-slate-500">Because every dose matters.</span>
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-700 hover:text-teal-700"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>

              <Button
                size="sm"
                className="rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-700 hover:text-teal-700"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>

              <Button
                size="sm"
                className="rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => router.push("/signup")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
