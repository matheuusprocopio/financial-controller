"use client";

import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateCreditCardForm {
  cardName: string;
  bank: string;
  limit: number;
}




const CreateCreditCardForm = ({ cardName, bank, limit }: ICreateCreditCardForm) => {
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
          name: "bank",
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
          label: "Dia do vencimento",
          type: "number",
          placeholder: "Ex: 15",
        },
      ]}
      submitLabel="Adicionar cartão"
      defaultFormData={{
        cardName: cardName || "",
        bank: bank || "",
        limit: limit?.toString() || "0",
        dueDate: "1",
      }}
      onSubmit={(data) => {}}
    />
  );
};

export default CreateCreditCardForm;
