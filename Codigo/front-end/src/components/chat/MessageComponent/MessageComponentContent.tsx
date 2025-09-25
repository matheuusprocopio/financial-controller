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
                "inline-block p-3 rounded-lg max-w-[80%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {part.text}
              </p>
            </div>
          );
        case "tool-createNewCategory": {
          let output = { name: "" };

          if (part.state == "output-available") {
            output = part.output as { name: string };
          }

          return (
            <div
              key={`${message.id}-createNewCategory-tool-${i}`}
              className="max-w-[80%]"
            >
              <CreateCategoryForm categoryName={output.name} />
            </div>
          );
        }
        case "tool-listCategoryActions": {
          return (
            <div
              key={`${message.id}-listCategoryActions-tool-${i}`}
              className="max-w-[80%]"
            >
              <ListCategoryActions onSendMessage={onSendMessage} />
            </div>
          );
        }
        case "tool-deleteCategory": {
          let output = { name: "" };

          if (part.state == "output-available") {
            output = part.output as { name: string };
          }

          return (
            <div
              key={`${message.id}-deleteCategory-tool-${i}`}
              className="max-w-[80%]"
            >
              <DeleteCategoryForm
                categoryName={output.name}
                categoryId="fake-id"
              />
            </div>
          );
        }
        case "tool-listCategories": {
          let output = {
            name: "",
            totalOfCategories: 0,
            categories: [] as unknown,
          };

          if (part.state == "output-available") {
            output = part.output as {
              name: string;
              categories: CategorieType[];
              totalOfCategories: number;
            };
          }

          return (
            <div
              key={`${message.id}-deleteCategory-tool-${i}`}
              className="max-w-[80%]"
            >
              <CategoriesList
                categoryName={output.name}
                categories={output.categories as CategorieType[]}
                totalOfCategories={output.totalOfCategories}
              />
            </div>
          );
        }
        case "tool-createNewAccount": {
          let output = { 
            nickname: "", 
            financial_institution: "", 
            balance: 0 
          };

          if (part.state == "output-available") {
            output = part.output as { 
              nickname: string; 
              financial_institution: string; 
              balance: number; 
            };
          }

          return (
            <div
              key={`${message.id}-createNewAccount-tool-${i}`}
              className="max-w-[80%]"
            >
              <CreateAccountForm 
                accountNickname={output.nickname}
                financialInstitution={output.financial_institution}
                initialBalance={output.balance}
              />
            </div>
          );
        }
        case "tool-listAccountActions": {
          return (
            <div
              key={`${message.id}-listAccountActions-tool-${i}`}
              className="max-w-[80%]"
            >
              <ListAccountActions onSendMessage={onSendMessage} />
            </div>
          );
        }
        case "tool-deleteAccount": {
          let output = { 
            nickname: "", 
            financial_institution: "", 
            balance: 0 
          };

          if (part.state == "output-available") {
            output = part.output as { 
              nickname: string; 
              financial_institution: string; 
              balance: number; 
            };
          }

          return (
            <div
              key={`${message.id}-deleteAccount-tool-${i}`}
              className="max-w-[80%]"
            >
              <DeleteAccountForm
                accountNickname={output.nickname}
                accountId="fake-id"
                financialInstitution={output.financial_institution}
                balance={output.balance}
              />
            </div>
          );
        }
        case "tool-listAccounts": {
          let output = {
            nickname: "",
            totalOfAccounts: 0,
            accounts: [] as unknown,
          };

          if (part.state == "output-available") {
            output = part.output as {
              nickname: string;
              accounts: AccountType[];
              totalOfAccounts: number;
            };
          }

          return (
            <div
              key={`${message.id}-listAccounts-tool-${i}`}
              className="max-w-[80%]"
            >
              <AccountsList
                accountNickname={output.nickname}
                accounts={output.accounts as AccountType[]}
                totalOfAccounts={output.totalOfAccounts}
              />
            </div>
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
