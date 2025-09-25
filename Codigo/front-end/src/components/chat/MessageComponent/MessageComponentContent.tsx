"use client";

import CreateCategoryForm from "@/components/ToolsComponents/Categories/CreateCategoryForm";
import DeleteCategoryForm from "@/components/ToolsComponents/Categories/DeleteCategoryForm";
import ListCategoryActions from "@/components/ToolsComponents/Categories/ListCategoryActions";
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
