"use client";

import { useRef, useEffect } from "react";
import { UIMessage } from "@ai-sdk/react";

import MessageComponent from "./MessageComponent";
import { FrontMessageType } from "@/types/message.types";

interface MessageContainerProps {
  messages: FrontMessageType[];
  onSendMessage: (message: string) => Promise<void>;
}

const MessagesContainer = ({
  messages,
  onSendMessage,
}: MessageContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesContainer;
