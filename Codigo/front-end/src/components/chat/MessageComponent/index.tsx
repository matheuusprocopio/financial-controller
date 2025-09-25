"use client";

import type React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import MessageComponentContent from "./MessageComponentContent";

interface IMessageComponent {
  message: UIMessage;
  timestamp: Date;
  onSendMessage: (message: string) => Promise<void>;
}

const MessageComponent = ({ message, timestamp, onSendMessage}: IMessageComponent) => {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        {message.role == "assistant" || message.role == "system" ? (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          "flex-1 space-y-2",
          message.role === "user" ? "text-right" : "text-left"
        )}
      >
        <MessageComponentContent message={message} timestamp={timestamp} onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default MessageComponent;
