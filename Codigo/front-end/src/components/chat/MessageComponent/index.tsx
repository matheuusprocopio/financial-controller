"use client";

import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import MessageComponentContent from "./MessageComponentContent";

interface IMessageComponent {
  message: UIMessage;
  photoURL: string;
  displayName: string;
  timestamp: Date;
  onSendMessage: (message: string) => Promise<void>;
  chatId: string;
}

const MessageComponent = ({
  message,
  timestamp,
  onSendMessage,
  photoURL,
  displayName,
  chatId,
}: IMessageComponent) => {
  const isUserMessage = message.role === "user";
  const authorLabel =
    message.role === "assistant"
      ? "Assistente"
      : message.role === "system"
        ? "Sistema"
        : displayName || "Você";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto mb-4",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0 border border-border">
        {isUserMessage && photoURL ? (
          <AvatarImage src={photoURL} alt={`Foto de ${authorLabel}`} />
        ) : null}
        {message.role == "assistant" || message.role == "system" ? (
          <AvatarFallback className="bg-muted text-muted-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-muted text-sm text-foreground">
            {displayName ? displayName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          "flex-1 space-y-2 flex flex-col",
          message.role === "user" ? "text-right items-end" : "text-left items-start"
        )}
      >
        <div className="text-xs font-medium text-muted-foreground">{authorLabel}</div>
        <MessageComponentContent
          message={message}
          timestamp={timestamp}
          onSendMessage={onSendMessage}
          chatId={chatId}
        />
      </div>
    </div>
  );
};

export default MessageComponent;
