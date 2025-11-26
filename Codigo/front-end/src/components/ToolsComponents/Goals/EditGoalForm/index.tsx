"use client";

import { useEffect, useRef, useState } from "react";

import { updateGoalAction } from "@/actions/goal";
import FormCard from "@/components/chat/gen-ui/FormCard";
import { AccountType } from "@/types/account.type";

type GoalFormAccount = Pick<AccountType, "id" | "name" | "financialInstitution">;

interface IEditGoalForm {
  data: {
    goalId?: string;
    title?: string;
    description?: string | null;
    accountId?: string | null;
    targetAmount?: number;
    deadline?: string | null;
    accounts?: GoalFormAccount[];
    alreadySubmitted?: boolean;
  };
  onError(errMsg: string): void;
  onSubmitted?(): void;
}

const EditGoalForm = ({ data, onError, onSubmitted }: IEditGoalForm) => {
  const GLOBAL_ACCOUNT_VALUE = "__goal_global__";
  const goalId = data?.goalId ?? "";
  const title = data?.title ?? "";
  const description = data?.description ?? "";
  const originalAccountId = data?.accountId ?? null;
  const targetAmount = data?.targetAmount ?? 0;
  const deadline = data?.deadline ?? "";
  const [availableAccounts, setAvailableAccounts] = useState<GoalFormAccount[]>(
    data?.accounts ?? []
  );
  const hasSyncedAccounts = (data?.accounts?.length ?? 0) > 0;
  const hasRequestedFallback = useRef(false);

  const normalizeDateInput = (value?: string | null) =>
    value ? value.substring(0, 10) : "";

  useEffect(() => {
    setAvailableAccounts(data?.accounts ?? []);
  }, [data?.accounts]);

  useEffect(() => {
    if (hasSyncedAccounts || hasRequestedFallback.current) {
      return;
    }

    let isMounted = true;
    hasRequestedFallback.current = true;

    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/pagination/accounts?page=1&size=50");
        const payload = await response.json();

        if (!response.ok || "error" in payload) {
          hasRequestedFallback.current = false;
          return;
        }

        if (!isMounted) {
          return;
        }

        const normalizedAccounts = (payload?.data ?? []).map(
          (account: AccountType) => ({
            id: account.id,
            name: account.name,
            financialInstitution: account.financialInstitution,
          })
        );

        setAvailableAccounts(normalizedAccounts);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "Erro ao buscar contas para o formulário de edição de metas.",
            error
          );
        }
        hasRequestedFallback.current = false;
      }
    };

    fetchAccounts();

    return () => {
      isMounted = false;
    };
  }, [hasSyncedAccounts]);

  const accountOptions = [
    { value: GLOBAL_ACCOUNT_VALUE, label: "Meta global (sem conta)" },
    ...availableAccounts.map((account) => ({
      value: account.id,
      label: `${account.name} - ${account.financialInstitution}`,
    })),
  ];

  const defaultAccountValue =
    originalAccountId === null
      ? GLOBAL_ACCOUNT_VALUE
      : originalAccountId ?? "";

  return (
    <FormCard
      title="Editar meta"
      description="Altere os dados da meta financeira"
      fields={[
        {
          name: "title",
          label: "Título",
          type: "text",
          placeholder: "Ex: Reserva de Emergência",
        },
        {
          name: "description",
          label: "Descrição",
          type: "textarea",
          placeholder: "Atualize a descrição da meta",
        },
        {
          name: "accountId",
          label: "Conta vinculada (opcional)",
          type: "select",
          placeholder: "Selecione a conta desta meta",
          options: accountOptions,
        },
        {
          name: "targetAmount",
          label: "Valor objetivo",
          type: "number",
          placeholder: "0.00",
          min: "0",
        },
        {
          name: "deadline",
          label: "Prazo (opcional)",
          type: "date",
        },
      ]}
      submitLabel="Atualizar meta"
      defaultFormData={{
        title,
        description: description ?? "",
        accountId: defaultAccountValue,
        targetAmount: targetAmount.toString(),
        deadline: normalizeDateInput(deadline),
      }}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onSubmit={async (formData) => {
        if (!goalId) {
          onError("Meta inválida");
          return;
        }

        const updatePayload: Record<string, unknown> = {};

        if (formData["title"] && formData["title"] !== title) {
          updatePayload.title = formData["title"];
        }

        if (formData["description"] !== undefined) {
          updatePayload.description = formData["description"] || null;
        }

        if (formData["accountId"] !== undefined) {
          const selectedAccount = formData["accountId"];
          const normalizedAccountId = !selectedAccount
            ? null
            : selectedAccount === GLOBAL_ACCOUNT_VALUE
            ? null
            : selectedAccount.trim();

          if (normalizedAccountId !== originalAccountId) {
            updatePayload.accountId = normalizedAccountId;
          }
        }

        if (
          formData["targetAmount"] !== undefined &&
          formData["targetAmount"] !== ""
        ) {
          const parsedAmount = parseFloat(formData["targetAmount"]);
          if (Number.isFinite(parsedAmount)) {
            updatePayload.targetAmount = parsedAmount;
          }
        }

        if (formData["deadline"] !== undefined) {
          updatePayload.deadline = formData["deadline"] || null;
        }

        if (Object.keys(updatePayload).length === 0) {
          onError("Nenhuma alteração detectada");
          return;
        }

        const resp = await updateGoalAction(goalId, updatePayload);

        if (resp && typeof resp === "object" && "error" in resp) {
          const message =
            typeof resp.error?.message === "string"
              ? resp.error.message
              : "Erro ao atualizar meta.";
          onError(message);
        }
      }}
    />
  );
};

export default EditGoalForm;
