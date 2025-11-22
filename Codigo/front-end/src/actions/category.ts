"use server";

import { CreateCategoryType, UpdateCategoryType } from "@/types/categorie.type";
import { createCategory, updateCategory, deleteCategory } from "@/utils/services/categories";

export const createCategoryAction = async (payload: CreateCategoryType) => {
  const resp = await createCategory(payload);
  return resp;
};

export const updateCategoryAction = async (categoryId: string, payload: UpdateCategoryType) => {
  const resp = await updateCategory(categoryId, payload);
  return resp;
};

export const deleteCategoryAction = async (categoryId: string) => {
  const resp = await deleteCategory(categoryId);
  return resp;
};  