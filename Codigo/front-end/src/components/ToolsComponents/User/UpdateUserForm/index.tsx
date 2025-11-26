"use client";

import { useMemo } from "react";
import FormCard from "@/components/chat/gen-ui/FormCard";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/utils/errors";
import type { RequestError } from "@/utils/requestProvider";
import { updateUser } from "@/utils/services/users";

interface UpdateUserFormProps {
  data: {
    userId?: string;
    name?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const UpdateUserForm = ({ data, onError, onSubmitted }: UpdateUserFormProps) => {
  const { sessionId, backendUser, loadBackendUser } = useAuth();

  const resolvedName = data?.name ?? backendUser?.name ?? "";
  const resolvedUserId = data?.userId ?? backendUser?.id ?? "";

  const defaultFormData = useMemo(
    () => ({
      name: resolvedName,
    }),
    [resolvedName]
  );

  const ensureError = (message: string, payload?: unknown) => {
    onError?.(message, payload);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    const name = values.name?.trim();

    if (!sessionId) {
      ensureError("Sessão inválida. Faça login novamente para continuar.", {
        sessionId,
      });
      return false;
    }

    if (!name) {
      ensureError("O nome é obrigatório.");
      return false;
    }

    let targetUserId = resolvedUserId;

    if (!targetUserId) {
      try {
        const fetchedUser = await loadBackendUser();
        targetUserId = fetchedUser?.id ?? "";
      } catch (loadError) {
        ensureError(
          "Não foi possível carregar os dados do usuário para atualização.",
          loadError
        );
        return false;
      }
    }

    if (!targetUserId) {
      ensureError("Não foi possível identificar o usuário para atualização.");
      return false;
    }

    try {
      const resp = await updateUser(targetUserId, { name }, sessionId);

      if (!resp) {
        ensureError("Não foi possível atualizar o usuário. Tente novamente em instantes.");
        return false;
      }

      if (resp && typeof resp === "object" && "error" in (resp as RequestError)) {
        ensureError(getErrorMessage(resp) ?? "Erro ao atualizar usuário.", resp);
        return false;
      }

      await loadBackendUser();
    } catch (error) {
      ensureError(getErrorMessage(error) ?? "Erro ao atualizar usuário.", error);
      return false;
    }

    return true;
  };

  return (
    <FormCard
      title="Atualizar dados do usuário"
      description="Revise suas informações antes de confirmar."
      fields={[
        {
          name: "name",
          label: "Nome completo",
          type: "text",
          placeholder: "Seu nome",
          required: true,
        },
      ]}
      submitLabel="Salvar alterações"
      defaultFormData={defaultFormData}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onSubmit={handleSubmit}
    />
  );
};

export default UpdateUserForm;
