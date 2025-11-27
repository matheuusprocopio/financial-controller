"use client";

import { cn } from "@/lib/utils";
import { DynamicToolUIPart, UIMessage } from "ai";
import ActionWrapper from "../gen-ui/ActionWrapper";
import ReasoningState from "../gen-ui/ReasoningState";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/utils/errors";
import { updateMessagePartsAction } from "@/actions/message";
import { NewToolsMap } from "./ToolsMap";
import TutorialActionsCard, {
  isTutorialActionsPart,
} from "../gen-ui/TutorialCard";

import { ChartSpec } from "@/types/chart.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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

function parseChartSpecFromText(text: string): ChartSpec | null {
  if (!text) return null;

  const trimmed = text.trim();

  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;

  try {
    const obj = JSON.parse(trimmed);

    if (!obj || obj.kind !== "chart") return null;
    if (!Array.isArray(obj.series) || !Array.isArray(obj.data)) return null;

    const chartType = obj.chartType === "bar" ? "bar" : "line";
    const xType = obj.xType === "time" ? "time" : "category";

    const series = obj.series.map((s: any) => ({
      key: String(s.key),
      label: String(s.label ?? s.key),
    }));

    const data = obj.data as ChartSpec["data"];

    const spec: ChartSpec = {
      title: String(obj.title ?? "Gráfico"),
      description: obj.description ? String(obj.description) : undefined,
      type: chartType,
      xLabel: String(obj.xLabel ?? "X"),
      yLabel: String(obj.yLabel ?? "Y"),
      xType,
      series,
      data,
    };

    return spec;
  } catch {
    return null;
  }
}


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

      if (isTutorialActionsPart(part)) {
        return (
          <TutorialActionsCard
            key={partKey}
            data={part}
            onSendMessage={onSendMessage}
          />
        );
      }

      if (part.type == "reasoning" && part.state == "streaming") {
        return <ReasoningState key={partKey} />;
      }

      if (part.type === "text") {
        const isUser = message.role === "user";

        let chartSpec: ChartSpec | null = null;
        let isChartStreaming = false;

        if (!isUser && typeof part.text === "string") {
          const trimmed = part.text.trim();

          const looksLikeChartJson =
            trimmed.startsWith("{") &&
            trimmed.includes('"kind"') &&
            trimmed.includes('"chart"');

          if (looksLikeChartJson) {
            if (trimmed.endsWith("}")) {
              // JSON completo -> podemos tentar parsear e renderizar o gráfico
              chartSpec = parseChartSpecFromText(trimmed);
            } else {
              // Parece JSON de gráfico, mas ainda não terminou de ser streamado
              isChartStreaming = true;
            }
          }
        }

        // Se já temos JSON completo de gráfico válido, renderiza o gráfico
        if (chartSpec) {
          const palette = [
            "#6366F1",
            "#22C55E",
            "#F97316",
            "#EC4899",
            "#06B6D4",
            "#F59E0B",
          ];

          const config: ChartConfig = {};
          chartSpec.series.forEach((serie, index) => {
            config[serie.key] = {
              label: serie.label,
              color: palette[index % palette.length],
            };
          });

          const ChartImpl = chartSpec.type === "bar" ? BarChart : LineChart;

          return (
            <div
              key={partKey}
              className={cn(
                "inline-block max-w-[90%] rounded-lg p-3",
                "bg-muted text-muted-foreground"
              )}
            >
              <div className="mb-2">
                <h3 className="text-sm font-semibold">{chartSpec.title}</h3>
                {chartSpec.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {chartSpec.description}
                  </p>
                )}
                <p className="mt-0.5 text-[0.65rem] text-muted-foreground/80">
                  {chartSpec.xLabel} × {chartSpec.yLabel}
                </p>
              </div>

              <ChartContainer
                config={config}
                className="h-64 w-full rounded-md bg-background"
              >
                <ChartImpl data={chartSpec.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {chartSpec.series.map((serie) =>
                    chartSpec.type === "bar" ? (
                      <Bar
                        key={serie.key}
                        dataKey={serie.key}
                        fill={`var(--color-${serie.key})`}
                        radius={4}
                      />
                    ) : (
                      <Line
                        key={serie.key}
                        type="monotone"
                        dataKey={serie.key}
                        stroke={`var(--color-${serie.key})`}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    )
                  )}
                </ChartImpl>
              </ChartContainer>
            </div>
          );
        }

        // Enquanto o JSON de gráfico ainda está sendo streamado,
        // mostramos só um placeholder, sem expor o código.
        if (isChartStreaming) {
          return (
            <div
              key={partKey}
              className={cn(
                "inline-block max-w-[90%] rounded-lg p-3",
                "bg-muted text-muted-foreground"
              )}
            >
              <p className="text-xs mb-2 text-muted-foreground">
                Gerando gráfico...
              </p>
              <div className="h-40 w-full animate-pulse rounded-md bg-muted/60" />
            </div>
          );
        }

        // Caso normal: texto comum (com o mesmo estilo que você já tinha)
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
