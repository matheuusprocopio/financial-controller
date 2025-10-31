import { CategorieType } from "@/data/categoriesMock";
import { CreateCategoryType } from "@/types/categorie.type";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_SERVICE_API_BASE_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listCategories = async (userId: string, categoryName?: string) => {
  return await provider.get<CategorieType[]>(
    `categories?user_id=${userId}${categoryName ? `&name=${categoryName}` : ""}`
  );
};

export const createCategory = async (payload: CreateCategoryType) => {
  return await provider.post(
    `categories`,
    {
      body: {
        ...payload,
      },
    }
  );
};