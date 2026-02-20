"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { UserPlus, Loader2 } from "lucide-react"

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (!data.session) {
        toast.success("Check your email to confirm your account.")
        router.push("/login")
        return
      }

      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6FAF9] px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-lg"
      >
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-teal-100 p-4 text-teal-700">
              <UserPlus size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-sm text-gray-600">
            Sign up to manage medications and caregiving tasks efficiently.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="py-3"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-3"
            />
          </div>

          <Button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-base font-semibold text-white hover:bg-teal-700"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-teal-600 hover:underline">
            Login
          </a>
        </div>
      </motion.div>
    </div>
  )
}
