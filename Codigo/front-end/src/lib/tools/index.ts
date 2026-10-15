import { createNewCategoryTool, editCategoryTool, deleteCategoryTool, listCategoryActionsTool, listCategoriesTool } from "./categories";
import { createNewCreditCardTool, deleteCreditCardTool, listCreditCardsTool, listCreditCardActionsTool } from "./creditCards";
import { createNewAccountTool, editAccountTool, deleteAccountTool, listAccountActionsTool, listAccountsTool, filterAccountsTool } from "./accounts";
import { itemsAnalyticsTool } from "./analytics";
import { createNewItemTool, editItemTool, deleteItemTool, listItemsTool, listItemActionsTool } from "./items";
import { updateUserTool, deleteUserTool } from "./user";
import { createNewGoalTool, editGoalTool, deleteGoalTool, listGoalActionsTool, listGoalsTool } from "./goals";

export const tools = {
  createNewCategory: createNewCategoryTool,
  editCategory: editCategoryTool,
  listCategoryActions: listCategoryActionsTool,
  deleteCategory: deleteCategoryTool,
  listCategories: listCategoriesTool,

  createNewAccount: createNewAccountTool,
  editAccount: editAccountTool,
  listAccountActions: listAccountActionsTool,
  deleteAccount: deleteAccountTool,
  listAccounts: listAccountsTool,
  filterAccounts: filterAccountsTool,

  createNewCreditCard: createNewCreditCardTool,
  listCreditCardActions: listCreditCardActionsTool,
  deleteCreditCard: deleteCreditCardTool,
  listCreditCards: listCreditCardsTool,

  itemsAnalytics: itemsAnalyticsTool,

  createNewItem: createNewItemTool,
  editItem: editItemTool,
  listItemActions: listItemActionsTool,
  deleteItem: deleteItemTool,
  listItems: listItemsTool,

  updateUser: updateUserTool,
  deleteUser: deleteUserTool,

  createNewGoal: createNewGoalTool,
  editGoal: editGoalTool,
  listGoalActions: listGoalActionsTool,
  deleteGoal: deleteGoalTool,
  listGoals: listGoalsTool,
};
