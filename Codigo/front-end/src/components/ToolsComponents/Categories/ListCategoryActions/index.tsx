"use client";

import { ActionItemType } from "@/types/base.types";
import BaseListActions from "../../Base/BaseListActions";

const ListCategoryActions = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => Promise<void>;
}) => {
  const categoryActions: ActionItemType[] = [
    {
      label: "Listar categorias",
      description: "Mostra todas as categorias disponíveis",
      onClick: async () =>
        await onSendMessage("Mostre as categorias disponiveis"),
    },
    {
      label: "Criar categoria",
      description: "Cria uma categoria",
      onClick: async () => await onSendMessage("Criar uma nova categoria"),
    },
    {
      label: "Excluir categoria",
      description: "Exclui uma categoria",
      onClick: async () => await onSendMessage("Exclua uma categoria"),
    },
  ];

  return <BaseListActions actions={categoryActions} />;
};

export default ListCategoryActions;
