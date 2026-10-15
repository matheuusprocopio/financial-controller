"use client";

import { useEffect, useMemo, useState } from "react";
import { updateItemAction } from "@/actions/item";
import { getItemById } from "@/utils/services/items";
import { listCategories } from "@/utils/services/categories";
import { listAccounts } from "@/utils/services/accounts";
import FormCard, { type FormField } from "@/components/chat/gen-ui/FormCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { RequestError } from "@/utils/requestProvider";
import { getErrorMessage } from "@/utils/errors";
import { formatCurrencyValue, parseCurrencyToNumber } from "@/utils/currency";
import { getLocalIsoDate } from "@/utils/date";

interface IEditItemForm {
  data?: {
    itemId?: string;
    name?: string;
    description?: string;
    amount?: number;
    date?: string;
    type?: "income" | "expense";
    categoryId?: string;
    accountId?: string;
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const EditItemForm = ({ data, onError, onSubmitted }: IEditItemForm) => {
  const { sessionId, backendUser, loading: authLoading } = useAuth();
  const [categoriesOptions, setCategoriesOptions] = useState<{ value: string; label: string }[]>([]);
  const [accountsOptions, setAccountsOptions] = useState<{ value: string; label: string }[]>([]);
  const [itemData, setItemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!data?.alreadySubmitted);
  const [error, setError] = useState<string | null>(null);

  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({
    name: data?.name ?? "",
    description: data?.description ?? "",
    amount: formatCurrencyValue(data?.amount),
    type: data?.type ?? "expense",
    categoryId: data?.categoryId ?? "",
    accountId: data?.accountId ?? "",
    date: data?.date ?? getLocalIsoDate(),
  });

  useEffect(() => {
    setDefaultValues((prev) => ({
      ...prev,
      name: data?.name ?? prev.name ?? "",
      description: data?.description ?? prev.description ?? "",
      amount: formatCurrencyValue(data?.amount ?? prev.amount ?? "0"),
      type: data?.type ?? (prev.type as "income" | "expense") ?? "expense",
      categoryId: data?.categoryId ?? prev.categoryId ?? "",
      accountId: data?.accountId ?? prev.accountId ?? "",
      date: data?.date ?? prev.date ?? getLocalIsoDate(),
    }));
  }, [data]);

  useEffect(() => {
    if (data?.alreadySubmitted) {
      setIsSubmitted(true);
    }
  }, [data?.alreadySubmitted]);

  const handleError = (message: string, payload?: unknown) => {
    setError(message);
    onError?.(message, payload);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!data?.itemId) {
        setLoading(false);
        return;
      }

      if (!sessionId || !backendUser) {
        handleError("Sessão inválida. Entre novamente para continuar.");
        setLoading(false);
        return;
      }

      try {
        const [categoriesResp, accountsResp, itemResp] = await Promise.all([
          listCategories(sessionId),
          listAccounts(sessionId),
          getItemById(data.itemId, sessionId),
        ]);

        if (Array.isArray(categoriesResp) && !("error" in categoriesResp)) {
          const mapped = categoriesResp.map((cat) => ({ value: cat.id, label: cat.name }));
          setCategoriesOptions(mapped);
          setDefaultValues((prev) => ({
            ...prev,
            categoryId: prev.categoryId || mapped[0]?.value || "",
          }));
        } else if (categoriesResp && "error" in categoriesResp) {
          handleError(getErrorMessage((categoriesResp as RequestError).error) || "Erro ao carregar categorias.");
        }

        if (Array.isArray(accountsResp) && !("error" in accountsResp)) {
          const mapped = accountsResp.map((acc) => ({ value: acc.id, label: acc.name }));
          setAccountsOptions(mapped);
          setDefaultValues((prev) => ({
            ...prev,
            accountId: prev.accountId || mapped[0]?.value || "",
          }));
        } else if (accountsResp && "error" in accountsResp) {
          handleError(getErrorMessage((accountsResp as RequestError).error) || "Erro ao carregar contas.");
        }

        if (itemResp && !("error" in itemResp)) {
          setItemData(itemResp);
          setDefaultValues((prev) => ({
            ...prev,
            name: data?.name ?? itemResp.name ?? prev.name ?? "",
            description: data?.description ?? itemResp.description ?? prev.description ?? "",
            amount: formatCurrencyValue(data?.amount ?? itemResp.amount ?? prev.amount ?? "0"),
            type: data?.type ?? itemResp.type ?? (prev.type as "income" | "expense") ?? "expense",
            categoryId: data?.categoryId ?? itemResp.categoryId ?? prev.categoryId ?? "",
            accountId: data?.accountId ?? itemResp.accountId ?? prev.accountId ?? "",
            date:
              data?.date ??
              itemResp.date ??
              prev.date ??
              getLocalIsoDate(),
          }));
        } else if (itemResp && "error" in itemResp) {
          handleError(itemResp.error.message);
        }
      } catch (err) {
        const message = (err as RequestError)?.error?.message ?? "Erro ao carregar dados.";
        handleError(message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, sessionId, backendUser?.id, data?.itemId]);

  const fields = useMemo<FormField[]>(() => {
    return [
      {
        name: "name",
        label: "Nome da transação",
        type: "text",
        placeholder: "Ex: Salário, Almoço, etc.",
        required: true,
      },
      {
        name: "description",
        label: "Descrição",
        type: "textarea",
        placeholder: "Descreva a transação...",
        required: true,
      },
      {
        name: "amount",
        label: "Valor",
        type: "currency",
        placeholder: "R$ 0,00",
        required: true,
      },
      {
        name: "type",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "income", label: "Receita" },
          { value: "expense", label: "Despesa" },
        ],
      },
      {
        name: "categoryId",
        label: "Categoria",
        type: "select",
        required: true,
        options: categoriesOptions,
      },
      {
        name: "accountId",
        label: "Conta",
        type: "select",
        required: true,
        options: accountsOptions,
      },
      {
        name: "date",
        label: "Data",
        type: "date",
        required: true,
      },
    ];
  }, [accountsOptions, categoriesOptions]);

  const handleSubmit = async (values: Record<string, string>) => {
    if (!data?.itemId) {
      handleError("ID da transação não informado para atualização.", data);
      return false;
    }

    if (!sessionId || !backendUser) {
      handleError("Sessão inválida. Tente fazer login novamente.", { sessionId, backendUser });
      return false;
    }

    if (!itemData) {
      handleError("Não foi possível carregar os dados da transação.");
      return false;
    }

    const payload: any = {};
    if ((values.name ?? "") !== (itemData.name ?? "")) payload.name = values.name ?? "";
    if ((values.description ?? "") !== (itemData.description ?? "")) payload.description = values.description ?? "";

    const newAmount = parseCurrencyToNumber(values.amount);
    if (newAmount !== itemData.amount) payload.amount = newAmount;

    const newType = (values.type as "income" | "expense") ?? "expense";
    if (newType !== itemData.type) payload.type = newType;

    if ((values.categoryId ?? "") !== (itemData.categoryId ?? "")) payload.categoryId = values.categoryId ?? "";
    if ((values.accountId ?? "") !== (itemData.accountId ?? "")) payload.accountId = values.accountId ?? "";

    const newDate = values.date ?? getLocalIsoDate();
    const itemDate = itemData.date ? itemData.date.split("T")[0] : "";
    if (newDate !== itemDate) payload.date = newDate;

    if (Object.keys(payload).length === 0) {
      handleError("Nenhuma alteração detectada.");
      return false;
    }

    try {
      const resp = await updateItemAction(data.itemId, payload);

      if (resp && typeof resp === "object" && "error" in resp) {
        handleError(
          getErrorMessage((resp as RequestError).error) || "Erro ao atualizar transação.",
          resp
        );
        return false;
      }
    } catch (error) {
      handleError(getErrorMessage(error) || "Erro ao atualizar transação.", error);
      return false;
    }

    setIsSubmitted(true);
    return true;
  };

  if (loading || authLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar dados</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data?.itemId) {
    return (
      <Card className="w-full max-w-2xl border-red-500">
        <CardHeader>
          <CardTitle className="text-red-400">Erro</CardTitle>
          <CardDescription>ID do item não fornecido</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl border-emerald-500/30 bg-emerald-500/10">
        <CardHeader>
          <CardTitle className="text-emerald-200">Transação atualizada com sucesso!</CardTitle>
          <CardDescription className="text-emerald-300/80">
            {itemData?.type === "income" ? "Receita" : "Despesa"} atualizada
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <FormCard
      title="Editar transação"
      description="Revise e confirme as alterações na transação"
      fields={fields}
      submitLabel="Confirmar alterações"
      defaultFormData={defaultValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
    />
  );
};

export default EditItemForm;
