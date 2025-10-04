"use client";

import CreateCategoryForm from "@/components/ToolsComponents/Categories/CreateCategoryForm";
import DeleteCategoryForm from "@/components/ToolsComponents/Categories/DeleteCategoryForm";
import CategoriesList from "@/components/ToolsComponents/Categories/ListCategories";
import ListCategoryActions from "@/components/ToolsComponents/Categories/ListCategoryActions";
import CreateAccountForm from "@/components/ToolsComponents/Accounts/CreateAccountForm";
import DeleteAccountForm from "@/components/ToolsComponents/Accounts/DeleteAccountForm";
import AccountsList from "@/components/ToolsComponents/Accounts/ListAccounts";
import ListAccountActions from "@/components/ToolsComponents/Accounts/ListAccountActions";
import { CategorieType } from "@/data/categoriesMock";
import { AccountType } from "@/data/accountsMock";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import ActionWrapper from "../gen-ui/ActionWrapper";

interface IMessageComponentContent {
  message: UIMessage;
  timestamp: Date;
  onSendMessage: (message: string) => Promise<void>;
}

const MessageComponentContent = ({
  onSendMessage,
  message,
  timestamp,
}: IMessageComponentContent) => {
  const renderParts = () => {
    return message.parts.map((part, i) => {
      switch (part.type) {
        case "text":
          return (
            <div
              key={`${message.id}-text-${i}`}
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
        case "tool-createNewCategory": {
          return (
            <ActionWrapper key={`${message.id}-createNewCategory-tool-${i}`}>
              <CreateCategoryForm data={part.output as any} />
            </ActionWrapper>
          );
        }
        case "tool-listCategoryActions": {
          return (
            <ActionWrapper key={`${message.id}-listCategoryActions-tool-${i}`}>
              <ListCategoryActions onSendMessage={onSendMessage} />
            </ActionWrapper>
          );
        }
        case "tool-deleteCategory": {
          return (
            <ActionWrapper key={`${message.id}-deleteCategory-tool-${i}`}>
              <DeleteCategoryForm data={part.output as any} />
            </ActionWrapper>
          );
        }
        case "tool-listCategories": {
          return (
            <ActionWrapper key={`${message.id}-deleteCategory-tool-${i}`}>
              <CategoriesList data={part.output as any} />
            </ActionWrapper>
          );
        }
        case "tool-createNewAccount": {
          return (
            <ActionWrapper key={`${message.id}-createNewAccount-tool-${i}`}>
              <CreateAccountForm data={part.output as any} />
            </ActionWrapper>
          );
        }
        case "tool-listAccountActions": {
          return (
            <ActionWrapper key={`${message.id}-listAccountActions-tool-${i}`}>
              <ListAccountActions onSendMessage={onSendMessage} />
            </ActionWrapper>
          );
        }
        case "tool-deleteAccount": {
          return (
            <ActionWrapper key={`${message.id}-deleteAccount-tool-${i}`}>
              <DeleteAccountForm data={part.output as any} />
            </ActionWrapper>
          );
        }
        case "tool-listAccounts": {
          return (
            <ActionWrapper key={`${message.id}-listAccounts-tool-${i}`}>
              <AccountsList
              data={part.output as any}
              />
            </ActionWrapper>
          );
        }
      }
    });
  };

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
