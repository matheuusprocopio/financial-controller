"use client";

import { cn } from "@/lib/utils";
import { DynamicToolUIPart, UIMessage } from "ai";
import ActionWrapper from "../gen-ui/ActionWrapper";
import ReasoningState from "../gen-ui/ReasoningState";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/utils/errors";
import { updateMessagePartsAction } from "@/actions/message";
import { NewToolsMap } from "./ToolsMap";

interface IMessageComponentContent {
  message: UIMessage;
  timestamp: Date;
  onSendMessage: (message: string) => Promise<void>;
  chatId: string;
}

type PartUpdatePayload = {
  alreadySubmitted?: boolean;
  error?: unknown | null;
};

const MessageComponentContent = ({
  onSendMessage,
  message,
  timestamp,
  chatId,
}: IMessageComponentContent) => {
  const [actionError, setActionError] = useState<string | null>(null);
  const [localParts, setLocalParts] = useState<UIMessage["parts"]>(
    message.parts
  );

  const toolsMap = NewToolsMap({ handleSendMessage: onSendMessage });

  useEffect(() => {
    setLocalParts(message.parts);
    setActionError(null);
  }, [message.id, message.parts]);

  useEffect(() => {
    const firstToolErrorMessage =
      localParts
        .map((part) => {
          if (!part.type.includes("tool")) return null;

          const outputError = (part as DynamicToolUIPart).output as unknown as {
            error?: unknown;
          };
          return getErrorMessage(outputError?.error);
        })
        .find(Boolean) ?? null;

    if (!actionError && firstToolErrorMessage) {
      setActionError(firstToolErrorMessage);
    }
  }, [localParts, actionError]);

  const persistPartUpdate = async (
    partIndex: number,
    update: PartUpdatePayload
  ) => {
    let updatedParts: UIMessage["parts"] = [];

    setLocalParts((prevParts) => {
      const nextParts = prevParts.map((part, idx) => {
        if (idx !== partIndex || !part.type.includes("tool")) return part;

        const castedPart = part as DynamicToolUIPart;
        const currentOutput = (castedPart.output ?? {}) as Record<
          string,
          unknown
        >;
        const nextOutput: Record<string, unknown> = { ...currentOutput };

        if (
          "alreadySubmitted" in update &&
          update.alreadySubmitted !== undefined
        ) {
          nextOutput.alreadySubmitted = update.alreadySubmitted;
        }

        if ("error" in update) {
          if (update.error === null) {
            delete nextOutput.error;
          } else {
            nextOutput.error = update.error;
          }
        }

        return {
          ...castedPart,
          output: nextOutput,
        } as DynamicToolUIPart;
      }) as UIMessage["parts"];

      updatedParts = nextParts;
      return nextParts;
    });

    if (!chatId || !message.id || updatedParts.length === 0) {
      return;
    }

    try {
      const resp = await updateMessagePartsAction(
        chatId,
        message.id,
        updatedParts
      );

      if (resp && typeof resp === "object" && "error" in resp) {
        const persistedErrorMessage = getErrorMessage(resp);
        if (persistedErrorMessage) {
          setActionError(persistedErrorMessage);
        }
      }
    } catch (error) {
      const persistedErrorMessage = getErrorMessage(error);
      if (persistedErrorMessage) {
        setActionError(persistedErrorMessage);
      }
    }
  };

  const renderParts = () =>
    localParts.map((part, i) => {
      const partKey = `${i}-${part.type}`;

      if (part.type == "reasoning" && part.state == "streaming") {
        return <ReasoningState key={partKey} />;
      }

      if (part.type === "text") {
        return (
          <div
            key={partKey}
            className={cn(
              "inline-block max-w-[90%] rounded-lg p-3",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {part.text}
            </p>
          </div>
        );
      }

      const renderer = toolsMap[part.type];

      if (!renderer || !part.type.includes("tool")) return null;

      const castedPart = part as DynamicToolUIPart;

      const handleToolError = (errMsg: string, errorPayload?: unknown) => {
        setActionError(errMsg);
        void persistPartUpdate(i, {
          error: errorPayload ?? { error: { message: errMsg } },
        });
      };

      const handleToolSubmitted = () => {
        setActionError(null);
        void persistPartUpdate(i, { alreadySubmitted: true, error: null });
      };

      const toolErrorMessage = getErrorMessage(
        (castedPart.output as { error?: unknown })?.error
      );
      const content = toolErrorMessage
        ? null
        : renderer(castedPart, {
            onError: handleToolError,
            onSubmitted: handleToolSubmitted,
          });
      const errorMessage = actionError ?? toolErrorMessage;
      const actionState = errorMessage
        ? "output-error"
        : (castedPart.state as any);

      return (
        <ActionWrapper
          key={partKey}
          state={actionState}
          errorMessage={errorMessage}
        >
          {content}
        </ActionWrapper>
      );
    });

  return (
    <>
      {renderParts()}
      <div
        className={cn(
          "text-xs text-gray-500 mt-1",
          message.role === "user" ? "text-right" : "text-left"
        )}
      >
        {timestamp.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </>
  );
};

export default MessageComponentContent;
