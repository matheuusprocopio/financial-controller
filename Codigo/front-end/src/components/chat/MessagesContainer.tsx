"use client";

import { useRef, useEffect } from "react";
import { UIMessage } from "@ai-sdk/react";

import MessageComponent from "./MessageComponent";
import { FrontMessageType } from "@/types/message.types";
import { useAuth } from "@/hooks/use-auth";

interface MessageContainerProps {
  messages: FrontMessageType[];
  onSendMessage: (message: string) => Promise<void>;
}

const MessagesContainer = ({
  messages,
  onSendMessage,
}: MessageContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const photoURL = user?.photoURL || "";
  const displayName = user?.displayName || "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="relative z-10 flex-1 overflow-hidden">
      <div className="relative h-full flex-1 overflow-y-auto p-6 chat-scroll-dark">
        {messages.map((message) => (
          <MessageComponent
            onSendMessage={onSendMessage}
            key={message.message.id}
            message={message.message}
            timestamp={message.createdAt}
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
