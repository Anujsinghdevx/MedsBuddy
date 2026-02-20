"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, Bell, Calendar } from "lucide-react"

export function QuickActions() {
  const handleSendReminder = async () => {
    try {
      const response = await fetch("/api/check_pending_medications")
      const data = await response.json()

      if (!response.ok) {
        toast.error(data?.error || "Failed to send reminders")
        return
      }

      toast.success(data?.message || "Reminder sent successfully")
    } catch (err) {
      console.error(err)
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={handleSendReminder}
        className="flex items-center space-x-2"
        variant="outline"
      >
        <Mail className="w-4 h-4" />
        <span>Send Reminder Email</span>
      </Button>
    </div>
  )
}