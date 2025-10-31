"use client";

import { createCategoryAction } from "@/actions/category";
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
      onSubmit={async (data) => {
        await createCategoryAction(
          {
            name: data["category"] ?? "",
            userId: "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
            imagePath: ""
          }
        )
      }}
    />
  );
};

export default CreateCategoryForm;
