"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, HeartHandshake, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientView } from "@/components/PatientView/PatientView"
import { CaretakerView } from "@/components/CareTaker/CaretakerView"

export default function DashboardPage() {
  const [role, setRole] = useState<"patient" | "caretaker" | null>(null)

  return (
    <div className="min-h-screen bg-[#F6FAF9]">
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        {!role && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-semibold text-gray-900">Today’s Care Dashboard</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-gray-600">
                Everything you need to stay informed and supported — simple, clear, and stress-free.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-semibold text-gray-800">
                How would you like to continue?
              </h2>

              <div className="grid gap-10 md:grid-cols-2">
                <div
                  onClick={() => setRole("patient")}
                  className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-10 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="rounded-xl bg-teal-50 p-4 text-teal-600">
                      <User size={28} />
                    </div>
                    <h3 className="text-xl font-semibold">I’m Taking My Medication</h3>
                  </div>

                  <p className="mb-8 text-base leading-relaxed text-gray-600">
                    Track today’s medicines, mark them as taken, and stay consistent with your care
                    plan.
                  </p>

                  <Button className="w-full rounded-xl bg-teal-600 py-6 text-base text-white hover:bg-teal-700">
                    Continue
                  </Button>
                </div>

                <div
                  onClick={() => setRole("caretaker")}
                  className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-10 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-50 p-4 text-emerald-600">
                      <HeartHandshake size={28} />
                    </div>
                    <h3 className="text-xl font-semibold">I’m Caring for Someone</h3>
                  </div>

                  <p className="mb-8 text-base leading-relaxed text-gray-600">
                    Monitor adherence, receive updates, and ensure your loved one stays on track.
                  </p>

                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-teal-600 py-6 text-base text-teal-700 hover:bg-teal-50"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {role && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <Button
              variant="ghost"
              onClick={() => setRole(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Change Mode
            </Button>

            {role === "patient" && <PatientView />}
            {role === "caretaker" && <CaretakerView />}
          </motion.div>
        )}
      </div>
    </div>
  )
}
