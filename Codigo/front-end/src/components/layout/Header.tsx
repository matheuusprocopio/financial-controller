"use client";

import { useEffect, useState } from "react";
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
import { User, Menu, Wallet, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
interface IHeader {
  onToggleSidebar?: () => void;
}

const Header = ({
  onToggleSidebar,
}: IHeader) => {
  const router = useRouter();
  const { logout, loading, user: firebaseUser, backendUser, loadBackendUser } = useAuth();
  const [cookieChecked, setCookieChecked] = useState(false);
  const displayName = backendUser?.name || (loading ? "Carregando..." : "Usuário");
  const displayEmail = backendUser?.email || "";
  const isLoggedIn = !!backendUser;

  useEffect(() => {
    let cancelled = false;

    const ensureBackendUser = async () => {
      if (backendUser) {
        if (!cancelled) {
          setCookieChecked(true);
        }
        return;
      }

      try {
        await loadBackendUser();
      } finally {
        if (!cancelled) {
          setCookieChecked(true);
        }
      }
    };

    ensureBackendUser();

    return () => {
      cancelled = true;
    };
  }, [backendUser, loadBackendUser]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/10 bg-neutral-950 px-4">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="h-8 w-8 rounded-md border border-white/10 bg-transparent text-neutral-300 transition-colors hover:bg-white/5 hover:text-neutral-100"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/5">
          <Wallet className="h-4 w-4 text-neutral-200" />
        </div>
        <h1 className="text-[15px] font-medium tracking-tight text-neutral-100">
          Assistente Financeiro
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 outline-none focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage
                    src={firebaseUser?.photoURL || "/placeholder.svg"}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-neutral-800">
                    <User className="h-4 w-4 text-neutral-300" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm text-neutral-300 sm:block">
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
        ) : (
          <Button
            variant="secondary"
            onClick={() => router.push("/?login=true")}
            disabled={loading || !cookieChecked}
            className="h-8 rounded-md bg-neutral-100 px-3 text-sm font-medium text-neutral-950 hover:bg-white"
          >
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
