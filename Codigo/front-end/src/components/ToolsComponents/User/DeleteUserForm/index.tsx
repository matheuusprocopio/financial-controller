"use client";

import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/utils/errors";
import type { RequestError } from "@/utils/requestProvider";
import { deleteUser } from "@/utils/services/users";
import { Mail, Trash2, User as UserIcon } from "lucide-react";

interface DeleteUserFormProps {
  data: {
    userId?: string;
    name?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const DeleteUserForm = ({ data, onError, onSubmitted }: DeleteUserFormProps) => {
  const { sessionId, backendUser, logout, loadBackendUser } = useAuth();

  const resolvedName = backendUser?.name ?? "Usuário";

  const ensureError = (message: string, payload?: unknown) => {
    onError?.(message, payload);
  };

  const handleConfirm = async () => {
    if (!sessionId) {
      ensureError("Sessão inválida. Faça login novamente para continuar.");
      return false;
    }

    let targetUserId = data?.userId ?? backendUser?.id ?? "";

    if (!targetUserId) {
      try {
        const fetchedUser = await loadBackendUser();
        targetUserId = fetchedUser?.id ?? "";
      } catch (loadError) {
        ensureError(
          "Não foi possível carregar os dados do usuário para exclusão.",
          loadError
        );
        return false;
      }
    }

    if (!targetUserId) {
      ensureError("Não foi possível identificar o usuário para exclusão.");
      return false;
    }

    try {
      const resp = await deleteUser(targetUserId, sessionId);

      if (!resp) {
        ensureError("Erro ao deletar usuário. Tente novamente mais tarde.");
        return false;
      }

      if (resp && typeof resp === "object" && "error" in (resp as RequestError)) {
        ensureError(getErrorMessage(resp) ?? "Erro ao deletar usuário.", resp);
        return false;
      }

      await logout();
    } catch (error) {
      ensureError(getErrorMessage(error) ?? "Erro ao deletar usuário.", error);
      return false;
    }

    return true;
  };

  return (
    <ConfirmationCard
      title="Deletar usuário"
      description="Esta ação é irreversível. Todos os seus dados serão removidos."
      confirmLabel="Sim, deletar"
      confirmVariant="destructive"
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onConfirm={handleConfirm}
    >
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm">
        <div className="flex items-center gap-3 font-medium text-destructive">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
            <Trash2 className="h-5 w-5" />
          </div>
          <span>Você está prestes a remover permanentemente sua conta.</span>
        </div>
        <div className="mt-4 space-y-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>{resolvedName}</span>
          </div>
        </div>
      </div>
    </ConfirmationCard>
  );
};

export default DeleteUserForm;
