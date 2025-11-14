"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Menu, Wallet, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface IHeader {
  user?: {
    name: string;
    avatar?: string;
  };
  onToggleSidebar?: () => void;
}

const Header = ({
  user = { name: "Usuário" },
  onToggleSidebar,
}: IHeader) => {
  const router = useRouter();
  const { logout, loading, user: firebaseUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Usa o nome do Firebase se disponível, caso contrário usa a prop
  const displayName = firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || user.name;
  const displayEmail = firebaseUser?.email || "";

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 outline-none focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8 ring-2 ring-indigo-500/30 hover:ring-indigo-400/50 transition-all">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600">
                  <User className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block text-gray-200">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {displayEmail || "Minha Conta"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="cursor-pointer"
              disabled={loading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{loading ? "Saindo..." : "Sair"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
