"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";

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
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <Image
          src="/logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <h1 className="text-lg font-semibold">Assistente Financeiro</h1>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
      </div>
    </header>
  );
};

export default Header;
