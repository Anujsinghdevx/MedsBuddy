"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createMedication } from "@/lib/api/medications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MedicationFormValues, medicationSchema } from "@/lib/validations/medication"
import { useSupabase } from "@/providers/supabase-provider"

export default function CaretakerAddMedicationForm() {
  const supabase = useSupabase()
  const [userId, setUserId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user?.id) setUserId(session.user.id)
    }
    getSession()
  }, [supabase])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { frequency: "daily", frequency_per_day: 1, duration_days: 1, time: [""] },
  })

  const frequencyPerDay = watch("frequency_per_day") || 1

  const mutation = useMutation({
    mutationFn: async (values: MedicationFormValues) => {
      if (!userId) throw new Error("User not authenticated")
      return createMedication(values)
    },
    onSuccess: () => {
      toast.success("Medication added successfully!")
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      reset()
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to add medication"),
  })

  const onSubmit = (values: MedicationFormValues) => {
    const enrichedValues = {
      ...values,
      user_timezone_offset: new Date().getTimezoneOffset()
    }
    mutation.mutate(enrichedValues)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-900">Add New Medication</h2>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Medication Name</label>
        <Input {...register("name")} placeholder="E.g., Paracetamol" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Dosage</label>
        <Input {...register("dosage")} placeholder="E.g., 500mg" />
        {errors.dosage && <p className="text-sm text-red-500">{errors.dosage.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Frequency</label>
        <select {...register("frequency")} className="w-full rounded-md border p-2">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="every_other_day">Every Other Day</option>
          <option value="monthly">Monthly</option>
        </select>
        {errors.frequency && <p className="text-sm text-red-500">{errors.frequency.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Times Per Day</label>
        <Input type="number" min={1} {...register("frequency_per_day", { valueAsNumber: true })} />
        {errors.frequency_per_day && (
          <p className="text-sm text-red-500">{errors.frequency_per_day.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
        <Input type="number" min={1} {...register("duration_days", { valueAsNumber: true })} />
        {errors.duration_days && (
          <p className="text-sm text-red-500">{errors.duration_days.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Time(s)</label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: frequencyPerDay }).map((_, index) => (
            <Input
              key={index}
              type="time"
              {...register(`time.${index}` as const)}
              className="min-w-30 flex-1"
            />
          ))}
        </div>
        {errors.time && <p className="text-sm text-red-500">{errors.time.message as string}</p>}
      </div>

      <Button type="submit" disabled={mutation.isPending || !userId} className="w-full">
        {mutation.isPending ? "Adding..." : "Add Medication"}
      </Button>
    </form>
  )
}
