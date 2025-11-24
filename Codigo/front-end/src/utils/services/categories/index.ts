import {
  CategorieType,
  CreateCategoryType,
  UpdateCategoryType,
} from "@/types/categorie.type";
import { PaginatedResponse, PaginationParams } from "@/types/pagination.type";
import newRequestProvider, { RequestError } from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

export const listCategories = async (
  sessionId: string,
  categoryName?: string
) => {
  return await provider.get<CategorieType[]>(
    `categories${categoryName ? `?name=${categoryName}` : ""}`,
    {
      ...withSession(sessionId),
    }
  );
};

export const listCategoriesPaginated = async (
  sessionId: string,
  pagination: PaginationParams,
  categoryName?: string
): Promise<PaginatedResponse<CategorieType> | RequestError> => {
  const nameParam = categoryName ? `&name=${categoryName}` : "";
  const response = await provider.get<PaginatedResponse<CategorieType>>(
    `categories/paginated?page=${pagination.page}&size=${pagination.size}${nameParam}`,
    {
      ...withSession(sessionId),
    }
  );

  return response;
};

export const getCategoryById = async (
  categoryId: string,
  sessionId: string
) => {
  return await provider.get<CategorieType>(`categories/${categoryId}`, {
    ...withSession(sessionId),
  });
};

export const createCategory = async (
  sessionId: string,
  payload: CreateCategoryType
) => {
  return await provider.post<CategorieType, CreateCategoryType>(`categories`, {
    body: {
      ...payload,
    },
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};

export const updateCategory = async (
  categoryId: string,
  sessionId: string,
  payload: UpdateCategoryType
) => {
  const response = await provider.put<any, UpdateCategoryType>(
    `categories/${categoryId}`,
    {
      body: payload,
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );
  if (response && !response.error) {
    return await getCategoryById(categoryId, sessionId);
  }

  return response;
};

export const deleteCategory = async (categoryId: string, sessionId: string) => {
  return await provider.delete(`categories/${categoryId}`, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};
