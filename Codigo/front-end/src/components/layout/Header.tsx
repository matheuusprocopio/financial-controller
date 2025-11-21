"use client";

import { useState, useEffect } from "react";
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
import { 
  updateUserService, 
  deleteUserService,
  getUserByIdService 
} from "@/utils/services/users/userService";

interface IHeader {
  onToggleSidebar?: () => void;
}

const Header = ({
  onToggleSidebar,
}: IHeader) => {
  const router = useRouter();
  const { logout, loading, user: firebaseUser } = useAuth();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [dbUserName, setDbUserName] = useState<string>("");
  const [dbUserEmail, setDbUserEmail] = useState<string>("");
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Mostra apenas dados do banco de dados
  const displayName = dbUserName || (isLoadingUserData ? "Carregando..." : "Usuário");
  const displayEmail = dbUserEmail || "";

  // Buscar dados do usuário do banco ao carregar
  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser?.uid) {
        setIsLoadingUserData(true);
        try {
          const userData = await getUserByIdService(firebaseUser.uid);
          if (userData) {
            setDbUserName(userData.name);
            setDbUserEmail(userData.email);
          }
        } catch (error) {
          console.error('[Header] Error fetching user data:', error);
        } finally {
          setIsLoadingUserData(false);
        }
      }
    };

    fetchUserData();
  }, [firebaseUser?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleManageUser = async () => {
    if (!firebaseUser?.uid) return;
    const mockUser = {
      id: firebaseUser.uid,
      name: dbUserName,
      email: dbUserEmail,
    };
    setUserData(mockUser);
    setUserModalOpen(true);
  };

  const handleUpdateUser = async (user: any) => {
    try {
      const result = await updateUserService(user.id, { name: user.name, email: user.email });
      setDbUserName(user.name);
      setDbUserEmail(user.email);
      setUserData(user);
    } catch (error: any) {
      throw new Error(error.message || "Erro ao atualizar usuário");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserService(userId);
      setUserData(null);

      await handleLogout();
    } catch (error: any) {
      throw new Error(error.message || "Erro ao deletar usuário");
    }
  };

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
