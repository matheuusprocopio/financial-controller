"use client";

import type React from "react";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";

import ChatSidebar from "@/components/chat/ChatSidebar";
import Header from "@/components/layout/Header";

const LayoutContainer = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  
  const isChatPage = pathname === "/chat";

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isChatPage ? (
       
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
      ) : (
        
        <>{children}</>
      )}
    </Suspense>
  );
};

export default LayoutContainer;
