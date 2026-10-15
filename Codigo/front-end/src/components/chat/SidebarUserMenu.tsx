"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Home, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

const SidebarUserMenu = () => {
  const router = useRouter();
  const { logout, loading, user: firebaseUser, backendUser, loadBackendUser } = useAuth();

  const displayName = backendUser?.name || (loading ? "Carregando..." : "Usuário");
  const displayEmail = backendUser?.email || firebaseUser?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!backendUser) {
      void loadBackendUser();
    }
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5"
        >
          <Avatar className="h-8 w-8 border border-white/10">
            <AvatarImage src={firebaseUser?.photoURL || undefined} alt={displayName} />
            <AvatarFallback className="bg-neutral-800 text-xs text-neutral-200">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-neutral-100">{displayName}</p>
            {displayEmail && (
              <p className="truncate text-xs text-neutral-500">{displayEmail}</p>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-[--radix-dropdown-menu-trigger-width] min-w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm">{displayName}</p>
          {displayEmail && (
            <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Página inicial
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} disabled={loading} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {loading ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarUserMenu;
