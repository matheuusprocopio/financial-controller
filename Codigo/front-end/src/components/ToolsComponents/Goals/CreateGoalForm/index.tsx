"use client";

import { createGoalAction } from "@/actions/goal";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface ICreateGoalForm {
  data: {
    title?: string;
    description?: string;
    accountId?: string | null;
    targetAmount?: number;
    deadline?: string | null;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string): void;
}

const CreateGoalForm = ({ data, onError }: ICreateGoalForm) => {
  const normalizeDateInput = (value?: string | null) =>
    value ? value.substring(0, 10) : "";

  const defaultTarget =
    typeof data?.targetAmount === "number" ? String(data?.targetAmount) : "";

  return (
    <FormCard
      title="Nova meta"
      description="Preencha os dados da nova meta financeira"
      fields={[
        {
          name: "title",
          label: "Título",
          type: "text",
          placeholder: "Ex: Reserva de Emergência",
          required: true,
        },
        {
          name: "description",
          label: "Descrição",
          type: "textarea",
          placeholder: "Contextualize esta meta...",
        },
        {
          name: "accountId",
          label: "Conta vinculada (opcional)",
          type: "text",
          placeholder: "UUID da conta ou deixe vazio para meta global",
        },
        {
          name: "targetAmount",
          label: "Valor objetivo",
          type: "number",
          placeholder: "0.00",
          required: true,
          min: "0",
        },
        {
          name: "deadline",
          label: "Prazo (opcional)",
          type: "date",
        },
      ]}
      submitLabel="Adicionar meta"
      defaultFormData={{
        title: data?.title ?? "",
        description: data?.description ?? "",
        accountId: data?.accountId ?? "",
        targetAmount: defaultTarget,
        deadline: normalizeDateInput(data?.deadline),
      }}
      alreadySubmitted={data?.alreadySubmitted}
      onSubmit={async (formData) => {
        try {
          const parsedAmount = parseFloat(formData["targetAmount"] ?? "0");
          const payload = {
            title: formData["title"] ?? "",
            description: formData["description"] || undefined,
            accountId: formData["accountId"]?.trim()
              ? formData["accountId"].trim()
              : null,
            targetAmount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
            deadline: formData["deadline"] || undefined,
          };

          const resp = await createGoalAction(payload);

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao criar meta.";
            onError?.(message);
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao criar meta.";
          onError?.(message);
        }
      }}
    />
  );
};

export default CreateGoalForm;
