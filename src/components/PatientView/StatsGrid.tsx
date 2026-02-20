"use client"

import { MedicationStats } from "@/types/supabase"
import { Flame, CheckCircle2, TrendingUp } from "lucide-react"

interface StatsGridProps {
  stats: MedicationStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <StatCard
        title="Consistency Streak"
        value={`${stats.streak} days`}
        description="You’ve been staying consistent."
        icon={Flame}
        accent="bg-orange-50 text-orange-600"
      />

      <StatCard
        title="Today’s Progress"
        value={stats.todayStatus}
        description="Your current status for today."
        icon={CheckCircle2}
        accent="bg-teal-50 text-teal-600"
      />

      <StatCard
        title="Monthly Adherence"
        value={`${stats.monthlyRate}%`}
        description="Overall medication consistency this month."
        icon={TrendingUp}
        accent="bg-emerald-50 text-emerald-600"
      />

    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: any
  accent: string
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${accent}`}>
          <Icon size={22} />
        </div>

        <h3 className="text-base font-medium text-gray-600">
          {title}
        </h3>
      </div>

      <div>
        <p className="text-3xl md:text-4xl font-semibold text-gray-900">
          {value}
        </p>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

    </div>
  )
}