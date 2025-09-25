"use client";

import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateAccountForm {
  accountNickname?: string;
  financialInstitution?: string;
  initialBalance?: number;
}

const CreateAccountForm = ({ 
  accountNickname, 
  financialInstitution, 
  initialBalance 
}: ICreateAccountForm) => {
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
        nickname: accountNickname || "",
        financial_institution: financialInstitution || "",
        balance: (initialBalance || 0).toString(),
      }}
      onSubmit={(data) => {}}
    />
  );
};

export default CreateAccountForm;
