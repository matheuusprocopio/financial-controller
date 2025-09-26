import { categoriesMock } from "@/data/categoriesMock";
import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";

export const createNewCategoryTool = tool({
  description: "Create or add a new category or sub-category to user",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
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
  description: "List the available actions for categories",
  inputSchema: z.object({}),

  execute: async () => {
    return "Categories avaliable list";
  },
});

export const listCategoriesTool = tool({
  description: "List the available categories",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
    const categories = categoriesMock;

    return {
      name,
      categories,
      totalOfCategories: categories.length,
    };
  },
});


export const createNewCreditCardTool = tool({
  description: "Create or add a new credit card to user",
  inputSchema: z.object({
    cardName: z.string().optional(),
    bank: z.string().optional(),
    limit: z.number().optional(),
  }),

  execute: async ({ cardName = "", bank = "", limit = 0 }) => {
    return {
      cardName,
      bank,
      limit,
    };
  },
});

export const deleteCreditCardTool = tool({
  description: "Excludes a credit card",
  inputSchema: z.object({
    cardName: z.string(),
    cardId: z.string(),
  }),

  execute: async ({ cardName, cardId }) => {
    return {
      cardName,
      cardId,
    };
  },
});

export const listCreditCardActionsTool = tool({
  description: "List the available actions for credit cards",
  inputSchema: z.object({}),

  execute: async () => {
    return "Credit cards available list";
  },
});

export const listCreditCardsTool = tool({
  description: "List the available credit cards",
  inputSchema: z.object({
    cardName: z.string().optional(),
  }),

  execute: async ({ cardName = "" }) => {
    const creditCards = creditCardsMock;

    return {
      cardName,
      creditCards,
      totalOfCreditCards: creditCards.length,
    };
  },
});

export const tools = {
  createNewCategory: createNewCategoryTool,
  listCategoryActions: listCategoryActionsTool,
  deleteCategory: deleteCategoryTool,
  listCategories: listCategoriesTool,
  
  createNewCreditCard: createNewCreditCardTool,
  listCreditCardActions: listCreditCardActionsTool,
  deleteCreditCard: deleteCreditCardTool,
  listCreditCards: listCreditCardsTool,
};
