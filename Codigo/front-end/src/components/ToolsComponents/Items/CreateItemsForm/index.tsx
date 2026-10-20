"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { createItemAction } from "@/actions/item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { BatchItemRow, NamedOption } from "@/lib/tools/itemsBatch";
import { formatCurrencyValue, parseCurrencyToNumber } from "@/utils/currency";
import { getErrorMessage } from "@/utils/errors";
import { getLocalIsoDate } from "@/utils/date";
import { RequestError } from "@/utils/requestProvider";

interface ICreateItemsForm {
  data: {
    items?: BatchItemRow[];
    categories?: NamedOption[];
    accounts?: NamedOption[];
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

type RowStatus = "pending" | "saved" | "failed";

type Row = {
  key: number;
  name: string;
  description: string;
  amount: string;
  type: "income" | "expense";
  date: string;
  categoryId: string;
  accountId: string;
  needsCategorySelection: boolean;
  needsAccountSelection: boolean;
  status: RowStatus;
  error?: string;
};

const toRows = (items: BatchItemRow[] = []): Row[] =>
  items.map((item, key) => ({
    key,
    name: item.name ?? "",
    description: item.description ?? "",
    amount: formatCurrencyValue(item.amount),
    type: item.type ?? "expense",
    date: item.date || getLocalIsoDate(),
    categoryId: item.categoryId ?? "",
    accountId: item.accountId ?? "",
    needsCategorySelection: !!item.needsCategorySelection,
    needsAccountSelection: !!item.needsAccountSelection,
    status: "pending",
  }));

const isComplete = (row: Row) =>
  !!row.name.trim() &&
  parseCurrencyToNumber(row.amount) > 0 &&
  !!row.categoryId &&
  !!row.accountId &&
  !!row.date;

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CreateItemsForm = ({ data, onError, onSubmitted }: ICreateItemsForm) => {
  const { sessionId, backendUser } = useAuth();
  const [rows, setRows] = useState<Row[]>(() => toRows(data?.items));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    setRows(toRows(data?.items));
  }, [data?.items]);

  const categories = data?.categories ?? [];
  const accounts = data?.accounts ?? [];

  const updateRow = (key: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const removeRow = (key: number) =>
    setRows((prev) => prev.filter((row) => row.key !== key));

  const totals = rows.reduce(
    (acc, row) => {
      const value = parseCurrencyToNumber(row.amount);
      if (row.type === "income") acc.income += value;
      else acc.expense += value;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    if (!sessionId || !backendUser) {
      const message = "Sessão inválida. Tente fazer login novamente.";
      setFormError(message);
      onError?.(message, { sessionId, backendUser });
      return;
    }

    const toSave = rows.filter((row) => row.status !== "saved");
    if (toSave.some((row) => !isComplete(row))) {
      setFormError("Preencha nome, valor, categoria, conta e data em todas as transações.");
      return;
    }

    setIsSubmitting(true);
    const results = await Promise.all(
      toSave.map(async (row) => {
        try {
          const resp = await createItemAction({
            name: row.name.trim(),
            description: row.description.trim() || row.name.trim(),
            amount: parseCurrencyToNumber(row.amount),
            type: row.type,
            categoryId: row.categoryId,
            accountId: row.accountId,
            date: row.date,
            userId: backendUser.id,
          });
          if (resp && typeof resp === "object" && "error" in resp) {
            return { key: row.key, error: getErrorMessage((resp as RequestError).error) || "Erro ao salvar." };
          }
          return { key: row.key };
        } catch (err) {
          return { key: row.key, error: getErrorMessage(err) || "Erro ao salvar." };
        }
      })
    );
    setIsSubmitting(false);

    const byKey = new Map(results.map((r) => [r.key, r]));
    const nextRows: Row[] = rows.map((row) => {
      const result = byKey.get(row.key);
      if (!result) return row;
      return result.error
        ? { ...row, status: "failed", error: result.error }
        : { ...row, status: "saved", error: undefined };
    });
    setRows(nextRows);

    const failed = nextRows.filter((row) => row.status === "failed").length;
    if (failed > 0) {
      // Saved rows stay locked, so retrying only resends the ones that failed.
      setFormError(
        `${failed} de ${nextRows.length} transações não foram salvas. Revise e tente novamente.`
      );
      return;
    }

    setSavedCount(nextRows.length);
    onSubmitted?.();
  };

  if (data?.alreadySubmitted || savedCount !== null) {
    const count = savedCount ?? data?.items?.length ?? 0;
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-emerald-200 font-medium">
              {count === 1 ? "1 transação adicionada" : `${count} transações adicionadas`} com sucesso!
            </div>
            {savedCount !== null && (
              <div className="text-sm text-emerald-300/80 mt-1">
                {totals.expense > 0 && `Despesas ${brl(totals.expense)}`}
                {totals.expense > 0 && totals.income > 0 && " · "}
                {totals.income > 0 && `Receitas ${brl(totals.income)}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = rows.filter((row) => row.status !== "saved").length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">
          ✨ Confirmar {rows.length === 1 ? "1 transação" : `${rows.length} transações`}
        </CardTitle>
        <CardDescription>
          A IA separou e preencheu cada transação da sua mensagem. Revise, ajuste ou remova o
          que precisar e confirme tudo de uma vez.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma transação para adicionar.</p>
          )}

          {rows.map((row) => {
            const locked = row.status === "saved" || isSubmitting;
            return (
              <div
                key={row.key}
                className={cn(
                  "rounded-lg border p-3 space-y-2",
                  row.status === "saved" && "border-emerald-500/30 opacity-70",
                  row.status === "failed" && "border-destructive/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Nome da transação"
                    placeholder="Nome"
                    value={row.name}
                    disabled={locked}
                    onChange={(e) => updateRow(row.key, { name: e.target.value })}
                  />
                  <Input
                    aria-label="Valor"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    className={cn(
                      "w-32 shrink-0 text-right",
                      row.type === "income" ? "text-emerald-400" : "text-red-400"
                    )}
                    value={row.amount}
                    disabled={locked}
                    onChange={(e) =>
                      updateRow(row.key, { amount: formatCurrencyValue(e.target.value) })
                    }
                  />
                  {row.status === "saved" ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-label="Salva" />
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label={`Remover ${row.name || "transação"}`}
                      disabled={locked}
                      onClick={() => removeRow(row.key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Select
                    value={row.type}
                    disabled={locked}
                    onValueChange={(value) =>
                      updateRow(row.key, { type: value as "income" | "expense" })
                    }
                  >
                    <SelectTrigger className="w-full" aria-label="Tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={row.categoryId}
                    disabled={locked}
                    onValueChange={(value) =>
                      updateRow(row.key, { categoryId: value, needsCategorySelection: false })
                    }
                  >
                    <SelectTrigger
                      className={cn("w-full", row.needsCategorySelection && "border-amber-500/60")}
                      aria-label="Categoria"
                      title={row.needsCategorySelection ? "Confira a categoria sugerida" : undefined}
                    >
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={row.accountId}
                    disabled={locked}
                    onValueChange={(value) =>
                      updateRow(row.key, { accountId: value, needsAccountSelection: false })
                    }
                  >
                    <SelectTrigger
                      className={cn("w-full", row.needsAccountSelection && "border-amber-500/60")}
                      aria-label="Conta"
                      title={row.needsAccountSelection ? "Confira a conta" : undefined}
                    >
                      <SelectValue placeholder="Conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    aria-label="Data"
                    value={row.date}
                    disabled={locked}
                    onChange={(e) => updateRow(row.key, { date: e.target.value })}
                  />
                </div>

                {row.error && <p className="text-xs text-destructive">{row.error}</p>}
              </div>
            );
          })}

          {rows.some((row) => row.needsCategorySelection || row.needsAccountSelection) && (
            <p className="text-xs text-amber-400/90">
              Campos destacados não tiveram correspondência exata: confira antes de confirmar.
            </p>
          )}

          {rows.length > 0 && (
            <div className="flex flex-wrap justify-end gap-x-4 text-sm text-muted-foreground">
              {totals.expense > 0 && <span>Despesas {brl(totals.expense)}</span>}
              {totals.income > 0 && <span>Receitas {brl(totals.income)}</span>}
            </div>
          )}

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isSubmitting || pendingCount === 0}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Salvando..."
              : pendingCount === 1
                ? "Confirmar e adicionar 1 transação"
                : `Confirmar e adicionar ${pendingCount} transações`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateItemsForm;
