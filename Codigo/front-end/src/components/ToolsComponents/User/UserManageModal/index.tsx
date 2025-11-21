"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Pencil, 
  Trash2, 
  Mail,
  User as UserIcon
} from "lucide-react";
import { getUserByIdService } from "@/utils/services/users/userService";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface UserManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onUpdate?: (user: UserData) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
}

export default function UserManageModal({
  open,
  onOpenChange,
  user,
  onUpdate,
  onDelete,
}: UserManageModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      if (open && user?.id) {
        setIsLoadingData(true);
        try {
          const userData = await getUserByIdService(user.id);
          if (userData) {
            setName(userData.name || "");
            setEmail(userData.email || "");
          } else {
            setName(user.name || "");
            setEmail(user.email || "");
          }
        } catch (error) {
          setStatus({
            type: "error",
            message: "Erro ao carregar dados do usuário",
          });
          setName(user.name || "");
          setEmail(user.email || "");
        } finally {
          setIsLoadingData(false);
        }
      } else if (!open) {
        setName("");
        setEmail("");
      }
    };

    fetchUserData();
  }, [user, open]);

  const handleUpdate = async () => {
    if (!user) return;

    if (!name.trim()) {
      setStatus({
        type: "error",
        message: "O nome é obrigatório",
      });
      return;
    }

    if (!email.trim()) {
      setStatus({
        type: "error",
        message: "O email é obrigatório",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({
        type: "error",
        message: "Email inválido",
      });
      return;
    }

    setStatus(null);
    setLoading(true);

    try {
      const updatedUser: UserData = {
        ...user,
        name: name.trim(),
        email: email.trim(),
      };

      if (onUpdate) {
        await onUpdate(updatedUser);
      }

      setStatus({
        type: "success",
        message: "Usuário atualizado com sucesso!",
      });

      setTimeout(() => {
        onOpenChange(false);
        setStatus(null);
      }, 1500);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Erro ao atualizar usuário",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);
    setStatus(null);

    try {
      if (onDelete) {
        await onDelete(user.id);
      }

      setStatus({
        type: "success",
        message: "Usuário deletado com sucesso!",
      });

      setTimeout(() => {
        setShowDeleteDialog(false);
        onOpenChange(false);
        setStatus(null);
      }, 1500);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Erro ao deletar usuário",
      });
      setShowDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !loading) {
      action();
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-100 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Gerenciar Usuário
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Atualize seus dados pessoais ou delete sua conta permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {status && (
              <Alert
                className={`${
                  status.type === "success"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : status.type === "error"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : status.type === "error" ? (
                  <XCircle className="h-4 w-4" />
                ) : null}
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 font-medium text-sm">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleUpdate)}
                disabled={loading || isLoadingData}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleUpdate)}
                disabled={loading || isLoadingData}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">\
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading || isLoadingData}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Usuário
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || isLoadingData}
                className="flex-1 sm:flex-initial bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={loading || isLoadingData}
                className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading || isLoadingData ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLoadingData ? 'Carregando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Você tem certeza que deseja deletar sua conta? Esta ação não pode ser
              desfeita e todos os seus dados serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Card className="p-3 border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-100">{user.name}</div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </div>
              </div>
            </div>
          </Card>

          {status && status.type === "error" && (
            <Alert className="bg-red-500/10 text-red-400 border-red-500/20">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sim, Deletar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
