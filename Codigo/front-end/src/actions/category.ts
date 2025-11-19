"use server";

import { CreateCategoryType, UpdateCategoryType } from "@/types/categorie.type";
import { PaginationParams } from "@/types/base.types";
import { createCategory, updateCategory, deleteCategory, listCategoriesPaginated } from "@/utils/services/categories";

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

export const listCategoriesPaginatedAction = async (userId: string, pagination: PaginationParams, categoryName?: string) => {
  const resp = await listCategoriesPaginated(userId, pagination, categoryName);
  return resp;
};  