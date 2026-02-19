import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CaretakerStats } from "@/types/supabase"

interface StatsGridProps {
  stats: CaretakerStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Adherence Rate" value={`${stats.adherenceRate}%`} />
      <StatCard title="Current Streak" value={stats.streak} />
      <StatCard title="Missed This Month" value={stats.missedThisMonth} />
      <StatCard title="Taken This Week" value={stats.takenThisWeek} />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
