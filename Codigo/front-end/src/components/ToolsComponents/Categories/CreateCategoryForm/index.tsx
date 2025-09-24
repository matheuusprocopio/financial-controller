"use client";

import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateCategoryForm {
  categoryName: string;
}

const CreateCategoryForm = ({ categoryName }: ICreateCategoryForm) => {
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
        category: categoryName,
      }}
      onSubmit={(data) => {}}
    />
  );
};

export default CreateCategoryForm;
