import AddMedicationForm from "@/components/add-medication-form"
import LogoutButton from "@/components/logout-button"
import MedicationList from "@/components/medication-list"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <LogoutButton />
      <h1 className="text-2xl font-bold">Your Medications</h1>
      <AddMedicationForm />
      <MedicationList />
    </div>
  )
}
