"use client";

import { useRef, useEffect } from "react";
import { UIMessage } from "@ai-sdk/react";

import MessageComponent from "./MessageComponent";

interface MessageContainerProps {
  messages: UIMessage[];
  onSendMessage: (message: string) => Promise<void>;
}

const MessagesContainer = ({ messages, onSendMessage }: MessageContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageComponent
            onSendMessage={onSendMessage}
            key={message.id}
            message={message}
            timestamp={new Date()}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesContainer;
