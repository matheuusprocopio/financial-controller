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
import { User, Menu, Wallet, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import UserManageModal from "@/components/ToolsComponents/User/UserManageModal";
import type { UserType } from "@/types/user.type";
import type { RequestError } from "@/utils/requestProvider";
import { deleteUser, updateUser } from "@/utils/services/users";

interface IHeader {
  onToggleSidebar?: () => void;
}

const isRequestError = (response: unknown): response is RequestError => {
  return !!response && typeof response === "object" && "error" in response;
};

const Header = ({
  onToggleSidebar,
}: IHeader) => {
  const router = useRouter();
  const { logout, loading, user: firebaseUser, backendUser, loadBackendUser, sessionId } = useAuth();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserType | null>(null);
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

  const handleManageUser = async () => {
    if (!backendUser) return;
    setUserData(backendUser);
    setUserModalOpen(true);
  };

  const handleUpdateUser = async (user: UserType) => {
    try {
      if (!sessionId) {
        throw new Error("Sessão inválida");
      }

      const response = await updateUser(user.id, { name: user.name, email: user.email }, sessionId);
      if (!response) {
        throw new Error("Resposta inválida ao atualizar usuário");
      }
      if (isRequestError(response)) {
        throw new Error(response.error.message || "Erro ao atualizar usuário");
      }
      setUserData(response);
      await loadBackendUser();
    } catch (error: any) {
      throw new Error(error.message || "Erro ao atualizar usuário");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!sessionId) {
        throw new Error("Sessão inválida");
      }

      const response = await deleteUser(userId, sessionId);
      if (response && isRequestError(response)) {
        throw new Error(response.error.message || "Erro ao deletar usuário");
      }
      setUserData(null);

      await handleLogout();
    } catch (error: any) {
      throw new Error(error.message || "Erro ao deletar usuário");
    }
  };

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
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 outline-none focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8 ring-2 ring-indigo-500/30 hover:ring-indigo-400/50 transition-all">
                  <AvatarImage
                    src={firebaseUser?.photoURL || "/placeholder.svg"}
                    alt={displayName}
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
                onClick={handleManageUser}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Gerenciar Conta</span>
              </DropdownMenuItem>
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
            className="rounded-lg border border-purple-400/40 bg-purple-500/10 text-white hover:border-purple-400/60 hover:bg-purple-500/20"
          >
            Entrar
          </Button>
        )}
      </div>

      <UserManageModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        user={userData}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
      />
    </header>
  );
};

export default Header;
