"use client";

import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateCreditCardForm {
  data?: {
    cardName?: string;
    financialInstitution?: string;
    limit?: number;
    dueDate?: string;
  };
}

const CreateCreditCardForm = ({ data }: ICreateCreditCardForm) => {
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <FormCard
      title="Novo cartão de crédito"
      description="Preencha os dados do cartão de crédito"
      fields={[
        {
          name: "cardName",
          label: "Nome do cartão",
          type: "text",
          placeholder: "Ex: Cartão Platinum",
        },
        {
          name: "financialInstitution",
          label: "Banco",
          type: "text",
          placeholder: "Ex: Nubank",
        },
        {
          name: "limit",
          label: "Limite",
          type: "number",
          placeholder: "Ex: 5000",
        },
        {
          name: "dueDate",
          label: "Mês de vencimento",
          type: "month",
          placeholder: "Ex: 2025-02",
          min: getCurrentMonth(),
        },
      ]}
      submitLabel="Adicionar cartão"
      defaultFormData={{
        cardName: data?.cardName ?? "",
        financialInstitution: data?.financialInstitution ?? "",
        limit: data?.limit !== undefined ? String(data.limit) : "",
        dueDate: data?.dueDate ?? "",
      }}
      onSubmit={(data) => {}}
    />
  );
};

export default CreateCreditCardForm;
