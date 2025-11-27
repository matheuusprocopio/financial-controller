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
      <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-indigo-500/30">
        {isUserMessage && photoURL ? (
          <AvatarImage src={photoURL} alt={`Foto de ${authorLabel}`} />
        ) : null}
        {message.role == "assistant" || message.role == "system" ? (
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
            {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          "flex-1 space-y-2 flex flex-col",
          message.role === "user" ? "text-right items-end" : "text-left items-start"
        )}
      >
        <div className="text-xs font-semibold text-foreground/80">{authorLabel}</div>
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
