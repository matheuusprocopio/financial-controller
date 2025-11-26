import CreateAccountForm from "@/components/ToolsComponents/Accounts/CreateAccountForm";
import DeleteAccountForm from "@/components/ToolsComponents/Accounts/DeleteAccountForm";
import EditAccountForm from "@/components/ToolsComponents/Accounts/EditAccountForm";
import ListAccountActions from "@/components/ToolsComponents/Accounts/ListAccountActions";
import AccountsList from "@/components/ToolsComponents/Accounts/ListAccounts";
import CreateCategoryForm from "@/components/ToolsComponents/Categories/CreateCategoryForm";
import DeleteCategoryForm from "@/components/ToolsComponents/Categories/DeleteCategoryForm";
import EditCategoryForm from "@/components/ToolsComponents/Categories/EditCategoryForm";
import CategoriesList from "@/components/ToolsComponents/Categories/ListCategories";
import ListCategoryActions from "@/components/ToolsComponents/Categories/ListCategoryActions";
import CreateCreditCardForm from "@/components/ToolsComponents/CreditCards/CreateCreditCardForm";
import DeleteCreditCardForm from "@/components/ToolsComponents/CreditCards/DeleteCreditCardForm";
import ListCreditCardActions from "@/components/ToolsComponents/CreditCards/ListCreditCardActions";
import CreditCardsList from "@/components/ToolsComponents/CreditCards/ListCreditCards";
import CreateItemForm from "@/components/ToolsComponents/Items/CreateItemForm";
import DeleteItemForm from "@/components/ToolsComponents/Items/DeleteItemForm";
import EditItemForm from "@/components/ToolsComponents/Items/EditItemForm";
import ItemsList from "@/components/ToolsComponents/Items/ListItems";
import UpdateUserForm from "@/components/ToolsComponents/User/UpdateUserForm";
import DeleteUserForm from "@/components/ToolsComponents/User/DeleteUserForm";
import CreateGoalForm from "@/components/ToolsComponents/Goals/CreateGoalForm";
import DeleteGoalForm from "@/components/ToolsComponents/Goals/DeleteGoalForm";
import EditGoalForm from "@/components/ToolsComponents/Goals/EditGoalForm";
import ListGoalActions from "@/components/ToolsComponents/Goals/ListGoalActions";
import GoalsList from "@/components/ToolsComponents/Goals/ListGoals";
import { DynamicToolUIPart } from "ai";

type ToolRendererType = (
  part: DynamicToolUIPart,
  helpers: {
    onError: (errMsg: string, errorPayload?: unknown) => void;
    onSubmitted: () => void;
  }
) => React.ReactNode;

type NewToolsMapParamsType = {
  handleSendMessage: (message: string) => Promise<void>;
};

export const NewToolsMap = (
  params: NewToolsMapParamsType
): Record<string, ToolRendererType> => {
  const ToolsMap: Record<string, ToolRendererType> = {
    "tool-createNewCategory": (p, helpers) => (
      <CreateCategoryForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-editCategory": (p, helpers) => (
      <EditCategoryForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listCategoryActions": (_p, _helpers) => (
      <ListCategoryActions onSendMessage={params.handleSendMessage} />
    ),
    "tool-deleteCategory": (p, helpers) => (
      <DeleteCategoryForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listCategories": (p, helpers) => (
      <CategoriesList
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
      />
    ),

    "tool-createNewCreditCard": (p, helpers) => (
      <CreateCreditCardForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listCreditCardActions": (_p, _helpers) => (
      <ListCreditCardActions onSendMessage={params.handleSendMessage} />
    ),
    "tool-deleteCreditCard": (p, helpers) => (
      <DeleteCreditCardForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listCreditCards": (p, helpers) => (
      <CreditCardsList
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
      />
    ),

    "tool-createNewAccount": (p, helpers) => (
      <CreateAccountForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-editAccount": (p, helpers) => (
      <EditAccountForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listAccountActions": (_p, _helpers) => (
      <ListAccountActions onSendMessage={params.handleSendMessage} />
    ),
    "tool-deleteAccount": (p, helpers) => (
      <DeleteAccountForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listAccounts": (p, helpers) => (
      <AccountsList
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
      />
    ),
    "tool-filterAccounts": (p, helpers) => (
      <AccountsList
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
      />
    ),

    "tool-createNewItem": (p, helpers) => (
      <CreateItemForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-editItem": (p, helpers) => (
      <EditItemForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-deleteItem": (p, helpers) => (
      <DeleteItemForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listItems": (p, helpers) => (
      <ItemsList
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
      />
    ),
    "tool-updateUser": (p, helpers) => (
      <UpdateUserForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-deleteUser": (p, helpers) => (
      <DeleteUserForm
        data={p.output as any}
        onError={(msg, payload) => helpers.onError(msg, payload)}
        onSubmitted={helpers.onSubmitted}
      />
    ),

    "tool-createNewGoal": (p, helpers) => (
      <CreateGoalForm
        data={p.output as any}
        onError={(msg) => helpers.onError(msg)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-editGoal": (p, helpers) => (
      <EditGoalForm
        data={p.output as any}
        onError={(msg) => helpers.onError(msg)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listGoalActions": (_p, _helpers) => (
      <ListGoalActions onSendMessage={params.handleSendMessage} />
    ),
    "tool-deleteGoal": (p, helpers) => (
      <DeleteGoalForm
        data={p.output as any}
        onError={(msg) => helpers.onError(msg)}
        onSubmitted={helpers.onSubmitted}
      />
    ),
    "tool-listGoals": (p, helpers) => (
      <GoalsList
        data={p.output as any}
        onError={(msg) => helpers.onError(msg)}
      />
    ),
  };

  return ToolsMap;
};
