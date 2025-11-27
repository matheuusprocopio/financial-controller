"use client";

import { createCategoryAction } from "@/actions/category";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateCategoryForm {
  data: {
    name?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const CreateCategoryForm = ({ data, onError, onSubmitted }: ICreateCategoryForm) => {
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
      onSubmitted={onSubmitted}
      onSubmit={async (data) => {
        try {
          const resp = await createCategoryAction({
            name: data["category"] ?? "",
            imagePath: "",
          });

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao criar categoria.";
            onError?.(message, resp);
            return false;
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao criar categoria.";
          onError?.(message, error);
          return false;
        }
      }}
    />
  );
};

export default CreateCategoryForm;
