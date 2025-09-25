"use client";

import MessagesContainer from "@/components/chat/MessagesContainer";
import ChatInput from "@/components/chat/ChatInput";
import { useChat } from "@ai-sdk/react";

export default function ChatWrapper() {
  const { messages, sendMessage } = useChat();

  const handleSendMessage = async (message: string) => {
    await sendMessage({ text: message });
  };

  return (
    <>
      <MessagesContainer
        messages={messages}
        onSendMessage={handleSendMessage}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </>
  );
}
