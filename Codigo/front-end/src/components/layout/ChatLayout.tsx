"use client";

import type React from "react";
import { useState } from "react";

import ChatSidebar from "@/components/chat/ChatSidebar";
import Header from "@/components/layout/Header";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]">
      <div className="relative z-10 flex h-full min-h-screen flex-col">
        <Header onToggleSidebar={handleToggleSidebar} />
        <div className="relative flex h-full flex-1 min-h-0 overflow-hidden">
          <ChatSidebar
            chatId={chatId}
            chatsData={chatsData}
            isOpen={sidebarOpen}
            onClose={handleCloseSidebar}
          />
          <main className="relative flex flex-1 min-h-0 min-w-0 overflow-hidden">
            <div className="flex flex-1 flex-col min-h-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
