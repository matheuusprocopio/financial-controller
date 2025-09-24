"use client";

import type React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageType } from "@/types/message.types";

interface IMessageComponent {
  message: MessageType;
}

const MessageComponent = ({ message }: IMessageComponent) => {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto",
        message.sender === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        {message.sender === "agent" ? (
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
          message.sender === "user" ? "text-right" : "text-left"
        )}
      >
        <div
          className={cn(
            "inline-block p-3 rounded-lg max-w-[80%]",
            message.sender === "user"
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted text-muted-foreground"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        {message.sender === "agent" && message.components && (
          <div className="max-w-[80%]">{message.components}</div>
        )}
        <div
          className={cn(
            "text-xs text-muted-foreground",
            message.sender === "user" ? "text-right" : "text-left"
          )}
        >
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
