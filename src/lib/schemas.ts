// Centralized Zod schemas for API input validation
import { z } from "zod";

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .max(200);

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

export const revalidateSchema = z.object({
  tag: z.string().min(1).max(128),
  secret: z.string().min(1),
});
