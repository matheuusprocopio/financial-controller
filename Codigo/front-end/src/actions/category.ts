"use server";

import { CreateCategoryType, UpdateCategoryType } from "@/types/categorie.type";
import { getSessionId } from "@/utils/server-cookies";
import { createRequestError } from "@/utils/requestProvider";
import { createCategory, updateCategory, deleteCategory } from "@/utils/services/categories";

export const createCategoryAction = async (payload: CreateCategoryType) => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return createRequestError(401, "Invalid session", "categories");
  }

  const resp = await createCategory(sessionId, payload);
  
  return resp;
};

export const updateCategoryAction = async (categoryId: string, payload: UpdateCategoryType) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return createRequestError(401, "Invalid session", `categories/${categoryId}`);
  }

  const resp = await updateCategory(categoryId, sessionId, payload);
  return resp;
};

export const deleteCategoryAction = async (categoryId: string) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return createRequestError(401, "Invalid session", `categories/${categoryId}`);
  }

  const resp = await deleteCategory(categoryId, sessionId);
  return resp;
};  
