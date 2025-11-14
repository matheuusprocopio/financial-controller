"use client";

import { createAccountAction } from "@/actions/account";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateAccountForm {
  data: {
    name?: string;
    financialInstitution?: string;
    balance?: number;
  };
}

const CreateAccountForm = ({ data }: ICreateAccountForm) => {
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
      onSubmit={async (data) => {
        await createAccountAction({
          name: data["name"] ?? "",
          userId: "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
          financialInstitution: data["financialInstitution"] ?? "",
          balance: parseFloat(data["balance"] ?? "0"),
        });
      }}
    />
  );
};

export default CreateAccountForm;
