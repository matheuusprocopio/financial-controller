"use client";

import { createCategoryAction } from "@/actions/category";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateCategoryForm {
  data: {
    name?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string): void;
}

const CreateCategoryForm = ({ data, onError }: ICreateCategoryForm) => {
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
      alreadySubmitted={data?.alreadySubmitted}
      onSubmit={async (data) => {
        try {
          const resp = await createCategoryAction({
            name: data["category"] ?? "",
            userId: "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
            imagePath: "",
          });

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao criar categoria.";
            onError?.(message);
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao criar categoria.";
          onError?.(message);
        }
      }}
    />
  );
};

export default CreateCategoryForm;
