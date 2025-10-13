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
    <div className="flex-1 overflow-hidden relative z-10">
      <div className="chat-messages-area h-full">
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
