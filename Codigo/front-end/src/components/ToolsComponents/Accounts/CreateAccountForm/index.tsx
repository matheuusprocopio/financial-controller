"use client";

import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateAccountForm {
  data: {
    nickname?: string;
    financial_institution?: string;
    balance?: number;
  };
}

const CreateAccountForm = ({ data }: ICreateAccountForm) => {
  const accountNickname = data?.nickname ?? "";
  const financialInstitution = data?.financial_institution ?? "";
  const initialBalance = data?.balance ?? 0;

  return (
    <FormCard
      title="Nova conta"
      description="Preencha os dados da conta"
      fields={[
        {
          name: "nickname",
          label: "Apelido da conta",
          type: "text",
          placeholder: "Ex: Conta Corrente Principal",
        },
        {
          name: "financial_institution",
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
        nickname: accountNickname,
        financial_institution: financialInstitution,
        balance: initialBalance.toString(),
      }}
      onSubmit={(data) => {}}
    />
  );
};

export default CreateAccountForm;
