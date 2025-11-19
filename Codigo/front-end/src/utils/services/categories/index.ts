import { CategorieType, CreateCategoryType, UpdateCategoryType } from "@/types/categorie.type";
import { PaginatedResponse, PaginationParams } from "@/types/base.types";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_SERVICE_API_BASE_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listCategories = async (userId: string, categoryName?: string) => {
  return await provider.get<CategorieType[]>(
    `categories?user_id=${userId}${categoryName ? `&name=${categoryName}` : ""}`
  );
};

export const listCategoriesPaginated = async (userId: string, pagination: PaginationParams, categoryName?: string) => {
  const nameParam = categoryName ? `&name=${categoryName}` : "";
  const response = await provider.get<any>(
    `categories/paginated?user_id=${userId}&page=${pagination.page}&size=${pagination.size}${nameParam}`
  );
  
  if (response && response.data && Array.isArray(response.data)) {
    const paginatedResponse: PaginatedResponse<CategorieType> = {
      data: response.data,
      totalItems: response.totalItems,
      currentPage: response.currentPage,
      pageLimit: response.pageLimit,
    };
    return paginatedResponse;
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