"use client";

import { useEffect, useRef, useState } from "react";

import { createGoalAction } from "@/actions/goal";
import FormCard from "@/components/chat/gen-ui/FormCard";
import { AccountType } from "@/types/account.type";

type GoalFormAccount = Pick<AccountType, "id" | "name" | "financialInstitution">;

interface ICreateGoalForm {
  data: {
    title?: string;
    description?: string;
    accountId?: string | null;
    targetAmount?: number;
    deadline?: string | null;
    alreadySubmitted?: boolean;
    accounts?: GoalFormAccount[];
  };
  onError?(errMsg: string): void;
}

const CreateGoalForm = ({ data, onError }: ICreateGoalForm) => {
  const GLOBAL_ACCOUNT_VALUE = "__goal_global__";
  const [availableAccounts, setAvailableAccounts] = useState<GoalFormAccount[]>(
    data?.accounts ?? []
  );
  const hasSyncedAccounts = (data?.accounts?.length ?? 0) > 0;
  const hasRequestedFallback = useRef(false);

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
          console.error("Erro ao buscar contas para o formulário de metas.", error);
        }
        hasRequestedFallback.current = false;
      }
    };

    fetchAccounts();

    return () => {
      isMounted = false;
    };
  }, [hasSyncedAccounts]);

  const normalizeDateInput = (value?: string | null) =>
    value ? value.substring(0, 10) : "";

  const defaultTarget =
    typeof data?.targetAmount === "number" ? String(data?.targetAmount) : "";

  const accountOptions = [
    { value: GLOBAL_ACCOUNT_VALUE, label: "Meta global (sem conta)" },
    ...availableAccounts.map((account) => ({
      value: account.id,
      label: `${account.name} - ${account.financialInstitution}`,
    })),
  ];

  const defaultAccountValue =
    data?.accountId === null
      ? GLOBAL_ACCOUNT_VALUE
      : data?.accountId ?? "";

  return (
    <FormCard
      title="Nova meta"
      description="Preencha os dados da nova meta financeira"
      fields={[
        {
          name: "title",
          label: "Título",
          type: "text",
          placeholder: "Ex: Reserva de Emergência",
          required: true,
        },
        {
          name: "description",
          label: "Descrição",
          type: "textarea",
          placeholder: "Contextualize esta meta...",
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
          required: true,
          min: "0",
        },
        {
          name: "deadline",
          label: "Prazo (opcional)",
          type: "date",
        },
      ]}
      submitLabel="Adicionar meta"
      defaultFormData={{
        title: data?.title ?? "",
        description: data?.description ?? "",
        accountId: defaultAccountValue,
        targetAmount: defaultTarget,
        deadline: normalizeDateInput(data?.deadline),
      }}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmit={async (formData) => {
        try {
          const parsedAmount = parseFloat(formData["targetAmount"] ?? "0");
          const selectedAccount = formData["accountId"];
          const normalizedAccountId = !selectedAccount
            ? null
            : selectedAccount === GLOBAL_ACCOUNT_VALUE
            ? null
            : selectedAccount.trim();
          const payload = {
            title: formData["title"] ?? "",
            description: formData["description"] || undefined,
            accountId: normalizedAccountId,
            targetAmount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
            deadline: formData["deadline"] || undefined,
          };

          const resp = await createGoalAction(payload);

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao criar meta.";
            onError?.(message);
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao criar meta.";
          onError?.(message);
        }
      }}
    />
  );
};

export default CreateGoalForm;
