"use client";

import { ActionItemType } from "@/types/base.types";
import BaseListActions from "../../Base/BaseListActions";

const ListCreditCardActions = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => Promise<void>;
}) => {
  const creditCardActions: ActionItemType[] = [
    {
      label: "Listar cartões",
      description: "Mostra todos os cartões de crédito disponíveis",
      onClick: async () =>
        await onSendMessage("Mostre os cartões de crédito disponíveis"),
    },
    {
      label: "Criar cartão",
      description: "Adiciona um novo cartão de crédito",
      onClick: async () => await onSendMessage("Criar um novo cartão de crédito"),
    },
    {
      label: "Excluir cartão",
      description: "Remove um cartão de crédito",
      onClick: async () => await onSendMessage("Exclua um cartão de crédito"),
    },
  ];

  return <BaseListActions actions={creditCardActions} />;
};

export default ListCreditCardActions;
