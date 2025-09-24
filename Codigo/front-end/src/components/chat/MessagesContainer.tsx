"use client";

import { useRef, useEffect } from "react";
import MessageComponent from "./MessageComponent";
import { MessageType } from "@/types/message.types";

interface MessageContainerProps {
  messages: MessageType[];
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
          <MessageComponent key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesContainer;
