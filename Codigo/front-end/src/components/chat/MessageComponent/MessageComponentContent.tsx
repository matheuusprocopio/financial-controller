"use client";

import { cn } from "@/lib/utils";
import { UIMessage } from "ai";

interface IMessageComponentContent {
  message: UIMessage;
  timestamp: Date;
}

const MessageComponentContent = ({
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
        case "tool-createCategory":
          return <div className="max-w-[80%]"></div>;
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
