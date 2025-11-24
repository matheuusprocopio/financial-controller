"use client";

import { deleteItemAction } from "@/actions/item";
import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { Card } from "@/components/ui/card";
import { Trash2, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface IDeleteItemForm {
  data: {
    itemId?: string;
    name?: string;
    description?: string;
    amount?: number;
    date?: string;
    type?: "income" | "expense";
  };
}

const DeleteItemForm = ({ data }: IDeleteItemForm) => {
  const itemId = data?.itemId ?? "";
  const itemName = data?.name ?? "";
  const description = data?.description ?? "";
  const amount = data?.amount ?? 0;
  const date = data?.date ?? "";
  const type = data?.type ?? "expense";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTypeLabel = (itemType: string) => {
    return itemType === "income" ? "Receita" : "Despesa";
  };

  const getTypeIcon = (itemType: string) => {
    return itemType === "income" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <ConfirmationCard
      title="Confirmar Exclusão"
      description="Você tem certeza que deseja deletar esta transação?"
      confirmLabel="Sim, deletar"
      cancelLabel="Cancelar"
      confirmVariant="destructive"
      onConfirm={async () => {
        if (itemId) {
          await deleteItemAction(itemId);
        }
      }}
    >
      <Card className="p-3 border-destructive/20 bg-destructive/5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-medium text-sm">{itemName}</div>
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {amount !== undefined && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(amount)}
                </div>
              )}
              {date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(date)}
                </div>
              )}
              <div className="flex items-center gap-1">
                {getTypeIcon(type)}
                {getTypeLabel(type)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </ConfirmationCard>
  );
};

export default DeleteItemForm;
