"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { PatientView } from "@/components/PatientView/PatientView"
import { CaretakerView } from "@/components/CareTaker/CaretakerView"

export default function DashboardPage() {
  const [role, setRole] = useState<"patient" | "caretaker">("patient")
  const supabase = createClient()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant={role === "patient" ? "default" : "outline"}
          onClick={() => setRole("patient")}
        >
          Patient View
        </Button>
        <Button
          variant={role === "caretaker" ? "default" : "outline"}
          onClick={() => setRole("caretaker")}
        >
          Caretaker View
        </Button>
      </div>

      {role === "patient" ? <PatientView /> : <CaretakerView />}
    </div>
  )
}
