"use server";

import { CreateCategoryType, UpdateCategoryType } from "@/types/categorie.type";
import { getSessionId } from "@/utils/server-cookies";
import { createCategory, updateCategory, deleteCategory } from "@/utils/services/categories";

export const createCategoryAction = async (payload: CreateCategoryType) => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return {
        error: {
          message: "Invalid session",
        }
    }
  }

  const resp = await createCategory(sessionId, payload);

  console.log(resp);
  
  return resp;
};

export const updateCategoryAction = async (categoryId: string, payload: UpdateCategoryType) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    };
  }

  const resp = await updateCategory(categoryId, sessionId, payload);
  return resp;
};

export const deleteCategoryAction = async (categoryId: string) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    };
  }

  const resp = await deleteCategory(categoryId, sessionId);
  return resp;
};  
