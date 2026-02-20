"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { markMedicationTaken } from "@/lib/api/medication-logs"
import { MedicationLogWithMedications } from "@/types/supabase"

interface MedicationCardProps {
  log: MedicationLogWithMedications
}

export function MedicationCard({ log }: MedicationCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState(log.status)
  const queryClient = useQueryClient()

  useEffect(() => {
    setStatus(log.status)
  }, [log.status])

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const mutation = useMutation({
    mutationFn: () => markMedicationTaken(log.id, file ?? undefined),

    onMutate: async () => {
      setStatus("taken")
    },

    onSuccess: () => {
      toast.success("Medication marked as taken!")
      setFile(null)
      setPreview(null)
      queryClient.invalidateQueries({ queryKey: ["medication-logs"] })
    },

    onError: (err: Error) => {
      toast.error(err.message || "Failed to mark as taken")
      setStatus(log.status ?? "pending")
    },
  })

  const handleMarkTaken = () => {
    mutation.mutate()
  }

  const getBadgeVariant = () => {
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

  const getStatusLabel = () => {
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
    <div className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-lg font-semibold">
            {log.medications?.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {log.medications?.dosage}
          </p>
        </div>

        <Badge variant={getBadgeVariant()}>
          {getStatusLabel()}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        Scheduled at{" "}
        <span className="font-medium text-foreground">
          {new Date(log.scheduled_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {status === "pending" && (
        <div className="space-y-4 pt-2">

          <label
            htmlFor={`file-upload-${log.id}`}
            className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                       border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/40 overflow-hidden"
          >
            {preview ? (
              <img
                src={preview}
                alt="Proof preview"
                className="object-contain w-full h-full rounded-xl"
              />
            ) : (
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Upload proof (optional)
              </p>
            )}

            <input
              id={`file-upload-${log.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <Button
            onClick={handleMarkTaken}
            disabled={mutation.isPending}
            className="w-full rounded-xl"
          >
            {mutation.isPending ? "Processing..." : "Mark as Taken"}
          </Button>
        </div>
      )}
    </div>
  )
}