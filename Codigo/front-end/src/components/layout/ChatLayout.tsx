"use client";

import type React from "react";
import { useState } from "react";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import { ChatListResponseType } from "@/types/chat.types";

const ChatLayout = ({
  children,
  chatsData,
  chatId,
}: {
  children: React.ReactNode;
  chatsData: ChatListResponseType;
  chatId: string,
}) => {
  // Só controla a gaveta no mobile; no desktop a sidebar fica sempre visível
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentChat = chatsData?.data?.find((chat) => chat.id === chatId);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-neutral-950 text-neutral-100">
      <ChatSidebar
        chatId={chatId}
        chatsData={chatsData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatTopBar
          title={currentChat?.name ?? "Conversa"}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
};

export default ChatLayout;
