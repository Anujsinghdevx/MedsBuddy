"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createMedication } from "@/lib/api/medications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  MedicationFormValues,
  medicationSchema,
} from "@/lib/validations/medication"
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

      if (session?.user?.id) {
        setUserId(session.user.id)
      }
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
    defaultValues: {
      frequency: "daily",
      frequency_per_day: 1,
      duration_days: 1,
      time: [""],
    },
  })

  const frequencyPerDay = watch("frequency_per_day") || 1

  const mutation = useMutation({
    mutationFn: async (values: MedicationFormValues) => {
      if (!userId) {
        throw new Error("User not authenticated")
      }

      return createMedication(values)
    },
    onSuccess: () => {
      toast.success("Medication added successfully!")
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      reset()
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to add medication")
    },
  })

  const onSubmit = (values: MedicationFormValues) => {
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">
          Medication Name
        </label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-sm">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Dosage
        </label>
        <Input {...register("dosage")} />
        {errors.dosage && (
          <p className="text-red-500 text-sm">
            {errors.dosage.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Frequency
        </label>
        <select
          {...register("frequency")}
          className="w-full border rounded-md p-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="every_other_day">Every Other Day</option>
          <option value="monthly">Monthly</option>
        </select>
        {errors.frequency && (
          <p className="text-red-500 text-sm">
            {errors.frequency.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Times Per Day
        </label>
        <Input
          type="number"
          min={1}
          {...register("frequency_per_day", {
            valueAsNumber: true,
          })}
        />
        {errors.frequency_per_day && (
          <p className="text-red-500 text-sm">
            {errors.frequency_per_day.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Duration (Days)
        </label>
        <Input
          type="number"
          min={1}
          {...register("duration_days", {
            valueAsNumber: true,
          })}
        />
        {errors.duration_days && (
          <p className="text-red-500 text-sm">
            {errors.duration_days.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Time(s)
        </label>

        {Array.from({ length: frequencyPerDay }).map((_, index) => (
          <Input
            key={index}
            type="time"
            {...register(`time.${index}` as const)}
            className="mb-2"
          />
        ))}

        {errors.time && (
          <p className="text-red-500 text-sm">
            {errors.time.message as string}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending || !userId}
        className="w-full"
      >
        {mutation.isPending ? "Adding..." : "Add Medication"}
      </Button>
    </form>
  )
}
