import type React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  components?: React.ReactNode;
};

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto",
        message.sender === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
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

      {/* Message Content */}
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

        {/* Render additional components for agent messages */}
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
}
