"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function LogoutButton() {
  const supabase = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Logged out successfully")
      router.replace("/login")
      router.refresh() 
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to logout. Please try again."

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}
