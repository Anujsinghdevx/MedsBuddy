import { z } from "zod"

export const medicationSchema = z
  .object({
    name: z
      .string()
      .min(1, "Medication name is required")
      .max(100, "Medication name is too long"),

    dosage: z
      .string()
      .min(1, "Dosage is required")
      .max(100, "Dosage is too long"),

    frequency: z.enum(
      ["daily", "weekly", "every_other_day", "monthly"],
      {
        message: "Frequency is required",
      }
    ),

    frequency_per_day: z
      .number({
        message: "Times per day must be a number",
      })
      .int("Must be a whole number")
      .min(1, "Must take at least once per day")
      .max(10, "Too many doses per day"),

    duration_days: z
      .number({
        message: "Duration must be a number",
      })
      .int("Must be a whole number")
      .min(1, "Duration must be at least 1 day")
      .max(365, "Duration cannot exceed 1 year"),

    time: z
      .array(
        z.string().regex(
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Time must be in HH:MM format"
        )
      )
      .min(1, "At least one time is required"),
  })
  .superRefine((data, ctx) => {
    if (data.time.length !== data.frequency_per_day) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["time"],
        message: `You must provide exactly ${data.frequency_per_day} time(s)`,
      })
    }
  })

export type MedicationFormValues = z.infer<typeof medicationSchema>
