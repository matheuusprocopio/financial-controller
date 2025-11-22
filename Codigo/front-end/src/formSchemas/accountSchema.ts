import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "O nome da conta é obrigatório"),
  financialInstitution: z.string().min(1, "A instituição financeira é obrigatória"),
  balance: z.coerce.number().default(0),
});

export const accountUpdateSchema = z.object({
  name: z.string().optional(),
  financialInstitution: z.string().optional(),
  balance: z.coerce.number().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
export type AccountUpdateFormData = z.infer<typeof accountUpdateSchema>;
