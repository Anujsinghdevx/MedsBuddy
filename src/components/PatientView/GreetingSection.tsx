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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex items-start gap-6">
      
      <div className="bg-teal-50 text-teal-600 p-4 rounded-xl">
        <Icon size={28} />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
          {greeting}.
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
          Let’s take a moment to review today’s medications and stay on track.
        </p>
      </div>
    </div>
  )
}