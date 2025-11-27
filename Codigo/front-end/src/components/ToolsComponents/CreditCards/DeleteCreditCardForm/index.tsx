"use client";

import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface IDeleteCreditCardForm {
  data?: {
    cardName?: string;
    cardId?: string;
    financialInstitution?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const DeleteCreditCardForm = ({ data, onError, onSubmitted }: IDeleteCreditCardForm) => {
  const cardName = data?.cardName ?? "Cartão não encontrado";
  const financialInstitution = data?.financialInstitution;
  const cardId = data?.cardId;

  return (
    <ConfirmationCard
      title="Confirmar Exclusão"
      description="Você tem certeza que deseja deletar este cartão de crédito?"
      confirmLabel="Sim, deletar"
      cancelLabel="Cancelar"
      confirmVariant="destructive"
      alreadySubmitted={data?.alreadySubmitted}
      onSubmitted={onSubmitted}
      onConfirm={async () => {
        if (!cardId) {
          onError?.("Cartão não encontrado para exclusão.");
          return false;
        }

        // Integração pendente: ao implementar, propague possíveis erros via onError.
        return true;
      }}
    >
      <Card className="p-3 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <div className="font-medium text-sm">{cardName}</div>
            {financialInstitution && <div className="text-xs text-muted-foreground">{financialInstitution}</div>}
          </div>
        </div>
      </Card>
    </ConfirmationCard>
  );
};

export default DeleteCreditCardForm;
