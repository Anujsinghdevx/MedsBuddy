"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HeartHandshake, Pill, ShieldCheck } from "lucide-react"
import { useSupabase } from "@/providers/supabase-provider"
import { useEffect, useState } from "react"

export default function LandingPage() {
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
  }, [supabase])

  return (
    <div className="flex min-h-screen flex-col bg-[#F6FAF9] text-slate-800">
      <section className="flex flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl space-y-6"
        >
          <div className="flex justify-center">
            <div className="rounded-2xl bg-teal-100 p-4 text-teal-700">
              <HeartHandshake size={36} />
            </div>
          </div>

          {loading ? null : user ? (
            <>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Welcome back to MedsBuddy
              </h1>

              <p className="text-lg leading-relaxed text-slate-600 md:text-xl">
                Let’s continue taking care of today’s medications.
              </p>

              <div className="pt-6">
                <Button
                  size="lg"
                  className="rounded-xl bg-teal-600 px-8 py-6 text-base text-white hover:bg-teal-700"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Helping Families Care with Confidence
              </h1>

              <p className="text-lg leading-relaxed text-slate-600 md:text-xl">
                MedsBuddy makes it simple to manage medications, track adherence, and stay
                worry-free — together.
              </p>

              <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-xl bg-teal-600 px-8 py-6 text-base text-white hover:bg-teal-700"
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-teal-600 px-8 py-6 text-base text-teal-700 hover:bg-teal-50"
                  onClick={() => router.push("/signup")}
                >
                  Create Account
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </section>

      <section className="px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3"
        >
          <FeatureCard
            icon={<Pill size={28} />}
            title="Track Medications Easily"
            description="Mark medicines as taken in seconds and stay consistent every day."
            bg="bg-teal-50"
            text="text-teal-600"
          />

          <FeatureCard
            icon={<ShieldCheck size={28} />}
            title="Peace of Mind for Caregivers"
            description="Monitor adherence and receive updates without constant checking."
            bg="bg-emerald-50"
            text="text-emerald-600"
          />

          <FeatureCard
            icon={<HeartHandshake size={28} />}
            title="Built Around Family Care"
            description="Designed to reduce stress and support the people you love."
            bg="bg-amber-50"
            text="text-amber-600"
          />
        </motion.div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  bg,
  text,
}: {
  icon: React.ReactNode
  title: string
  description: string
  bg: string
  text: string
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
      <div className="flex justify-center">
        <div className={`${bg} ${text} rounded-xl p-4`}>{icon}</div>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-base leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}
