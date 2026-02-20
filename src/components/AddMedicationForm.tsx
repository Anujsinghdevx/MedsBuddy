"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { medicationSchema, MedicationFormValues } from "@/lib/validations/medication"
import { createMedication } from "@/lib/api/medications"
import { useSupabase } from "@/providers/supabase-provider"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { toast } from "sonner"

export default function AddMedicationForm() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: undefined,
      time: [],
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: MedicationFormValues) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      return createMedication({
        name: values.name.trim(),
        dosage: values.dosage.trim(),
        frequency: values.frequency.trim(),
        time: values.time,
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      form.reset()

      toast.success("Medication added successfully")
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again."

      toast.error(message)
    },
  })

  function onSubmit(values: MedicationFormValues) {
    mutation.mutate(values)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Medication</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Paracetamol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input placeholder="500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Input placeholder="Daily" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time.0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add Medication"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
