import { MedicationLogWithUser } from "@/types/supabase"

interface RecentActivityProps {
  logs: MedicationLogWithUser[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
  const recentLogs = logs.slice(0, 5)

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Recent Activity</h2>
      <ul className="space-y-1">
        {recentLogs.map((log: MedicationLogWithUser) => (
          <li key={log.id} className="flex justify-between p-2 border rounded">
            <span>{log.medications?.name || "Unknown"}</span>
            <span
              className={`font-semibold ${
                log.status === "taken"
                  ? "text-green-600"
                  : log.status === "missed"
                  ? "text-red-500"
                  : "text-yellow-500"
              }`}
            >
              {log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
