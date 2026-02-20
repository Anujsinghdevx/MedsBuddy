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
    <div className="min-h-screen bg-[#F6FAF9] text-slate-800 flex flex-col">

      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl space-y-6"
        >
          <div className="flex justify-center">
            <div className="bg-teal-100 text-teal-700 p-4 rounded-2xl">
              <HeartHandshake size={36} />
            </div>
          </div>

          {loading ? null : user ? (
            <>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Welcome back to MedsBuddy
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Let’s continue taking care of today’s medications.
              </p>

              <div className="pt-6">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-base rounded-xl"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Helping Families Care with Confidence
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                MedsBuddy makes it simple to manage medications, track adherence,
                and stay worry-free — together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-base rounded-xl"
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-teal-600 text-teal-700 hover:bg-teal-50 px-8 py-6 text-base rounded-xl"
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
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10"
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
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-4 border border-slate-100">
      <div className="flex justify-center">
        <div className={`${bg} ${text} p-4 rounded-xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-slate-600 text-base leading-relaxed">
        {description}
      </p>
    </div>
  )
}