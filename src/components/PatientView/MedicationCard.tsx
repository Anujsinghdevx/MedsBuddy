"use client"

import { useState, useEffect } from "react"
import { MedicationLogWithMedications } from "@/types/supabase"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { markMedicationTaken } from "@/lib/api/medication-logs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface MedicationCardProps {
  log: MedicationLogWithMedications
}

export function MedicationCard({ log }: MedicationCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(log.status)
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
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark medication as taken")
      setStatus(log.status)
    },
  })

  const getBadgeVariant = (): "default" | "secondary" => {
    return status === "taken" ? "default" : "secondary"
  }

  const getStatusLabel = (): string => {
    return status === "taken" ? "Taken" : "Pending"
  }

  const handleMarkTaken = () => {
    mutation.mutate()
  }

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-lg font-semibold">{log.medications?.name}</p>
        <p className="text-muted-foreground text-sm">{log.medications?.dosage}</p>
      </div>

      <Badge variant={getBadgeVariant()}>{getStatusLabel()}</Badge>

      <div className="text-muted-foreground text-sm">
        Scheduled at{" "}
        <span className="text-foreground font-medium">
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
            className="border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/40 group flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden
                       rounded-xl border-2 border-dashed transition-all"
          >
            {preview ? (
              <img
                src={preview}
                alt="Proof preview"
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <p className="text-muted-foreground group-hover:text-foreground text-sm transition-colors">
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
            {mutation.isPending ? "Marking..." : "Mark as Taken"}
          </Button>
        </div>
      )}
    </div>
  )
}
