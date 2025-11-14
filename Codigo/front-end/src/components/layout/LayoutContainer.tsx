"use client";

import type React from "react";
import { Suspense, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

import ChatSidebar from "@/components/chat/ChatSidebar";
import Header from "@/components/layout/Header";
import "@/app/chat/chat.css";

const LayoutContainer = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false); 
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true); 
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {

    if (!authChecked) return;

    const isPublicRoute = pathname === "/";
    if (!user && !isPublicRoute) {
      router.push("/?login=true");
    }
  }, [user, pathname, router, authChecked]); 
  
  const isChatPage = pathname === "/chat";

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const isPublicRoute = pathname === "/";
  if (!authChecked && !isPublicRoute) {
    return (
      // n ta funcionando 
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user && !isPublicRoute && authChecked) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isChatPage ? (
        <div className="chat-page-container">
          <div className="flex flex-col h-screen relative z-10">
            <Header 
              user={user ? {
                name: user.displayName || user.email?.split('@')[0] || "Usuário",
                avatar: user.photoURL || undefined
              } : undefined}
              onToggleSidebar={handleToggleSidebar} 
            />
            <div className="flex flex-1 overflow-hidden relative">
              <ChatSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </Suspense>
  );
};

export default LayoutContainer;
