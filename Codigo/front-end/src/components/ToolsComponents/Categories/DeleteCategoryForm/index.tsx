"use client";

import { deleteCategoryAction } from "@/actions/category";
import ConfirmationCard from "@/components/chat/gen-ui/ConfirmationCard";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface IDeleteCategoryForm {
  data: {
    categoryId?: string;
    name?: string;
  };
}

const DeleteCategoryForm = ({ data }: IDeleteCategoryForm) => {
  const categoryId = data?.categoryId ?? "";
  const categoryName = data?.name ?? "Not found";

  return (
    <ConfirmationCard
      title="Confirmar Exclusão"
      description="Você tem certeza que deseja deletar esta categoria?"
      confirmLabel="Sim, deletar"
      cancelLabel="Cancelar"
      confirmVariant="destructive"
      onConfirm={async () => {
        if (categoryId) {
          await deleteCategoryAction(categoryId);
        }
      }}
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
