import { z } from "zod"

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().startsWith("https://"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Email
  SENDGRID_API_KEY: z.string().min(1),

  // Optional
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      CRON_SECRET: process.env.CRON_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => err.path.join(".")).join(", ")
      throw new Error(
        `❌ Invalid environment variables: ${missingVars}\n\n` +
          `Please check your .env.local file and ensure all required variables are set.\n` +
          `See .env.example for reference.`
      )
    }
    throw error
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  validateEnv()
}
