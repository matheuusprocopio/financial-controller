"use client";

import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface IDeleteCategoryForm {
  categoryName: string;
  categoryId: string;
}

const DeleteCategoryForm = ({ categoryName }: IDeleteCategoryForm) => {
  return (
    <ConfirmationCard
      title="Confirmar Exclusão"
      description="Você tem certeza que deseja deletar esta categoria?"
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
          <div>
            <div className="font-medium text-sm">{categoryName}</div>
          </div>
        </div>
      </Card>
    </ConfirmationCard>
  );
};

export default DeleteCategoryForm;
