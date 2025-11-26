"use client";

import { createAccountAction } from "@/actions/account";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateAccountForm {
  data: {
    name?: string;
    financialInstitution?: string;
    balance?: number;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const CreateAccountForm = ({ data, onError, onSubmitted }: ICreateAccountForm) => {
  const accountName = data?.name ?? "";
  const financialInstitution = data?.financialInstitution ?? "";
  const initialBalance = data?.balance ?? 0;

  return (
    <FormCard
      title="Nova conta"
      description="Preencha os dados da conta"
      fields={[
        {
          name: "name",
          label: "Nome da conta",
          type: "text",
          placeholder: "Ex: Conta Corrente Principal",
        },
        {
          name: "financialInstitution",
          label: "Instituição financeira",
          type: "text",
          placeholder: "Ex: Banco do Brasil",
        },
        {
          name: "balance",
          label: "Saldo inicial",
          type: "number",
          placeholder: "0.00",
        },
      ]}
      submitLabel="Adicionar conta"
      defaultFormData={{
        name: accountName,
        financialInstitution: financialInstitution,
        balance: initialBalance.toString(),
      }}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onSubmit={async (data) => {
        try {
          const resp = await createAccountAction({
            name: data["name"] ?? "",
            financialInstitution: data["financialInstitution"] ?? "",
            balance: parseFloat(data["balance"] ?? "0"),
          });

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao criar conta.";
            onError?.(message, resp);
            return false;
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao criar conta.";
          onError?.(message, error);
          return false;
        }
      }}
    />
  );
};

export default CreateAccountForm;
