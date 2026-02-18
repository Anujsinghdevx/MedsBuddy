import { z } from "zod"

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  time: z.array(z.string()).min(1, "At least one time required"),
})

export type MedicationFormValues = z.infer<typeof medicationSchema>
