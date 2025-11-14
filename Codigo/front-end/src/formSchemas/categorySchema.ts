import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  imagePath: z.string().optional(),
  mainCategoryId: z.string().optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().optional(),
  imagePath: z.string().optional(),
  mainCategoryId: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type CategoryUpdateFormData = z.infer<typeof categoryUpdateSchema>;
