"use client";

import { updateGoalAction } from "@/actions/goal";
import FormCard from "@/components/chat/gen-ui/FormCard";

interface IEditGoalForm {
  data: {
    goalId?: string;
    title?: string;
    description?: string | null;
    accountId?: string | null;
    targetAmount?: number;
    deadline?: string | null;
  };
  onError(errMsg: string): void;
}

const EditGoalForm = ({ data, onError }: IEditGoalForm) => {
  const goalId = data?.goalId ?? "";
  const title = data?.title ?? "";
  const description = data?.description ?? "";
  const accountId = data?.accountId ?? "";
  const targetAmount = data?.targetAmount ?? 0;
  const deadline = data?.deadline ?? "";

  const normalizeDateInput = (value?: string | null) =>
    value ? value.substring(0, 10) : "";

  return (
    <FormCard
      title="Editar meta"
      description="Altere os dados da meta financeira"
      fields={[
        {
          name: "title",
          label: "Título",
          type: "text",
          placeholder: "Ex: Reserva de Emergência",
        },
        {
          name: "description",
          label: "Descrição",
          type: "textarea",
          placeholder: "Atualize a descrição da meta",
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
          min: "0",
        },
        {
          name: "deadline",
          label: "Prazo (opcional)",
          type: "date",
        },
      ]}
      submitLabel="Atualizar meta"
      defaultFormData={{
        title,
        description: description ?? "",
        accountId: accountId ?? "",
        targetAmount: targetAmount.toString(),
        deadline: normalizeDateInput(deadline),
      }}
      onSubmit={async (formData) => {
        if (!goalId) {
          onError("Meta inválida");
          return;
        }

        const updatePayload: Record<string, unknown> = {};

        if (formData["title"] && formData["title"] !== title) {
          updatePayload.title = formData["title"];
        }

        if (formData["description"] !== undefined) {
          updatePayload.description = formData["description"] || null;
        }

        if (formData["accountId"] !== undefined) {
          updatePayload.accountId = formData["accountId"]
            ? formData["accountId"]
            : null;
        }

        if (
          formData["targetAmount"] !== undefined &&
          formData["targetAmount"] !== ""
        ) {
          const parsedAmount = parseFloat(formData["targetAmount"]);
          if (Number.isFinite(parsedAmount)) {
            updatePayload.targetAmount = parsedAmount;
          }
        }

        if (formData["deadline"] !== undefined) {
          updatePayload.deadline = formData["deadline"] || null;
        }

        if (Object.keys(updatePayload).length === 0) {
          onError("Nenhuma alteração detectada");
          return;
        }

        const resp = await updateGoalAction(goalId, updatePayload);

        if (resp && typeof resp === "object" && "error" in resp) {
          const message =
            typeof resp.error?.message === "string"
              ? resp.error.message
              : "Erro ao atualizar meta.";
          onError(message);
        }
      }}
    />
  );
};

export default EditGoalForm;
