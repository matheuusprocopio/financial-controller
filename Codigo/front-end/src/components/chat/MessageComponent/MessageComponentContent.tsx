"use client";

import CreateCategoryForm from "@/components/ToolsComponents/Categories/CreateCategoryForm";
import DeleteCategoryForm from "@/components/ToolsComponents/Categories/DeleteCategoryForm";
import CategoriesList from "@/components/ToolsComponents/Categories/ListCategories";
import ListCategoryActions from "@/components/ToolsComponents/Categories/ListCategoryActions";
import CreateAccountForm from "@/components/ToolsComponents/Accounts/CreateAccountForm";
import DeleteAccountForm from "@/components/ToolsComponents/Accounts/DeleteAccountForm";
import AccountsList from "@/components/ToolsComponents/Accounts/ListAccounts";
import ListAccountActions from "@/components/ToolsComponents/Accounts/ListAccountActions";
import { cn } from "@/lib/utils";
import { DynamicToolUIPart, UIMessage } from "ai";
import ActionWrapper from "../gen-ui/ActionWrapper";
import ReasoningState from "../gen-ui/ReasoningState";

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
  const toolRenderers: Record<string, ToolRendererType> = {
    "tool-createNewCategory": (p) => (
      <CreateCategoryForm data={p.output as any} />
    ),
    "tool-listCategoryActions": () => (
      <ListCategoryActions onSendMessage={onSendMessage} />
    ),
    "tool-deleteCategory": (p) => <DeleteCategoryForm data={p.output as any} />,
    "tool-listCategories": (p) => <CategoriesList data={p.output as any} />,
    "tool-createNewAccount": (p) => (
      <CreateAccountForm data={p.output as any} />
    ),
    "tool-listAccountActions": () => (
      <ListAccountActions onSendMessage={onSendMessage} />
    ),
    "tool-deleteAccount": (p) => <DeleteAccountForm data={p.output as any} />,
    "tool-listAccounts": (p) => <AccountsList data={p.output as any} />,
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

      const content = renderer(part);

      const castedPart = part as DynamicToolUIPart;

      return (
        <ActionWrapper key={partKey} state={castedPart.state}>
          {content}
        </ActionWrapper>
      );
    });

  return (
    <>
      {renderParts()}
      <div
        className={cn(
          "text-xs text-muted-foreground",
          message.role === "user" ? "text-right" : "text-left"
        )}
      >
        {timestamp.toLocaleTimeString()}
      </div>
    </>
  );
};

export default MessageComponentContent;
