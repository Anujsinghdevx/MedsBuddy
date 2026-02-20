import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CaretakerStats } from "@/types/supabase"

interface StatsGridProps {
  stats: CaretakerStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Adherence Rate" value={`${stats.adherenceRate}%`} color="emerald" />
      <StatCard title="Current Streak" value={stats.streak} color="blue" />
      <StatCard title="Missed This Month" value={stats.missedThisMonth} color="destructive" />
      <StatCard title="Taken This Week" value={stats.takenThisWeek} color="primary" />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  color?: "emerald" | "blue" | "destructive" | "primary"
}

function StatCard({ title, value, color = "primary" }: StatCardProps) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    destructive: "text-destructive",
    primary: "text-primary",
  }

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      </CardContent>
    </Card>
  )
}