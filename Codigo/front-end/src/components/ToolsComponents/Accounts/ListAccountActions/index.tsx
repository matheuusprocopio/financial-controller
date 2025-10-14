"use client";

import { ActionItemType } from "@/types/base.types";
import BaseListActions from "../../Base/BaseListActions";

const ListAccountActions = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => Promise<void>;
}) => {
  const accountActions: ActionItemType[] = [
    {
      label: "Listar contas",
      description: "Mostra todas as contas disponíveis",
      onClick: async () =>
        await onSendMessage("Mostre as contas disponíveis"),
    },
    {
      label: "Criar conta",
      description: "Cria uma nova conta",
      onClick: async () => await onSendMessage("Criar uma nova conta"),
    },
    {
      label: "Excluir conta",
      description: "Exclui uma conta",
      onClick: async () => await onSendMessage("Exclua uma conta"),
    }
  ];

  return <BaseListActions actions={accountActions} />;
};

export default ListAccountActions;
