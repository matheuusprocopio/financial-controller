"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TutorialAction = {
  label: string;
  description: string;
  prompt: string;
};

export type TutorialActionsPart = {
  type: "tutorial-actions";
  title: string;
  subtitle: string;
  actions: TutorialAction[];
  aiInstruction?: string;
};

export const isTutorialActionsPart = (
  part: unknown
): part is TutorialActionsPart => {
  if (!part || typeof part !== "object") return false;
  return (part as TutorialActionsPart).type === "tutorial-actions";
};

const TutorialActionsCard = ({
  data,
  onSendMessage,
}: {
  data: TutorialActionsPart;
  onSendMessage: (message: string) => Promise<void>;
}) => {
  return (
    <Card className={cn("w-full max-w-3xl border-dashed border-primary/40 p-5")}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Primeiros passos
        </p>
        <h3 className="text-lg font-semibold text-foreground">{data.title}</h3>
        <p className="text-sm text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="mt-4 flex flex-col space-y-2 text-sm">
        {data.actions.map((action, index) => (
          <button
            key={`${action.label}-${index}`}
            onClick={() => void onSendMessage(action.prompt)}
            className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-muted"
          >
            <span className="shrink-0 rounded bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary group-hover:bg-primary/20">
              {action.label}
            </span>
            <span className="text-foreground/80 line-clamp-1">
              - {action.description}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default TutorialActionsCard;