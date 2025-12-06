import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().optional(),
  BETTER_AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  TWILIO_WHATSAPP_SANDBOX_NUMBER: z.string().optional(),
  
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  const env = envSchema.parse(process.env);
  return env;
}

export const env = validateEnv();
