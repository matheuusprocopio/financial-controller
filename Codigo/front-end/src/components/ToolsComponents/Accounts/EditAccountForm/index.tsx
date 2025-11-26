"use client";

import { updateAccountAction } from "@/actions/account";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface IEditAccountForm {
  data: {
    accountId?: string;
    name?: string;
    financialInstitution?: string;
    balance?: number;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const EditAccountForm = ({ data, onError, onSubmitted }: IEditAccountForm) => {
  const accountId = data?.accountId ?? "";
  const accountName = data?.name ?? "";
  const financialInstitution = data?.financialInstitution ?? "";
  const balance = data?.balance !== undefined && data?.balance !== null ? data.balance : 0;

  return (
    <FormCard
      title="Editar conta"
      description="Atualize os dados da conta"
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
          label: "Saldo",
          type: "number",
          placeholder: "0.00",
        },
      ]}
      submitLabel="Atualizar conta"
      defaultFormData={{
        name: accountName,
        financialInstitution: financialInstitution,
        balance: balance.toString(),
      }}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onSubmit={async (formData) => {
        if (!accountId) {
          onError?.("Conta não encontrada para atualizar.", data);
          return false;
        }

        const updatePayload: any = {};
        
        if (formData["name"]) {
          updatePayload.name = formData["name"];
        }
        if (formData["financialInstitution"]) {
          updatePayload.financialInstitution = formData["financialInstitution"];
        }
        if (formData["balance"] !== undefined && formData["balance"] !== "") {
          updatePayload.balance = parseFloat(formData["balance"]);
        }
        
        if (Object.keys(updatePayload).length === 0) {
          return false;
        }

        try {
          const resp = await updateAccountAction(accountId, updatePayload);

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao atualizar conta.";
            onError?.(message, resp);
            return false;
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Erro ao atualizar conta.";
          onError?.(message, error);
          return false;
        }

        return true;
      }}
    />
  );
};

export default EditAccountForm;
