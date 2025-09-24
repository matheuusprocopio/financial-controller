"use client";

import type React from "react";
import { Header } from "@/components/layout/header";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Suspense, useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    // <CHANGE> Handle new chat creation
    console.log("Creating new chat...");
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    // <CHANGE> Handle chat selection
    console.log("Selecting chat:", chatId);
    setSidebarOpen(false);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-screen">
        <Header onToggleSidebar={handleToggleSidebar} />
        <div className="flex flex-1 overflow-hidden relative">
          {/* <CHANGE> Added sidebar component */}
          <ChatSidebar
            isOpen={sidebarOpen}
            onClose={handleCloseSidebar}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
          />
          {/* <CHANGE> Main content area with conditional margin */}
          <main
            className={`flex-1 overflow-hidden transition-all duration-300 ${
              sidebarOpen ? "ml-80" : "ml-0"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  );
}
