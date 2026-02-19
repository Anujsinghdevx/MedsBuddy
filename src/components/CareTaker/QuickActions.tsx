import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function QuickActions() {
  const handleSendReminder = () => {
    toast.success("Reminder sent to patient!")
  }

  return (
    <div className="space-x-2 flex flex-wrap">
      <Button onClick={handleSendReminder} variant="outline">
        Send Reminder Email
      </Button>
      <Button variant="outline">Configure Notifications</Button>
      <Button variant="outline">View Full Calendar</Button>
    </div>
  )
}
