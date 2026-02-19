"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { markMedicationTaken } from "@/lib/api/medication-logs"

interface MedicationCardProps {
  log: any
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

    onError: (err: any) => {
      toast.error(err.message || "Failed to mark as taken")
      setStatus(log.status) 
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
    <div className="border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">{log.medications?.name}</p>
          <p className="text-sm text-muted-foreground">
            {log.medications?.dosage}
          </p>
        </div>

        <Badge variant={getBadgeVariant()}>
          {getStatusLabel()}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Scheduled at{" "}
        {new Date(log.scheduled_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {status === "pending" && (
        <div className="space-y-3">
          <label
            htmlFor={`file-upload-${log.id}`}
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors overflow-hidden"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="object-contain w-full h-full"
              />
            ) : (
              <p className="text-sm text-gray-400 text-center">
                Click or drag file here to upload proof (optional)
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
            className="w-full"
          >
            {mutation.isPending ? "Uploading..." : "Mark as Taken"}
          </Button>
        </div>
      )}

      {log.proof_url && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Uploaded Proof:</p>
          <img
            src={log.proof_url}
            alt="Proof"
            className="mt-1 w-24 h-24 object-cover rounded border"
          />
        </div>
      )}
    </div>
  )
}
