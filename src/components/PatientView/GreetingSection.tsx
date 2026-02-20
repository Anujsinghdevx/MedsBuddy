"use client"

import { Sun, Sunrise, Moon } from "lucide-react"

export function GreetingSection() {
  const hour = new Date().getHours()

  let greeting = "Good Evening"
  let Icon = Moon

  if (hour < 12) {
    greeting = "Good Morning"
    Icon = Sunrise
  } else if (hour < 18) {
    greeting = "Good Afternoon"
    Icon = Sun
  }

  return (
    <div className="flex items-start gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
      <div className="rounded-xl bg-teal-50 p-4 text-teal-600">
        <Icon size={28} />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">{greeting}.</h1>

        <p className="max-w-xl text-lg leading-relaxed text-gray-600">
          Let’s take a moment to review today’s medications and stay on track.
        </p>
      </div>
    </div>
  )
}
