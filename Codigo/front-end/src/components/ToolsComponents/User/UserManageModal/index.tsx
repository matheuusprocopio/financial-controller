"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Pencil,
  Trash2,
  Mail,
  User as UserIcon,
  X,
} from "lucide-react";
import type { UserType } from "@/types/user.type";
import type { RequestError } from "@/utils/requestProvider";
import { getUserById } from "@/utils/services/users";
import { useAuth } from "@/hooks/use-auth";

interface UserManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
  onUpdate?: (user: UserType) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
}

const isRequestError = (response: unknown): response is RequestError => {
  return !!response && typeof response === "object" && "error" in response;
};

export default function UserManageModal({
  open,
  onOpenChange,
  user,
  onUpdate,
  onDelete,
}: UserManageModalProps) {
  const { sessionId } = useAuth();
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
          if (!sessionId) {
            throw new Error("Sessão inválida");
          }

          const response = await getUserById(user.id, sessionId);
          if (!response) {
            setName(user.name || "");
            setEmail(user.email || "");
            return;
          }
          if (isRequestError(response)) {
            throw new Error(response.error.message || "Erro ao carregar usuário");
          }
          if (response) {
            setName(response.name || "");
            setEmail(response.email || "");
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
  }, [user, open, sessionId]);

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
      const updatedUser: UserType = {
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

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    action: () => void,
  ) => {
    if (e.key === "Enter" && !loading) {
      action();
    }
  };

  if (!user) return null;

  const closeMainModal = () => {
    if (loading || isLoadingData) return;
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const statusStyles = {
    success: "bg-green-500/10 text-green-300 border-green-500/20",
    error: "bg-red-500/10 text-red-300 border-red-500/20",
    info: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  } as const;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeMainModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-50 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <UserIcon className="h-5 w-5" />
                  Gerenciar Usuário
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Atualize seus dados pessoais ou delete sua conta permanentemente.
                </p>
              </div>
              <button
                type="button"
                onClick={closeMainModal}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              {status && (
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${statusStyles[status.type]}`}
                  role="status"
                >
                  {status.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                  {status.type === "error" && <XCircle className="h-4 w-4" />}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-300"
                >
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleUpdate)}
                  disabled={loading || isLoadingData}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleUpdate)}
                  disabled={loading || isLoadingData}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading || isLoadingData}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Deletar Usuário
              </button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={closeMainModal}
                  disabled={loading || isLoadingData}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading || isLoadingData}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial"
                >
                  {loading || isLoadingData ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLoadingData ? "Carregando..." : "Salvando..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Salvar Alterações
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => {
              if (!loading) {
                setShowDeleteDialog(false);
              }
            }}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
            className="relative z-50 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/10 p-2">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 id="delete-user-title" className="text-lg font-semibold">
                  Confirmar Exclusão
                </h2>
                <p
                  id="delete-user-description"
                  className="mt-1 text-sm text-slate-400"
                >
                  Você tem certeza que deseja deletar sua conta? Esta ação não pode ser
                  desfeita e todos os seus dados serão perdidos permanentemente.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                  <UserIcon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">{user.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {status && status.type === "error" && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                <XCircle className="h-4 w-4" />
                <span>{status.message}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={loading}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Sim, Deletar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
