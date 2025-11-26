"use client";

import { deleteGoalAction } from "@/actions/goal";
import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface IDeleteGoalForm {
  data: {
    goalId?: string;
    title?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string): void;
  onSubmitted?(): void;
}

const DeleteGoalForm = ({ data, onError, onSubmitted }: IDeleteGoalForm) => {
  const goalId = data?.goalId ?? "";
  const title = data?.title ?? "Meta sem título";

  return (
    <ConfirmationCard
      title="Excluir meta"
      description="Confirme para remover definitivamente esta meta"
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      confirmVariant="destructive"
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onConfirm={async () => {
        if (!goalId) {
          onError?.("Meta inválida");
          return;
        }
        try {
          const resp = await deleteGoalAction(goalId);

          if (resp && typeof resp === "object" && "error" in resp) {
            const message =
              typeof resp.error?.message === "string"
                ? resp.error.message
                : "Erro ao excluir meta.";
            onError?.(message);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Erro ao excluir meta.";
          onError?.(message);
        }
      }}
    >
      <Card className="p-3 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-destructive" />
          </div>
          <div className="font-medium text-sm">{title}</div>
        </div>
      </Card>
    </ConfirmationCard>
  );
};

export default DeleteGoalForm;
