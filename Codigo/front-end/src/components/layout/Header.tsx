"use client";

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
    <header className="relative z-10 flex items-center justify-between border-b border-purple-400/20 bg-black/60 p-4 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent" />
      <div className="relative flex items-center gap-3">
        {onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="h-9 w-9 rounded-lg border border-purple-400/30 bg-purple-500/10 text-white transition hover:border-purple-400/50 hover:bg-purple-500/20"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 blur-lg opacity-60 animate-pulse" />
          <Wallet className="relative z-10 h-6 w-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-purple-300 via-cyan-200 to-purple-300 bg-clip-text text-lg font-semibold text-transparent">
          Assistente Financeiro
        </h1>
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
