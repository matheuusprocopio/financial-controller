import { CategorieType, CreateCategoryType, UpdateCategoryType } from "@/types/categorie.type";
import { PaginatedResponse, PaginationParams } from "@/types/pagination.type";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listCategories = async (userId: string, categoryName?: string) => {
  return await provider.get<CategorieType[]>(
    `categories?user_id=${userId}${categoryName ? `&name=${categoryName}` : ""}`
  );
};

export const listCategoriesPaginated = async (userId: string, pagination: PaginationParams, categoryName?: string): Promise<PaginatedResponse<CategorieType>> => {
  const nameParam = categoryName ? `&name=${categoryName}` : "";
  const response = await provider.get<PaginatedResponse<CategorieType>>(
    `categories/paginated?user_id=${userId}&page=${pagination.page}&size=${pagination.size}${nameParam}`
  );
  
  if ('error' in response) {
    throw new Error(response.error.message);
  }
  
  return response;
};

export const getCategoryById = async (categoryId: string) => {
  return await provider.get<CategorieType>(
    `categories/${categoryId}`
  );
};

export const createCategory = async (payload: CreateCategoryType) => {
  return await provider.post<CategorieType, CreateCategoryType>(
    `categories`,
    {
      body: payload,
    }
  );
};

export const updateCategory = async (categoryId: string, payload: UpdateCategoryType) => {
  const response = await provider.put<any, UpdateCategoryType>(
    `categories/${categoryId}`,
    {
      body: payload,
    }
  );
  if (response && !response.error) {
    return await getCategoryById(categoryId);
  }
  
  return response;
};

export const deleteCategory = async (categoryId: string) => {
  return await provider.delete(
    `categories/${categoryId}`
  );
};