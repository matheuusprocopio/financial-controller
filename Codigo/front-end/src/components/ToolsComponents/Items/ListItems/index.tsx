"use client";

import { useEffect, useState, useCallback } from "react";
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

interface IItemsList {
  data: {
    name?: string;
    items?: ItemType[];
    totalOfItems?: number;
    data?: ItemType[];
    totalItems?: number;
    currentPage?: number;
    pageLimit?: number;
  };
}

const ItemsList = ({ data: initialData }: IItemsList) => {
  const [items, setItems] = useState<ItemType[]>([]);
  const [totalOfItems, setTotalOfItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialData?.name ?? "");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ItemFilterFormData>({
    name: "",
    categoryId: "",
    accountId: "",
    type: undefined,
    dateRange: undefined,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar items do back-end
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const params = new URLSearchParams();
      const nameFilter = searchTerm.trim() || activeFilters.name?.trim();
      if (nameFilter) params.set("name", nameFilter);
      if (activeFilters.type) params.set("type", activeFilters.type);
      if (activeFilters.categoryId) params.set("categoryId", activeFilters.categoryId);
      if (activeFilters.accountId) params.set("accountId", activeFilters.accountId);

      const startDate =
        activeFilters.dateRange?.from?.toISOString().split("T")[0] ??
        thirtyDaysAgo.toISOString().split("T")[0];
      const endDate =
        activeFilters.dateRange?.to?.toISOString().split("T")[0] ??
        today.toISOString().split("T")[0];

      params.set("startDate", startDate);
      params.set("endDate", endDate);

      const response = await fetch(`/api/pagination/items?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || (result && result.error)) {
        const message =
          result?.error?.message ||
          "Erro ao carregar itens.";
        setItems([]);
        setTotalOfItems(0);
        setError(message);
        return;
      }

      if (result && !result.error) {
        setItems(result.data ?? []);
        setTotalOfItems(result.totalItems ?? 0);
      }
    } catch (error) {
      const message = (error as RequestError)?.error?.message ?? "Erro ao carregar itens.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilters]);

  // Carrega dados iniciais APENAS UMA VEZ
  useEffect(() => {
    const initialItems = initialData?.items || initialData?.data || [];
    const initialTotal = initialData?.totalOfItems || initialData?.totalItems || 0;
    
    if (initialItems.length > 0) {
      setItems(initialItems);
      setTotalOfItems(initialTotal);
      setIsInitialized(true);
    } else {
      fetchItems().then(() => setIsInitialized(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarrega quando searchTerm muda (com debounce) - APENAS APÓS INICIALIZAÇÃO
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Monitora mudanças nos filtros avançados - APENAS APÓS INICIALIZAÇÃO
  useEffect(() => {
    if (!isInitialized) return;
    
    // Sempre busca ao mudar filtros (inclusive ao limpar)
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTypeColor = (type: string) => {
    return type === "income" ? "text-green-600" : "text-red-600";
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

  const filterFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "Nome da Transação",
      type: "text",
      placeholder: "Digite o nome da transação...",
      description: "Filtre transações pelo nome",
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
  ];

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

  const hasActiveFilters =
    searchTerm.trim() ||
    (activeFilters.name && activeFilters.name.trim()) ||
    activeFilters.type ||
    activeFilters.dateRange;

  const totalIncome = items
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = items
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

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
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Receitas</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Despesas</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2",
            balance >= 0 ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"
          )}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className={cn("h-5 w-5", balance >= 0 ? "text-green-600" : "text-red-600")} />
                <div>
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className={cn("text-lg font-bold", balance >= 0 ? "text-green-600" : "text-red-600")}>
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
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span>
              Mostrando {items.length} de {totalOfItems} transações
              {hasActiveFilters && " (filtradas)"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemsList;
