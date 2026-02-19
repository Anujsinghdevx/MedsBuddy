"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/supabase-provider"
import { useEffect, useState } from "react"

export default function Navbar() {
  const router = useRouter()
  const supabase = useSupabase()
  const [user, setUser] = useState<null | { id: string }> (null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => router.push("/")}>
          MediCare Companion
        </div>

        <div className="flex items-center space-x-4">
          {loading ? null : user ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
