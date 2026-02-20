"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteMedication } from "@/lib/api/medications"
import { useSupabase } from "@/providers/supabase-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Medication, MedicationLogWithMedications } from "@/types/supabase"

interface MedicationCardProps {
  medication: Medication
  log: MedicationLogWithMedications
  today: string
}

export default function MedicationCard({
  medication,
  log,
  today,
}: MedicationCardProps) {
  const queryClient = useQueryClient()
  const supabase = useSupabase()

  const deleteMutation = useMutation({
    mutationFn: () => deleteMedication(medication.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      toast.success("Medication deleted")
    },
    onError: () => {
      toast.error("Failed to delete medication")
    },
  })

  const markWithProofMutation = useMutation({
    mutationFn: async (file: File) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const formData = new FormData()
      formData.append("proof", file)

      const res = await fetch(`/api/medication-logs/${log.id}/mark-taken`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token || "")}`
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to mark medication")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-logs", today] })
      toast.success("Medication marked as taken with proof")
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to mark medication"
      )
    },
  })

  const isTaken = log?.status === "taken"

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    markWithProofMutation.mutate(file)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">{medication.name}</h3>
            <p className="text-sm text-muted-foreground">
              {medication.dosage} • {medication.frequency}
            </p>
          </div>

          {isTaken ? (
            <Badge variant="default">Taken Today</Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isTaken && (
            <>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={markWithProofMutation.isPending}
                />
                <Button size="sm" disabled={markWithProofMutation.isPending}>
                  {markWithProofMutation.isPending ? "Marking..." : "Mark & Upload Proof"}
                </Button>
              </label>
            </>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
