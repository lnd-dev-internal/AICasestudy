import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local", override: false });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().min(1, "GEMINI_MODEL is required")
});

export const env = envSchema.parse(process.env);
