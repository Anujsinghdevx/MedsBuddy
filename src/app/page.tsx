"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6 text-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-xl space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold">
          MediCare Companion
        </h1>
        <p className="text-gray-600 text-lg">
          Stay on track with your medications and help your loved ones maintain adherence.
        </p>

        <div className="flex space-x-4 justify-center mt-6">
          <Button onClick={() => router.push("/login")} size="lg">
            Login
          </Button>
          <Button
            onClick={() => router.push("/signup")}
            size="lg"
            variant="outline"
          >
            Sign Up
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-20 grid md:grid-cols-3 gap-10 text-center max-w-4xl"
      >
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Track Medications</h3>
          <p className="text-gray-500 text-sm">
            Mark your medications as taken and stay healthy.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Monitor Adherence</h3>
          <p className="text-gray-500 text-sm">
            Caretakers can check adherence and receive notifications.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Proof Uploads</h3>
          <p className="text-gray-500 text-sm">
            Upload photos for confirmation and peace of mind.
          </p>
        </div>
      </motion.div>

      <footer className="mt-32 text-gray-400 text-sm">
        © 2026 MediCare Companion. All rights reserved.
      </footer>
    </div>
  )
}
