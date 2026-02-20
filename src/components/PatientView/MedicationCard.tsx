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

  const canMarkAsTaken = () => {
    const now = new Date()
    const scheduledTime = new Date(log.scheduled_at)
    const GRACE_PERIOD_MS = 30 * 60 * 1000 
    return now.getTime() >= (scheduledTime.getTime() - GRACE_PERIOD_MS)
  }

  const getTimeUntilScheduled = () => {
    const now = new Date()
    const scheduledTime = new Date(log.scheduled_at)
    const diffMs = scheduledTime.getTime() - now.getTime()
    
    if (diffMs <= 0) return null 
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `Available in ${hours}h ${minutes}m`
    }
    return `Available in ${minutes}m`
  }

  const isAvailable = canMarkAsTaken()
  const timeUntil = getTimeUntilScheduled()

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
      const errorMessage = error.message || "Failed to mark medication as taken"
      
      if (errorMessage.includes("before scheduled time")) {
        toast.error("Too early! Please wait until the scheduled time.", {
          description: "You can mark medications up to 30 minutes before the scheduled time.",
          duration: 5000
        })
      } else {
        toast.error(errorMessage)
      }
      
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
          {!isAvailable && timeUntil && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-amber-800">{timeUntil}</span>
            </div>
          )}
          
          <label
            htmlFor={`file-upload-${log.id}`}
            className={`group flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden
                       rounded-xl border-2 border-dashed transition-all
                       ${isAvailable ? 'border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/40' : 'cursor-not-allowed border-muted-foreground/20 bg-muted/20'}`}
          >
            {preview ? (
              <img
                src={preview}
                alt="Proof preview"
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <p className={`text-sm transition-colors ${isAvailable ? 'text-muted-foreground group-hover:text-foreground' : 'text-muted-foreground/50'}`}>
                Upload proof (optional)
              </p>
            )}

            <input
              id={`file-upload-${log.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={!isAvailable}
            />
          </label>

          <Button
            onClick={handleMarkTaken}
            disabled={mutation.isPending || !isAvailable}
            className="w-full rounded-xl"
          >
            {mutation.isPending ? "Marking..." : isAvailable ? "Mark as Taken" : `Wait ${timeUntil?.replace('Available in ', '') || ''}`}
          </Button>
        </div>
      )}
    </div>
  )
}
