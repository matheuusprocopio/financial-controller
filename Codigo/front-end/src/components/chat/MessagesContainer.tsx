"use client";

import { useRef, useEffect, useState } from "react";

import MessageComponent, { AssistantAvatar } from "./MessageComponent";
import ChatEmptyState from "./ChatEmptyState";
import { FrontMessageType } from "@/types/message.types";
import { useAuth } from "@/hooks/use-auth";

interface MessageContainerProps {
  messages: FrontMessageType[];
  onSendMessage: (message: string) => Promise<void>;
  chatId: string;
  isWaitingResponse?: boolean;
}

const MessagesContainer = ({
  messages,
  onSendMessage,
  chatId,
  isWaitingResponse = false,
}: MessageContainerProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { backendUser, loadBackendUser } = useAuth();

  const [displayName, setDisplayName] = useState<string>(
    backendUser?.name || ""
  );

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // scrollIntoView also scrolls outer ancestors in Safari. When a tool renders
    // a tall form, that can move the whole chat layout out of the viewport.
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isWaitingResponse]);

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

  if (messages.length === 0 && !isWaitingResponse) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto chat-scroll-dark">
        <ChatEmptyState userName={displayName} onSendMessage={onSendMessage} />
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain chat-scroll-dark"
    >
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        {messages.map((message) => (
          <MessageComponent
            onSendMessage={onSendMessage}
            key={message.message.id}
            message={message.message}
            timestamp={message.createdAt}
            chatId={chatId}
          />
        ))}
        {isWaitingResponse && (
          <div className="flex items-center gap-3" aria-live="polite">
            <AssistantAvatar />
            <span className="flex gap-1" aria-label="O assistente está respondendo">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesContainer;
