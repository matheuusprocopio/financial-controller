"use client";

import type React from "react";
import { Wallet } from "lucide-react";
import { UIMessage } from "ai";
import MessageComponentContent from "./MessageComponentContent";

interface IMessageComponent {
  message: UIMessage;
  timestamp: Date;
  onSendMessage: (message: string) => Promise<void>;
  chatId: string;
}

export const AssistantAvatar = () => (
  <div
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5"
    aria-hidden="true"
  >
    <Wallet className="h-3.5 w-3.5 text-neutral-300" />
  </div>
);

const MessageComponent = ({
  message,
  timestamp,
  onSendMessage,
  chatId,
}: IMessageComponent) => {
  // Mensagens do usuário ficam à direita, num balão; as do assistente são texto corrido com o ícone ao lado
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <MessageComponentContent
          message={message}
          timestamp={timestamp}
          onSendMessage={onSendMessage}
          chatId={chatId}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <AssistantAvatar />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3 pt-0.5">
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
