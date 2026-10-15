import { tool } from "ai";
import { z } from "zod";

export const updateUserTool = tool({
  description: "Update Authenticated User data",
  inputSchema: z.object({
    userId: z.string().optional(),
    name: z.string().optional()
  }),

  execute: async ({ userId = "", name = ""}) => {
    return {
      userId,
      name

    };
  },
});

export const deleteUserTool = tool({
  description: "Delete Authenticated User",
  inputSchema: z.object({
    userId: z.string().optional(),
    name: z.string().optional(),
  }),

  execute: async ({ userId = "", name = ""}) => {
    return {
      userId,
      name
    };
  },
});
