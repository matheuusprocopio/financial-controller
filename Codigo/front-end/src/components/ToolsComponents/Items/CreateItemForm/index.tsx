"use client";

import { useEffect, useMemo, useState } from "react";
import { createItemAction } from "@/actions/item";
import FormCard, { type FormField } from "@/components/chat/gen-ui/FormCard";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { listCategories } from "@/utils/services/categories";
import { listAccounts } from "@/utils/services/accounts";
import { RequestError } from "@/utils/requestProvider";
import { getErrorMessage } from "@/utils/errors";
import { formatCurrencyValue, parseCurrencyToNumber } from "@/utils/currency";
import { CategorieType } from "@/types/categorie.type";

interface ICreateItemForm {
  data: {
    name?: string;
    description?: string;
    amount?: number;
    date?: string;
    type?: "income" | "expense";
    categoryId?: string;
    accountId?: string;
    suggestedCategoryName?: string;
    suggestedAccountName?: string;
    categories?: CategorieType[];
    alreadySubmitted?: boolean;
  };
  onError?(errMsg: string, payload?: unknown): void;
  onSubmitted?(): void;
}

const CreateItemForm = ({ data, onError, onSubmitted }: ICreateItemForm) => {
  const { sessionId, backendUser, loading: authLoading } = useAuth();
  const [categoriesOptions, setCategoriesOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [accountsOptions, setAccountsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({
    name: data?.name ?? "",
    description: data?.description ?? "",
    amount: formatCurrencyValue(data?.amount),
    date: data?.date ?? new Date().toISOString().split("T")[0],
    type: data?.type ?? "expense",
    categoryId: data?.categoryId ?? data?.categories?.[0]?.id ?? "",
    accountId: data?.accountId ?? "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!data?.alreadySubmitted);
  const [lastSubmittedData, setLastSubmittedData] = useState<{
    amount: number;
    name: string;
    type: "income" | "expense";
  } | null>(null);

  useEffect(() => {
    setDefaultValues((prev) => ({
      ...prev,
      name: data?.name ?? "",
      description: data?.description ?? "",
      amount: formatCurrencyValue(
        data?.amount ?? prev.amount ?? "0"
      ),
      date: data?.date ?? prev.date ?? new Date().toISOString().split("T")[0],
      type: data?.type ?? (prev.type as "income" | "expense") ?? "expense",
      categoryId: data?.categoryId ?? prev.categoryId ?? data?.categories?.[0]?.id ?? "",
      accountId: data?.accountId ?? prev.accountId ?? "",
    }));
  }, [data]);

  useEffect(() => {
    if (data?.alreadySubmitted) {
      setIsSubmitted(true);
      setLastSubmittedData({
        amount: data?.amount ?? 0,
        name: data?.name ?? "Transação",
        type: data?.type ?? "expense",
      });
    }
  }, [data?.alreadySubmitted, data?.amount, data?.name, data?.type]);

  const handleError = (message: string, payload?: unknown) => {
    setError(message);
    onError?.(message, payload);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId || !backendUser) {
        handleError("Sessão inválida. Entre novamente para continuar.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const shouldFetchCategories = !(data?.categories && data.categories.length > 0);
        const categoriesResult: CategorieType[] | RequestError =
          shouldFetchCategories
            ? await listCategories(sessionId, undefined, data?.suggestedCategoryName || data?.name)
            : data?.categories ?? [];
        const accountsResp = await listAccounts(sessionId);

        if (Array.isArray(categoriesResult)) {
          setCategoriesOptions(
            categoriesResult.map((cat) => ({ value: cat.id, label: cat.name }))
          );
          setDefaultValues((prev) => ({
            ...prev,
            categoryId: prev.categoryId || data?.categoryId || categoriesResult[0]?.id || "",
          }));
        } else if (categoriesResult && "error" in categoriesResult) {
          handleError(getErrorMessage((categoriesResult as RequestError).error) || "Erro ao carregar categorias.");
        }

        if (
          accountsResp &&
          !("error" in accountsResp) &&
          Array.isArray(accountsResp)
        ) {
          setAccountsOptions(
            accountsResp.map((account) => ({
              value: account.id,
              label: account.name,
            }))
          );
          setDefaultValues((prev) => ({
            ...prev,
            accountId: prev.accountId || accountsResp[0]?.id || "",
          }));
        } else if (accountsResp && "error" in accountsResp) {
          handleError(getErrorMessage((accountsResp as RequestError).error) || "Erro ao carregar contas.");
        }
      } catch (err) {
        const message =
          (err as RequestError)?.error?.message ?? "Erro ao carregar dados.";
        handleError(message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, sessionId, backendUser?.id]);

  const fields = useMemo<FormField[]>(() => {
    const categoryDescription = data?.suggestedCategoryName
      ? `Sugestão: ${data.suggestedCategoryName}`
      : undefined;
    const accountDescription = data?.suggestedAccountName
      ? `Sugestão: ${data.suggestedAccountName}`
      : undefined;

    return [
      {
        name: "name",
        label: "Nome da transação",
        type: "text",
        placeholder: "Ex: Almoço, Uber, Salário...",
        required: true,
      },
      {
        name: "description",
        label: "Descrição",
        type: "textarea",
        placeholder: "Detalhes da transação...",
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
          { value: "expense", label: "Despesa" },
          { value: "income", label: "Receita" },
        ],
      },
      {
        name: "categoryId",
        label: "Categoria",
        type: "select",
        required: true,
        options: categoriesOptions,
        description: categoryDescription,
      },
      {
        name: "accountId",
        label: "Conta",
        type: "select",
        required: true,
        options: accountsOptions,
        description: accountDescription,
      },
      {
        name: "date",
        label: "Data",
        type: "date",
        required: true,
      },
    ];
  }, [
    accountsOptions,
    categoriesOptions,
    data?.suggestedAccountName,
    data?.suggestedCategoryName,
  ]);

const handleSubmit = async (values: Record<string, string>) => {
    setError(null);

    if (!sessionId || !backendUser) {
      handleError("Sessão inválida. Tente fazer login novamente.", {
        sessionId,
        backendUser,
      });
      return false;
    }

    try {
      const resp = await createItemAction({
        name: values.name ?? "",
        description: values.description ?? "",
        amount: parseCurrencyToNumber(values.amount),
        type: (values.type as "income" | "expense") ?? "expense",
        categoryId: values.categoryId ?? "",
        accountId: values.accountId ?? "",
        date: values.date ?? new Date().toISOString().split("T")[0],
        userId: backendUser.id,
      });

      if (resp && typeof resp === "object" && "error" in resp) {
        handleError(
          getErrorMessage((resp as RequestError).error) || "Erro ao criar transação.",
          resp
        );
        return false;
      }
    } catch (error) {
      handleError(getErrorMessage(error) || "Erro ao criar transação.", error);
      return false;
    }

    setLastSubmittedData({
      amount: parseCurrencyToNumber(values.amount),
      name: values.name ?? "",
      type: (values.type as "income" | "expense") ?? "expense",
    });
    setIsSubmitted(true);
    return true;
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <div className="text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted && lastSubmittedData) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-emerald-200 font-medium">
              {lastSubmittedData.type === "income" ? "Receita" : "Despesa"}{" "}
              adicionada com sucesso!
            </div>
            <div className="text-sm text-emerald-300/80 mt-1">
              R$ {lastSubmittedData.amount.toFixed(2)} - {lastSubmittedData.name}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormCard
      title="✨ Confirmar Transação"
      description="A IA preencheu automaticamente. Revise e confirme ou ajuste conforme necessário."
      fields={fields}
      submitLabel="Confirmar e adicionar"
      defaultFormData={defaultValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
    />
  );
};

export default CreateItemForm;
