"use client";

import MessagesContainer from "@/components/chat/MessagesContainer";
import ChatInput from "@/components/chat/ChatInput";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ServerMessageType } from "@/types/message.types";
import {
  convertServerMessageToUIMessage,
  getFrontMessages,
} from "@/utils/convertServerMessageToUiMessage";
import { generateMessageId } from "@/utils/messageId";

export default function ChatWrapper({
  serverMessages,
  chatId,
}: {
  serverMessages: ServerMessageType[];
  chatId: string;
}) {
  const { messages, sendMessage } = useChat({
    id: chatId,
    generateId: generateMessageId,
    messages: serverMessages.map((m) => convertServerMessageToUIMessage(m)),
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { chatId },
    }),
  });

  const handleSendMessage = async (message: string) => {
    await sendMessage({ text: message });
  };

  const frontMessages = getFrontMessages(serverMessages, messages);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden min-h-0">
      <MessagesContainer
        messages={frontMessages}
        chatId={chatId}
        onSendMessage={handleSendMessage}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
