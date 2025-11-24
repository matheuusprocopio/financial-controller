"use client";

import { updateAccountAction } from "@/actions/account";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface IEditAccountForm {
  data: {
    accountId?: string;
    name?: string;
    financialInstitution?: string;
    balance?: number;
  };
  onError(errMsg: string): void;
}

const EditAccountForm = ({ data, onError }: IEditAccountForm) => {
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
      onSubmit={async (formData) => {
        if (accountId) {
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
          
          if (Object.keys(updatePayload).length > 0) {
            const resp = await updateAccountAction(accountId, updatePayload);

            if ("error" in resp) {
              const message =
                typeof resp.error?.message === "string"
                  ? resp.error.message
                  : "Erro ao atualizar conta.";
              onError(message);
            }
          }
        }
      }}
    />
  );
};

export default EditAccountForm;
