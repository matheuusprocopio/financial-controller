"use client";

import CreateCategoryForm from "@/components/ToolsComponents/Categories/CreateCategoryForm";
import DeleteCategoryForm from "@/components/ToolsComponents/Categories/DeleteCategoryForm";
import CategoriesList from "@/components/ToolsComponents/Categories/ListCategories";
import ListCategoryActions from "@/components/ToolsComponents/Categories/ListCategoryActions";

import CreateCreditCardForm from "@/components/ToolsComponents/CreditCards/CreateCreditCardForm";
import DeleteCreditCardForm from "@/components/ToolsComponents/CreditCards/DeleteCreditCardForm";
import CreditCardsList from "@/components/ToolsComponents/CreditCards/ListCreditCards";
import ListCreditCardActions from "@/components/ToolsComponents/CreditCards/ListCreditCardActions";

import { CategorieType } from "@/data/categoriesMock";
import { CreditCardType } from "@/data/creditCardsMock";
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
                "chat-message inline-block",
                message.role === "user"
                  ? "chat-message-user ml-auto"
                  : "chat-message-assistant"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-100">
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

        case "tool-createNewCreditCard": {
          let output = { cardName: "" , financialInstitution: "", limit: 0, dueDate: "" };

          if (part.state == "output-available") {
            output = part.output as { cardName: string; financialInstitution: string; limit: number; dueDate: string };
          }

          return (
            <div
              key={`${message.id}-createNewCreditCard-tool-${i}`}
              className="max-w-[80%]"
            >
              <CreateCreditCardForm 
                cardName={output.cardName} 
                financialInstitution={output.financialInstitution}
                limit={output.limit}
                dueDate={output.dueDate}
              />
            </div>
          );
        }
        case "tool-listCreditCardActions": {
          return (
            <div
              key={`${message.id}-listCreditCardActions-tool-${i}`}
              className="max-w-[80%]"
            >
              <ListCreditCardActions onSendMessage={onSendMessage} />
            </div>
          );
        }
        case "tool-deleteCreditCard": {
          let output = { cardName: "", cardId: "" };

          if (part.state == "output-available") {
            output = part.output as { cardName: string; cardId: string };
          }

          return (
            <div
              key={`${message.id}-deleteCreditCard-tool-${i}`}
              className="max-w-[80%]"
            >
              <DeleteCreditCardForm
                cardName={output.cardName}
                cardId={output.cardId}
              />
            </div>
          );
        }
        case "tool-listCreditCards": {
          let output = {
            cardName: "",
            totalOfCreditCards: 0,
            creditCards: [] as unknown,
          };

          if (part.state == "output-available") {
            output = part.output as {
              cardName: string;
              creditCards: CreditCardType[];
              totalOfCreditCards: number;
            };
          }

          return (
            <div
              key={`${message.id}-listCreditCards-tool-${i}`}
              className="max-w-[80%]"
            >
              <CreditCardsList
                cardName={output.cardName}
                creditCards={output.creditCards as CreditCardType[]}
                totalOfCreditCards={output.totalOfCreditCards}
              />
            </div>
          );
        }
        default: {
          return null;
        }
        
      }
    });
  };

  return (
    <>
      {renderParts()}
      <div
        className={cn(
          "text-xs text-gray-500 mt-1",
          message.role === "user" ? "text-right" : "text-left"
        )}
      >
        {timestamp.toLocaleTimeString()}
      </div>
    </>
  );
};

export default MessageComponentContent;
