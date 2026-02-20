import { MedicationLogWithUser } from "@/types/supabase"
import { Badge } from "@/components/ui/badge"

interface RecentActivityProps {
  logs: MedicationLogWithUser[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
  const recentLogs = logs.slice(0, 5)

  const getBadgeVariant = (status: string | null) => {
    switch (status) {
      case "taken":
        return "default"
      case "missed":
        return "destructive"
      case "skipped":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "taken":
        return "Taken"
      case "missed":
        return "Missed"
      case "skipped":
        return "Skipped"
      default:
        return "Pending"
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>

      <div className="space-y-2">
        {recentLogs.map((log) => (
          <div
            key={log.id}
            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">
                {log.medications?.name || "Unknown"}
              </span>
              {log.medications?.dosage && (
                <span className="text-sm text-gray-500">{log.medications.dosage}</span>
              )}
            </div>

            <Badge variant={getBadgeVariant(log.status)}>
              {getStatusLabel(log.status)}
            </Badge>
          </div>
        ))}

        {recentLogs.length === 0 && (
          <p className="text-gray-500 text-sm">No recent activity.</p>
        )}
      </div>
    </div>
  )
}