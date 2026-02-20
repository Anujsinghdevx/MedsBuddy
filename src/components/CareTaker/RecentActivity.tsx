"use client"

import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { Image as ImageIcon } from "lucide-react"
import { Button } from "../ui/button"

interface MedicationLog {
  id: string
  scheduled_for: string
  status: "taken" | "missed" | "skipped" | "pending" | null
  proof_url: string | null
  medications: {
    name: string
    dosage: string | null
  } | null
}

export function RecentActivity() {
  const [logs, setLogs] = useState<MedicationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/recent_activity")
        const data = await res.json()

        console.log("FRONTEND DATA:", data)

        if (data?.logs && Array.isArray(data.logs)) {
          setLogs(data.logs)
        } else {
          setLogs([])
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const getBadgeVariant = (
    status: MedicationLog["status"]
  ): "default" | "destructive" | "outline" | "secondary" => {
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

  const getStatusLabel = (status: MedicationLog["status"]) => {
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

  if (loading) {
    return <div className="text-gray-500">Loading...</div>
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">
        Recent Activity
      </h2>

      {logs.length === 0 && (
        <p className="text-gray-500 text-sm">No recent activity.</p>
      )}

      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
        > 
          <div className="flex-1 space-y-1">
            <div className="font-medium text-gray-900">
              {log.medications?.name ?? "Unknown Medication"}
            </div>

            {log.medications?.dosage && (
              <div className="text-sm text-gray-500">
                {log.medications.dosage}
              </div>
            )}

            <div className="text-xs text-gray-400">
              {log.scheduled_for}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
  <Badge
    variant={getBadgeVariant(log.status)}
    className="px-3 py-1 text-xs font-medium rounded-full"
  >
    {getStatusLabel(log.status)}
  </Badge>

  {log.status === "taken" && log.proof_url && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.open(log.proof_url!, "_blank")}
      className="flex items-center gap-2 text-primary hover:bg-primary/10"
    >
      <ImageIcon className="h-4 w-4" />
      <span>See Proof</span>
    </Button>
  )}
</div>
        </div>
      ))}
    </div>
  )
}