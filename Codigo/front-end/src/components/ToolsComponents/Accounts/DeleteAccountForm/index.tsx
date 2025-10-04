"use client";

import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { Card } from "@/components/ui/card";
import { Trash2, Building2, DollarSign } from "lucide-react";

interface IDeleteAccountForm {
  data: {
    nickname?: string;
    financial_institution?: string;
    balance?: number;
  };
}

const DeleteAccountForm = ({ data }: IDeleteAccountForm) => {
  const accountNickname = data?.nickname ?? "";
  const financialInstitution = data?.financial_institution ?? "";
  const balance = data?.balance ?? 0;

  return (
    <ConfirmationCard
      title="Confirmar Exclusão"
      description="Você tem certeza que deseja deletar esta conta?"
      confirmLabel="Sim, deletar"
      cancelLabel="Cancelar"
      confirmVariant="destructive"
      onConfirm={() => {}}
    >
      <Card className="p-3 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{accountNickname}</div>
            {financialInstitution && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Building2 className="h-3 w-3" />
                {financialInstitution}
              </div>
            )}
            {balance !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <DollarSign className="h-3 w-3" />
                Saldo: R$ {balance.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </ConfirmationCard>
  );
};

export default DeleteAccountForm;
