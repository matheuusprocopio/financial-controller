"use client";

import { useRef, useEffect } from "react";
import { UIMessage } from "@ai-sdk/react";

import MessageComponent from "./MessageComponent";

interface MessageContainerProps {
  messages: UIMessage[];
}

const MessagesContainer = ({ messages }: MessageContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 shadow-inner">
        {messages.map((message) => (
          <MessageComponent
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
