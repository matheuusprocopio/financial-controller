"use client";

import type React from "react";
import { Suspense, useState } from "react";

import ChatSidebar from "@/components/chat/ChatSidebar";
import Header from "@/components/layout/Header";

const LayoutContainer = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-screen">
        <Header onToggleSidebar={handleToggleSidebar} />
        <div className="flex flex-1 overflow-hidden relative">
          <ChatSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
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
};

export default LayoutContainer;
