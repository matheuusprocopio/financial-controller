"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Menu, Wallet } from "lucide-react";

interface IHeader {
  user?: {
    name: string;
    avatar?: string;
  };
  onToggleSidebar?: () => void;
}

const Header = ({
  user = { name: "João Silva" },
  onToggleSidebar,
}: IHeader) => {
  return (
    <header className="chat-header flex items-center justify-between p-4">
      <div className="chat-header-glow" />
      <div className="chat-logo-container">
        {onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="chat-button border-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="chat-logo">
          <div className="chat-logo-glow" />
          <Wallet className="chat-logo-icon" />
        </div>
        <h1 className="chat-title">Assistente Financeiro</h1>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 ring-2 ring-indigo-500/30">
          <AvatarImage
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
          />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600">
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block text-gray-200">{user.name}</span>
      </div>
    </header>
  );
};

export default Header;
