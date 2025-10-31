"use server";

import { CreateCategoryType } from "@/types/categorie.type";
import { createCategory } from "@/utils/services/categories";

export const createCategoryAction = async (payload: CreateCategoryType) => {
  const resp = await createCategory(payload);

  return resp;
};  