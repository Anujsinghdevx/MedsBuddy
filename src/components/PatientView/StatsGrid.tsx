import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

export function StatsGrid({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Day Streak" value={stats.streak} />
      <StatCard title="Today's Status" value={stats.todayStatus} />
      <StatCard title="Monthly Rate" value={`${stats.monthlyRate}%`} />
    </div>
  )
}

function StatCard({ title, value }: any) {
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
