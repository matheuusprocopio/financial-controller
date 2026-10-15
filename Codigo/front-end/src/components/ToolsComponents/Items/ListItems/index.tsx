"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FilterX,
  Calendar,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ItemType } from "@/types/item.type";
import BaseFormCard, {
  FormFieldConfig,
} from "@/components/ToolsComponents/Base/BaseFormCard";
import { itemFilterSchema, type ItemFilterFormData } from "@/formSchemas";
import { RequestError } from "@/utils/requestProvider";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ToolsComponents/Base/Pagination/PaginationControls";
import PaginationNumbers from "@/components/ToolsComponents/Base/Pagination/PaginationNumbers";

interface IItemsList {
  data: {
    error?: RequestError;
    name?: string;
    items?: ItemType[];
    totalOfItems?: number;
    data?: ItemType[];
    totalItems?: number;
    currentPage?: number;
    pageLimit?: number;
    categoryId?: string;
    accountId?: string;
  };
  onError?(errMsg: string, payload?: unknown): void;
}

const ItemsList = ({ data: initialData, onError }: IItemsList) => {
  const hydratedItems = useMemo(
    () => initialData?.items ?? initialData?.data ?? [],
    [initialData?.items, initialData?.data]
  );
  const hydratedTotal =
    initialData?.totalOfItems ?? initialData?.totalItems ?? hydratedItems.length;

  const [items, setItems] = useState<ItemType[]>(hydratedItems);
  const [totalOfItems, setTotalOfItems] = useState<number>(hydratedTotal);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialData?.name ?? "");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [accountOptions, setAccountOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [activeFilters, setActiveFilters] = useState<ItemFilterFormData>({
    name: "",
    categoryId: initialData?.categoryId ?? "",
    accountId: initialData?.accountId ?? "",
    type: undefined,
    dateRange: undefined,
  });
  const [error, setError] = useState<string | null>(
    initialData?.error?.error?.message ?? null
  );
  const hasMounted = useRef(false);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    resetPage,
  } = usePagination({
    totalItems: totalOfItems,
    initialPage: initialData?.currentPage ?? 1,
    initialItemsPerPage: initialData?.pageLimit ?? 10,
  });

  useEffect(() => {
    setSearchTerm(initialData?.name ?? "");
  }, [initialData?.name]);

  useEffect(() => {
    setItems(hydratedItems);
    setTotalOfItems(hydratedTotal);
  }, [hydratedItems, hydratedTotal]);

  useEffect(() => {
    if (!initialData?.categoryId && !initialData?.accountId) return;

    setActiveFilters((prev) => ({
      ...prev,
      categoryId: initialData?.categoryId ?? prev.categoryId,
      accountId: initialData?.accountId ?? prev.accountId,
    }));
  }, [initialData?.categoryId, initialData?.accountId]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesResp, accountsResp] = await Promise.all([
          fetch("/api/pagination/categories?page=1&size=50"),
          fetch("/api/pagination/accounts?page=1&size=50"),
        ]);

        if (categoriesResp.ok) {
          const json = await categoriesResp.json();
          const categories = json?.data ?? [];
          setCategoryOptions(
            categories.map((cat: { id: string; name: string }) => ({
              value: cat.id,
              label: cat.name,
            }))
          );
        }

        if (accountsResp.ok) {
          const json = await accountsResp.json();
          const accounts = json?.data ?? [];
          setAccountOptions(
            accounts.map((acc: { id: string; name: string; nickname?: string }) => ({
              value: acc.id,
              label: acc.nickname || acc.name,
            }))
          );
        }
      } catch (err) {
        console.warn("Não foi possível carregar filtros de conta/categoria.", err);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (!initialData?.error) return;
    const message =
      initialData.error.error?.message ?? "Erro ao carregar itens.";
    setError(message);
    onError?.(message, initialData.error);
  }, [initialData?.error, onError]);

  const notifyError = useCallback(
    (message: string, payload?: unknown) => {
      setError(message);
      onError?.(message, payload);
    },
    [onError]
  );

  const hasActiveFilters =
    !!searchTerm.trim() ||
    !!(activeFilters.name && activeFilters.name.trim()) ||
    !!(activeFilters.categoryId && activeFilters.categoryId.trim()) ||
    !!(activeFilters.accountId && activeFilters.accountId.trim()) ||
    !!activeFilters.type ||
    !!activeFilters.dateRange;

  const fetchItems = useCallback(
    async (page?: number, itemsPerPageOverride?: number) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const targetPage = itemsPerPageOverride ? 1 : page ?? currentPage;
      const limit = itemsPerPageOverride ?? itemsPerPage;

      params.set("page", targetPage.toString());
      params.set("pageLimit", limit.toString());

      const semanticQuery = searchTerm.trim();
      const nameFilter = activeFilters.name?.trim();
      if (semanticQuery) {
        params.set("semantical_search", semanticQuery);
      } else if (nameFilter) {
        params.set("name", nameFilter);
      }

      if (activeFilters.type) params.set("type", activeFilters.type);
      if (activeFilters.categoryId) params.set("category_id", activeFilters.categoryId);
      if (activeFilters.accountId) params.set("account_id", activeFilters.accountId);

      const startDate = activeFilters.dateRange?.from
        ? activeFilters.dateRange.from.toISOString().split("T")[0]
        : undefined;
      const endDate = activeFilters.dateRange?.to
        ? activeFilters.dateRange.to.toISOString().split("T")[0]
        : undefined;

      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      try {
        const response = await fetch(`/api/pagination/items?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || (result && result.error)) {
          const message = result?.error?.message ?? "Erro ao carregar itens.";
          notifyError(message, result);
          setItems([]);
          setTotalOfItems(0);
          return;
        }

        setItems(result.data ?? []);
        setTotalOfItems(result.totalItems ?? result.data?.length ?? 0);

        if (itemsPerPageOverride) {
          setItemsPerPage(limit);
          resetPage();
        } else if (page) {
          setCurrentPage(targetPage);
        }
      } catch (fetchError) {
        const message =
          (fetchError as RequestError)?.error?.message ?? "Erro ao carregar itens.";
        notifyError(message, fetchError);
        setItems([]);
        setTotalOfItems(0);
      } finally {
        setLoading(false);
      }
    },
    [
      activeFilters,
      currentPage,
      itemsPerPage,
      notifyError,
      resetPage,
      searchTerm,
      setCurrentPage,
      setItemsPerPage,
    ]
  );

  useEffect(() => {
    if (hasMounted.current) return;

    if (hasActiveFilters) {
      fetchItems(1);
    }
  }, [fetchItems, hasActiveFilters]);

  useEffect(() => {
    if (!hasMounted.current) return;
    if (!searchTerm.trim()) return;

    const timer = setTimeout(() => {
      fetchItems(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fetchItems, searchTerm]);

  useEffect(() => {
    if (!hasMounted.current) return;
    fetchItems(1);
  }, [activeFilters, fetchItems]);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTypeColor = (type: string) => {
    return type === "income" ? "text-emerald-400" : "text-red-400";
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "income" ? "default" : "destructive";
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "Receita" : "Despesa";
  };

  const getTypeIcon = (type: string) => {
    return type === "income" ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const filterFields: FormFieldConfig[] = useMemo(
    () => [
      {
        name: "name",
        label: "Nome da Transação",
        type: "text",
        placeholder: "Digite o nome da transação...",
        description: "Filtre transações pelo nome",
      },
      {
        name: "categoryId",
        label: "Categoria",
        type: "select",
        placeholder: "Selecione a categoria...",
        description: "Filtre transações por categoria",
        options: categoryOptions,
      },
      {
        name: "accountId",
        label: "Conta",
        type: "select",
        placeholder: "Selecione a conta...",
        description: "Filtre transações por conta",
        options: accountOptions,
      },
      {
        name: "type",
        label: "Tipo",
        type: "select",
        placeholder: "Selecione o tipo...",
        description: "Filtre por tipo de transação",
        options: [
          { value: "income", label: "Receita" },
          { value: "expense", label: "Despesa" },
        ],
      },
      {
        name: "dateRange",
        label: "Período",
        type: "dateRange",
        placeholder: "Selecione um período",
        description: "Filtre transações por período",
      },
    ],
    [accountOptions, categoryOptions]
  );

  const handleAdvancedFilter = (filterData: ItemFilterFormData) => {
    setActiveFilters(filterData);
    setShowAdvancedFilter(false);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({
      name: "",
      categoryId: "",
      accountId: "",
      type: undefined,
      dateRange: undefined,
    });
    setShowAdvancedFilter(false);
    // O useEffect vai disparar automaticamente e buscar os dados
  };

  const totalIncome = useMemo(
    () =>
      items
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),
    [items]
  );

  const totalExpense = useMemo(
    () =>
      items
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),
    [items]
  );

  const balance = totalIncome - totalExpense;

  return (
    <Card className={cn("w-full max-w-none")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Lista de transações
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_auto_auto] gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="px-3"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros Avançados
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="px-3"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {showAdvancedFilter && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <BaseFormCard
              title="Filtros Avançados"
              description="Use os campos abaixo para filtrar as transações por critérios específicos"
              fields={filterFields}
              submitLabel="Aplicar Filtros"
              onSubmit={handleAdvancedFilter}
              onCancel={() => setShowAdvancedFilter(false)}
              cancelLabel="Cancelar"
              defaultFormData={activeFilters}
              validationSchema={itemFilterSchema}
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Busca: &ldquo;{searchTerm}&rdquo;
              </Badge>
            )}
            {activeFilters.name && activeFilters.name.trim() && (
              <Badge variant="secondary" className="text-xs">
                Nome: &ldquo;{activeFilters.name}&rdquo;
              </Badge>
            )}
            {activeFilters.type && (
              <Badge variant="secondary" className="text-xs">
                Tipo: {getTypeLabel(activeFilters.type)}
              </Badge>
            )}
            {activeFilters.dateRange && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Período selecionado
              </Badge>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Receitas</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Despesas</p>
                  <p className="text-lg font-bold text-red-400">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className={cn("h-5 w-5", balance >= 0 ? "text-emerald-400" : "text-red-400")} />
                <div>
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className={cn("text-lg font-bold", balance >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="rounded-md border w-full overflow-x-auto">
            <Table className="w-full min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Nome</TableHead>
                  <TableHead className="min-w-[200px]">Descrição</TableHead>
                  <TableHead className="min-w-[120px]">Valor</TableHead>
                  <TableHead className="min-w-[100px]">Tipo</TableHead>
                  <TableHead className="min-w-[120px]">Data</TableHead>
               </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {hasActiveFilters
                        ? "Nenhuma transação encontrada com os filtros aplicados"
                        : "Nenhuma transação encontrada"}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getTypeColor(item.type)}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getTypeBadgeVariant(item.type)}
                          className="text-xs flex items-center gap-1 w-fit"
                        >
                          {getTypeIcon(item.type)}
                          {getTypeLabel(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.date)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-4 pt-2">
            <PaginationControls
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => fetchItems(undefined, Number(value))}
              currentPage={currentPage}
              totalItems={totalOfItems}
            />

            {totalPages > 1 && (
              <PaginationNumbers
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchItems(page)}
              />
            )}

            <div className="text-sm text-muted-foreground">
              Mostrando {items.length} de {totalOfItems} transações
              {hasActiveFilters && " (filtradas)"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemsList;
