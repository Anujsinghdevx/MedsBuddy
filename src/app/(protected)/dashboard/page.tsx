"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PatientView } from "@/components/PatientView/PatientView"
import { CaretakerView } from "@/components/Caretaker/CaretakerView"
import { motion } from "framer-motion"
import { User, HeartHandshake, ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const [role, setRole] = useState<"patient" | "caretaker" | null>(null)

  return (
    <div className="min-h-screen bg-[#F6FAF9]">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

        {!role && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-semibold text-gray-900">
                Today’s Care Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                Everything you need to stay informed and supported —
                simple, clear, and stress-free.
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

              <div className="grid md:grid-cols-2 gap-10">
                <div
                  onClick={() => setRole("patient")}
                  className="cursor-pointer bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-teal-50 text-teal-600 p-4 rounded-xl">
                      <User size={28} />
                    </div>
                    <h3 className="text-xl font-semibold">
                      I’m Taking My Medication
                    </h3>
                  </div>

                  <p className="text-gray-600 text-base leading-relaxed mb-8">
                    Track today’s medicines, mark them as taken,
                    and stay consistent with your care plan.
                  </p>

                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base rounded-xl">
                    Continue
                  </Button>
                </div>

                <div
                  onClick={() => setRole("caretaker")}
                  className="cursor-pointer bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
                      <HeartHandshake size={28} />
                    </div>
                    <h3 className="text-xl font-semibold">
                      I’m Caring for Someone
                    </h3>
                  </div>

                  <p className="text-gray-600 text-base leading-relaxed mb-8">
                    Monitor adherence, receive updates, and
                    ensure your loved one stays on track.
                  </p>

                  <Button
                    variant="outline"
                    className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 py-6 text-base rounded-xl"
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