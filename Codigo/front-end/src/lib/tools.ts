import { tool } from "ai";
import { z } from "zod";

export const createNewCategoryTool = tool({
  description: "Create or add a new category or sub-category to user",
  inputSchema: z.object({
    name: z.string(),
  }),

  execute: async ({ name }) => {
    return {
      name,
    };
  },
});

export const deleteCategoryTool = tool({
  description: "Excludes a category or sub-category",
  inputSchema: z.object({
    name: z.string(),
  }),

  execute: async ({ name }) => {
    return {
      name,
    };
  },
});

export const listCategoryActionsTool = tool({
  description: "List the avaliable actions for categories",
  inputSchema: z.object({}),

  execute: async () => {
    return "Categories avaliable list";
  },
});

export const tools = {
  createNewCategory: createNewCategoryTool,
  listCategoryActions: listCategoryActionsTool,
  deleteCategory: deleteCategoryTool,
};
