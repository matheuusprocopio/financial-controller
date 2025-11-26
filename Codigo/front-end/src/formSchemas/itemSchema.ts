import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1, "O nome da transação é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  date: z.date({
    message: "A data é obrigatória",
  }),
  type: z.enum(["income", "expense"], {
    message: "O tipo é obrigatório",
  }),
  categoryId: z.string().min(1, "A categoria é obrigatória"),
  accountId: z.string().min(1, "A conta é obrigatória"),
});

export const itemUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().positive("O valor deve ser positivo").optional(),
  date: z.date().optional(),
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
});

export const itemFilterSchema = z.object({
  name: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;
export type ItemUpdateFormData = z.infer<typeof itemUpdateSchema>;
export type ItemFilterFormData = z.infer<typeof itemFilterSchema>;
