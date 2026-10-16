import { tool } from "ai";
import { z } from "zod";
import { listCategoriesPaginated } from "@/utils/services/categories";
import { getSessionId } from "@/utils/server-cookies";
import { createRequestError } from "@/utils/requestProvider";
import { isRequestError } from "./shared";

export const createNewCategoryTool = tool({
  description: "Create or add a new category or sub-category to user",
  inputSchema: z.object({
    name: z.string().optional(),
    imagePath: z.string().optional(),
    mainCategoryId: z.string().optional(),
  }),

  execute: async ({ name = "", imagePath = "", mainCategoryId }) => {
    return {
      name,
      imagePath,
      mainCategoryId,
    };
  },
});

export const editCategoryTool = tool({
  description: "Edit an existing category",
  inputSchema: z.object({
    categoryId: z.string(),
    name: z.string().optional(),
    imagePath: z.string().optional(),
    mainCategoryId: z.string().optional(),
  }),

  execute: async ({ categoryId, name, imagePath, mainCategoryId }) => {
    return {
      categoryId,
      name,
      imagePath,
      mainCategoryId,
    };
  },
});

export const deleteCategoryTool = tool({
  description: "Excludes a category or sub-category",
  inputSchema: z.object({
    categoryId: z.string().optional(),
    name: z.string(),
  }),

  execute: async ({ categoryId = "", name }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          categoryId: "",
          name,
          error: createRequestError(
            401,
            "Não foi possível obter a sessão do usuário.",
            "categories/paginated"
          ),
        };
      }

      const resp = await listCategoriesPaginated(
        sessionId,
        { page: 1, size: 1 },
        undefined,
        name
      );

      if (isRequestError(resp)) {
        return {
          categoryId: "",
          name,
          error: resp,
        };
      }

      const [bestMatch] = resp.data ?? [];

      if (!bestMatch) {
        return {
          categoryId: "",
          name,
          error: createRequestError(
            404,
            "Nenhuma categoria encontrada para deletar. Tente especificar melhor o nome.",
            "categories/paginated"
          ),
        };
      }

      return {
        categoryId: bestMatch.id,
        name: bestMatch.name,
        semanticalSearch: name,
        totalOfCategories: resp.totalItems,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          categoryId: "",
          name,
          error,
        };
      }

      const message = error instanceof Error ? error.message : "Unknown error";

      return {
        categoryId: "",
        name,
        error: createRequestError(500, message, "categories/paginated"),
      };
    }
  },
});

export const listCategoryActionsTool = tool({
  description: "List the available actions for categories",
  inputSchema: z.object({}),

  execute: async () => {
    return "Categories available list";
  },
});

export const listCategoriesTool = tool({
  description: "List the available categories",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          name,
          categories: [],
          totalOfCategories: 0,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "categories/paginated",
            },
          },
        };
      }

      const searchTerm = name.length > 0 ? name : undefined;

      const resp = await listCategoriesPaginated(
        sessionId,
        { page: 1, size: 10 },
        name,
        searchTerm
      );

      if (isRequestError(resp)) {
        return {
          name,
          categories: [],
          totalOfCategories: 0,
          error: resp,
        };
      }

      return {
        name,
        categories: resp.data,
        totalOfCategories: resp.totalItems,
        currentPage: resp.currentPage,
        pageLimit: resp.pageLimit,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          name,
          categories: [],
          totalOfCategories: 0,
          error,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        name,
        categories: [],
        totalOfCategories: 0,
        error: {
          error: {
            status: 500,
            message: errorMessage,
            resource: "categories/paginated",
          },
        },
      };
    }
  },
});
//
