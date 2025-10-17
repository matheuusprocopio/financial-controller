import { z } from "zod";

export const accountFilterSchema = z.object({
  nickname: z.string().optional(),
  financial_institution: z.string().optional(),
});

export type AccountFilterFormData = z.infer<typeof accountFilterSchema>;
