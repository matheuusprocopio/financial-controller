"use client";

import { useRef, useEffect, useState } from "react";
import { UIMessage } from "@ai-sdk/react";

import MessageComponent from "./MessageComponent";
import { FrontMessageType } from "@/types/message.types";
import { useAuth } from "@/hooks/use-auth";

interface MessageContainerProps {
  messages: FrontMessageType[];
  onSendMessage: (message: string) => Promise<void>;
  chatId: string;
}

const MessagesContainer = ({
  messages,
  onSendMessage,
  chatId,
}: MessageContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, backendUser, loadBackendUser } = useAuth();

  const photoURL = user?.photoURL || "";
  const [displayName, setDisplayName] = useState<string>(
    backendUser?.name || ""
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!backendUser) {
      void loadBackendUser();
    }
  }, [backendUser, loadBackendUser]);

  useEffect(() => {
    const nextName = backendUser?.name;
    if (nextName) {
      setDisplayName((prev) => (prev === nextName ? prev : nextName));
    }
  }, [backendUser?.name]);

  return (
    <div className="relative z-10 flex-1 overflow-hidden">
      <div className="relative h-full flex-1 overflow-y-auto p-6 chat-scroll-dark">
        {messages.map((message) => (
          <MessageComponent
            onSendMessage={onSendMessage}
            key={message.message.id}
            message={message.message}
            timestamp={message.createdAt}
            chatId={chatId}
            photoURL={photoURL}
            displayName={displayName}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesContainer;
