import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, Bell, Calendar } from "lucide-react"

export function QuickActions() {
  const handleSendReminder = () => {
    toast.success("Reminder sent to patient!")
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

      <Button className="flex items-center space-x-2" variant="outline">
        <Bell className="w-4 h-4" />
        <span>Configure Notifications</span>
      </Button>

      <Button className="flex items-center space-x-2" variant="outline">
        <Calendar className="w-4 h-4" />
        <span>View Full Calendar</span>
      </Button>
    </div>
  )
}