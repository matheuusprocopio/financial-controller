"use client";

import { updateCategoryAction } from "@/actions/category";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface IEditCategoryForm {
  data: {
    categoryId?: string;
    name?: string;
    imagePath?: string;
    mainCategoryId?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const EditCategoryForm = ({ data, onError, onSubmitted }: IEditCategoryForm) => {
  const categoryId = data?.categoryId ?? "";
  const categoryName = data?.name ?? "";
  const imagePath = data?.imagePath ?? "";
  const mainCategoryId = data?.mainCategoryId ?? "";

  return (
    <FormCard
      title="Editar categoria"
      description="Atualize os dados da categoria"
      fields={[
        {
          name: "name",
          label: "Nome da categoria",
          type: "text",
          placeholder: "Ex: Alimentação",
        },
        {
          name: "imagePath",
          label: "Caminho da imagem (opcional)",
          type: "text",
          placeholder: "Ex: /images/categoria.png",
        },
        {
          name: "mainCategoryId",
          label: "ID da categoria principal (opcional)",
          type: "text",
          placeholder: "Ex: 123e4567-e89b-12d3-a456-426614174000",
        },
      ]}
      submitLabel="Atualizar categoria"
      defaultFormData={{
        name: categoryName,
        imagePath: imagePath,
        mainCategoryId: mainCategoryId,
      }}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onSubmit={async (formData) => {
        if (categoryId) {
          const updatePayload: any = {};
          
          if (formData["name"]) {
            updatePayload.name = formData["name"];
          }
          if (formData["imagePath"] !== undefined && formData["imagePath"] !== "") {
            updatePayload.imagePath = formData["imagePath"];
          }
          if (formData["mainCategoryId"] !== undefined && formData["mainCategoryId"] !== "") {
            updatePayload.mainCategoryId = formData["mainCategoryId"];
          }
          
          if (Object.keys(updatePayload).length === 0) {
            return false;
          }

          try {
            const resp = await updateCategoryAction(categoryId, updatePayload);

            if (resp && typeof resp === "object" && "error" in resp) {
              const message =
                typeof (resp as any).error?.message === "string"
                  ? (resp as any).error.message
                  : "Erro ao atualizar categoria.";
              onError?.(message, resp);
              return false;
            }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Erro ao atualizar categoria.";
            onError?.(message, error);
            return false;
          }
        }
      }}
    />
  );
};

export default EditCategoryForm;
