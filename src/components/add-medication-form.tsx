"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { medicationSchema, MedicationFormValues } from "@/lib/validations/medication"
import { createMedication } from "@/lib/api/medications"
import { useSupabase } from "@/providers/supabase-provider"

export default function AddMedicationForm() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
  })

  const mutation = useMutation({
    mutationFn: async (values: MedicationFormValues) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      return createMedication(
        {
          name: values.name,
          dosage: values.dosage,
          frequency: values.frequency,
          time: values.time,
        },
        user.id
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      reset()
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4 p-4 border rounded"
    >
      <input
        placeholder="Medication Name"
        {...register("name")}
        className="w-full border p-2"
      />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <input
        placeholder="Dosage"
        {...register("dosage")}
        className="w-full border p-2"
      />
      {errors.dosage && <p className="text-red-500">{errors.dosage.message}</p>}

      <input
        placeholder="Frequency (e.g. Daily)"
        {...register("frequency")}
        className="w-full border p-2"
      />
      {errors.frequency && (
        <p className="text-red-500">{errors.frequency.message}</p>
      )}

      <input
        placeholder="Time (e.g. 08:00)"
        {...register("time.0")}
        className="w-full border p-2"
      />
      {errors.time && <p className="text-red-500">{errors.time.message}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-black text-white px-4 py-2"
      >
        {mutation.isPending ? "Adding..." : "Add Medication"}
      </button>
    </form>
  )
}
