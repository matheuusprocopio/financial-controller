"use client";

import { ActionItemType } from "@/types/base.types";
import BaseListActions from "@/components/ToolsComponents/Base/BaseListActions";

const ListGoalActions = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => Promise<void>;
}) => {
  const goalActions: ActionItemType[] = [
    {
      label: "Listar metas",
      description: "Exibe todas as metas financeiras cadastradas",
      onClick: async () => await onSendMessage("Liste minhas metas"),
    },
    {
      label: "Criar meta",
      description: "Abre o formulário para cadastrar uma nova meta",
      onClick: async () =>
        await onSendMessage("Quero criar uma nova meta financeira"),
    },
    {
      label: "Atualizar meta",
      description: "Permite alterar título, valor ou prazo",
      onClick: async () => await onSendMessage("Atualize uma meta existente"),
    },
    {
      label: "Excluir meta",
      description: "Remove definitivamente uma meta",
      onClick: async () => await onSendMessage("Quero excluir uma meta"),
    },
  ];

  return <BaseListActions actions={goalActions} />;
};

export default ListGoalActions;
