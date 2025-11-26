"use client";

import CreateCategoryForm from "@/components/ToolsComponents/Categories/CreateCategoryForm";
import DeleteCategoryForm from "@/components/ToolsComponents/Categories/DeleteCategoryForm";
import EditCategoryForm from "@/components/ToolsComponents/Categories/EditCategoryForm";
import CategoriesList from "@/components/ToolsComponents/Categories/ListCategories";
import ListCategoryActions from "@/components/ToolsComponents/Categories/ListCategoryActions";

import CreateCreditCardForm from "@/components/ToolsComponents/CreditCards/CreateCreditCardForm";
import DeleteCreditCardForm from "@/components/ToolsComponents/CreditCards/DeleteCreditCardForm";
import CreditCardsList from "@/components/ToolsComponents/CreditCards/ListCreditCards";
import ListCreditCardActions from "@/components/ToolsComponents/CreditCards/ListCreditCardActions";

import CreateAccountForm from "@/components/ToolsComponents/Accounts/CreateAccountForm";
import DeleteAccountForm from "@/components/ToolsComponents/Accounts/DeleteAccountForm";
import EditAccountForm from "@/components/ToolsComponents/Accounts/EditAccountForm";
import AccountsList from "@/components/ToolsComponents/Accounts/ListAccounts";
import ListAccountActions from "@/components/ToolsComponents/Accounts/ListAccountActions";

import CreateItemForm from "@/components/ToolsComponents/Items/CreateItemForm";
import DeleteItemForm from "@/components/ToolsComponents/Items/DeleteItemForm";
import EditItemForm from "@/components/ToolsComponents/Items/EditItemForm";
import ItemsList from "@/components/ToolsComponents/Items/ListItems";

import CreateGoalForm from "@/components/ToolsComponents/Goals/CreateGoalForm";
import EditGoalForm from "@/components/ToolsComponents/Goals/EditGoalForm";
import DeleteGoalForm from "@/components/ToolsComponents/Goals/DeleteGoalForm";
import GoalsList from "@/components/ToolsComponents/Goals/ListGoals";
import ListGoalActions from "@/components/ToolsComponents/Goals/ListGoalActions";

import { cn } from "@/lib/utils";
import { DynamicToolUIPart, UIMessage } from "ai";
import ActionWrapper from "../gen-ui/ActionWrapper";
import ReasoningState from "../gen-ui/ReasoningState";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/utils/errors";

interface IMessageComponentContent {
  message: UIMessage;
  timestamp: Date;
  onSendMessage: (message: string) => Promise<void>;
}

type ToolRendererType = (part: any) => React.ReactNode;

const MessageComponentContent = ({
  onSendMessage,
  message,
  timestamp,
}: IMessageComponentContent) => {
  const [actionError, setActionError] = useState<string | null>(null);

  const handleActionErrorChange = (errMsg: string) => {
    setActionError(errMsg);
  };

  useEffect(() => {
    const firstToolErrorMessage =
      message.parts
        .map((part) => {
          if (!part.type.includes("tool")) return null;

          const outputError = (part as DynamicToolUIPart).output as unknown as { error?: unknown };
          return getErrorMessage(outputError?.error);
        })
        .find(Boolean) ?? null;

    if (!actionError && firstToolErrorMessage) {
      setActionError(firstToolErrorMessage);
    }
  }, [message.parts, actionError]);

  const toolRenderers: Record<string, ToolRendererType> = {
    "tool-createNewCategory": (p) => (
      <CreateCategoryForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-editCategory": (p) => <EditCategoryForm data={p.output as any} onError={handleActionErrorChange} />,
    "tool-listCategoryActions": () => (
      <ListCategoryActions onSendMessage={onSendMessage} />
    ),
    "tool-deleteCategory": (p) => <DeleteCategoryForm data={p.output as any} onError={handleActionErrorChange} />,
    "tool-listCategories": (p) => <CategoriesList data={p.output as any} onError={handleActionErrorChange} />,

    "tool-createNewCreditCard": (p) => (
      <CreateCreditCardForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-listCreditCardActions": () => (
      <ListCreditCardActions onSendMessage={onSendMessage} />
    ),
    "tool-deleteCreditCard": (p) => (
      <DeleteCreditCardForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-listCreditCards": (p) => <CreditCardsList data={p.output as any} onError={handleActionErrorChange} />,

    "tool-createNewAccount": (p) => (
      <CreateAccountForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-editAccount": (p) => <EditAccountForm data={p.output as any} onError={handleActionErrorChange} />,
    "tool-listAccountActions": () => (
      <ListAccountActions onSendMessage={onSendMessage} />
    ),
    "tool-deleteAccount": (p) => <DeleteAccountForm data={p.output as any} onError={handleActionErrorChange} />,
    "tool-listAccounts": (p) => <AccountsList data={p.output as any} onError={handleActionErrorChange} />,
    "tool-filterAccounts": (p) => <AccountsList data={p.output as any} onError={handleActionErrorChange} />,

    "tool-createNewItem": (p) => (
      <CreateItemForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-editItem": (p) => (
      <EditItemForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-deleteItem": (p) => <DeleteItemForm data={p.output as any} onError={handleActionErrorChange} />,
    "tool-listItems": (p) => <ItemsList data={p.output as any} />,

    "tool-createNewGoal": (p) => (
      <CreateGoalForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-editGoal": (p) => (
      <EditGoalForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-listGoalActions": () => (
      <ListGoalActions onSendMessage={onSendMessage} />
    ),
    "tool-deleteGoal": (p) => (
      <DeleteGoalForm data={p.output as any} onError={handleActionErrorChange} />
    ),
    "tool-listGoals": (p) => <GoalsList data={p.output as any} onError={handleActionErrorChange} />,
  };

  const renderParts = () =>
    message.parts.map((part, i) => {
      const partKey = `${i}-${part.type}`;

      if (part.type == "reasoning" && part.state == "streaming") {
        return <ReasoningState key={partKey} />;
      }

      if (part.type === "text") {
        return (
          <div
            key={partKey}
            className={cn(
              "inline-block max-w-[90%] rounded-lg p-3",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {part.text}
            </p>
          </div>
        );
      }

      const renderer = toolRenderers[part.type];

      if (!renderer || !part.type.includes("tool")) return null;

      const castedPart = part as DynamicToolUIPart;
      const toolErrorMessage = getErrorMessage(
        (castedPart.output as { error?: unknown })?.error
      );
      const content = toolErrorMessage ? null : renderer(castedPart);
      const errorMessage = actionError ?? toolErrorMessage;
      const actionState = errorMessage ? "output-error" : castedPart.state;

      return (
        <ActionWrapper
          key={partKey}
          state={actionState}
          errorMessage={errorMessage}
        >
          {content}
        </ActionWrapper>
      );
    });

  return (
    <>
      {renderParts()}
      <div
        className={cn(
          "text-xs text-gray-500 mt-1",
          message.role === "user" ? "text-right" : "text-left"
        )}
      >
        {timestamp.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </>
  );
};

export default MessageComponentContent;
