"use client";

import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateCategoryForm {
  data: {
    name?: string;
  };
}

const CreateCategoryForm = ({ data }: ICreateCategoryForm) => {
  return (
    <FormCard
      title="Nova categoria"
      description="Preencha os dados da categoria"
      fields={[
        {
          name: "category",
          label: "Categoria",
          type: "text",
          placeholder: "Ex: Alimentação",
        },
      ]}
      submitLabel="Adicionar categoria"
      defaultFormData={{
        category: data?.name ?? "",
      }}
      onSubmit={(data) => {}}
    />
  );
};

export default CreateCategoryForm;
