"use client";

import { Card } from "@/components/ui/card";
import { ActionItemType } from "@/types/base.types";

interface IBaseListActions {
  actions: ActionItemType[];
}

const BaseListActions = ({ actions }: IBaseListActions) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Comandos Disponíveis:</h3>
      <div className="space-y-2 text-sm">
        {actions.map((action, i) => (
          <button
            onClick={() => {
              if (action.onClick) action.onClick();
            }}
            className="flex items-center gap-2 cursor-pointer"
            key={`${
              action.label
            }-${i}-baselistaction-${new Date().toISOString()}`}
          >
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              {action.label}
            </span>
            <span>- {action.description}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default BaseListActions;
