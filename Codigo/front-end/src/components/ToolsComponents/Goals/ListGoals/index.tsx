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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Trophy, Search, FilterX, RefreshCw } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { GoalType } from "@/types/goal.types";
import { AccountType } from "@/types/account.type";
import { usePagination } from "@/hooks/usePagination";
import PaginationNumbers from "@/components/ToolsComponents/Base/Pagination/PaginationNumbers";
import PaginationControls from "@/components/ToolsComponents/Base/Pagination/PaginationControls";
import type { RequestError } from "@/utils/requestProvider";

type StatusFilter = "all" | "achieved" | "pending";
type GoalFilterAccount = Pick<AccountType, "id" | "name" | "financialInstitution">;

const ALL_ACCOUNTS_VALUE = "all";
const GLOBAL_ACCOUNT_VALUE = "global";

const normalizeAccountFilterValue = (value?: string | null) => {
  if (!value) {
    return ALL_ACCOUNTS_VALUE;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : ALL_ACCOUNTS_VALUE;
};

interface IGoalsList {
  data: {
    title?: string;
    goals?: GoalType[];
    totalOfGoals?: number;
    currentPage?: number;
    pageLimit?: number;
    accountId?: string | null;
    status?: StatusFilter;
    accounts?: GoalFilterAccount[];
    error?: string | RequestError;
  };
  onError?(errMsg: string): void;
}

const GoalsList = ({ data, onError }: IGoalsList) => {
  const initialGoals = useMemo(() => data?.goals ?? [], [data?.goals]);
  const normalizedAccounts = useMemo<GoalFilterAccount[]>(() => {
    return (data?.accounts ?? []).map((account) => ({
      id: account.id,
      name: account.name,
      financialInstitution: account.financialInstitution,
    }));
  }, [data?.accounts]);
  const [goalsData, setGoalsData] = useState<GoalType[]>(initialGoals);
  const [availableAccounts, setAvailableAccounts] =
    useState<GoalFilterAccount[]>(normalizedAccounts);
  const [totalItems, setTotalItems] = useState<number>(
    data?.totalOfGoals ?? initialGoals.length
  );
  const [searchInput, setSearchInput] = useState(data?.title ?? "");
  const [accountFilter, setAccountFilter] = useState<string>(
    normalizeAccountFilterValue(data?.accountId)
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    data?.status ?? "all"
  );
  const [isLoading, setIsLoading] = useState(false);
  const hasRequestedAccountsFallback = useRef(false);
  const hasProvidedAccounts = normalizedAccounts.length > 0;

  const paginationState = usePagination({
    totalItems,
    initialPage: data?.currentPage ?? 1,
    initialItemsPerPage: data?.pageLimit ?? 10,
  });

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
  } = paginationState;

  useEffect(() => {
    setGoalsData(initialGoals);
    setTotalItems(data?.totalOfGoals ?? initialGoals.length);
  }, [initialGoals, data?.totalOfGoals]);

  useEffect(() => {
    setAvailableAccounts(normalizedAccounts);
  }, [normalizedAccounts]);

  useEffect(() => {
    setAccountFilter(normalizeAccountFilterValue(data?.accountId));
  }, [data?.accountId]);

  useEffect(() => {
    setStatusFilter(data?.status ?? "all");
  }, [data?.status]);

  useEffect(() => {
    if (data?.error) {
      const message =
        typeof data.error === "string"
          ? data.error
          : data.error.error?.message || "Erro ao carregar metas.";
      onError?.(message);
    }
  }, [data?.error, onError]);

  useEffect(() => {
    if (hasProvidedAccounts || hasRequestedAccountsFallback.current) {
      return;
    }

    let isMounted = true;
    hasRequestedAccountsFallback.current = true;

    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/pagination/accounts?page=1&size=50");
        const payload = await response.json();

        if (!response.ok || "error" in payload) {
          const message =
            (payload as RequestError)?.error?.message ||
            "Erro ao carregar contas.";
          onError?.(message);
          hasRequestedAccountsFallback.current = false;
          return;
        }

        if (!isMounted) {
          return;
        }

        const normalized = (payload?.data ?? []).map((account: AccountType) => ({
          id: account.id,
          name: account.name,
          financialInstitution: account.financialInstitution,
        }));

        setAvailableAccounts(normalized);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "Erro ao buscar contas para o filtro de metas.",
            error
          );
        }
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao carregar contas.";
        onError?.(message);
        hasRequestedAccountsFallback.current = false;
      }
    };

    void fetchAccounts();

    return () => {
      isMounted = false;
    };
  }, [hasProvidedAccounts, onError]);

  const buildQueryParams = useCallback(
    (page: number, size: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));

      if (searchInput.trim()) {
        params.set("semantical_search", searchInput.trim());
      }

      if (accountFilter !== ALL_ACCOUNTS_VALUE) {
        params.set("accountId", accountFilter);
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      return params.toString();
    },
    [searchInput, accountFilter, statusFilter]
  );

  const fetchGoals = useCallback(
    async (page: number, size: number) => {
      try {
        setIsLoading(true);
        const query = buildQueryParams(page, size);
        const response = await fetch(`/api/pagination/goals?${query}`);
        const result = await response.json();

        if (!response.ok || "error" in result) {
          const message =
            (result as RequestError)?.error?.message || "Erro ao buscar metas.";
          onError?.(message);
          return;
        }

        setGoalsData(result.data ?? []);
        setTotalItems(result.totalItems ?? 0);
        setItemsPerPage(size);
        setCurrentPage(page);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao buscar metas. Tente novamente.";
        onError?.(message);
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryParams, onError, setItemsPerPage, setCurrentPage]
  );

  const handleApplyFilters = async () => {
    await fetchGoals(1, itemsPerPage);
  };

  const handleClearFilters = async () => {
    setSearchInput("");
    setAccountFilter(ALL_ACCOUNTS_VALUE);
    setStatusFilter("all");
    await fetchGoals(1, itemsPerPage);
  };

  const handlePaginationChange = async (
    page?: number,
    nextItemsPerPage?: number
  ) => {
    const targetPage = nextItemsPerPage ? 1 : page ?? currentPage;
    const size = nextItemsPerPage ?? itemsPerPage;
    await fetchGoals(targetPage, size);
  };

  const hasActiveFilters =
    !!searchInput.trim() || accountFilter !== ALL_ACCOUNTS_VALUE || statusFilter !== "all";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatProgress = (goal: GoalType) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, Number(percentage.toFixed(2))));
  };

  const accountOptions = useMemo(
    () => [
      { value: ALL_ACCOUNTS_VALUE, label: "Todas as contas" },
      { value: GLOBAL_ACCOUNT_VALUE, label: "Meta global (sem conta)" },
      ...availableAccounts
        .filter((account) => account.id !== GLOBAL_ACCOUNT_VALUE)
        .map((account) => ({
          value: account.id,
          label: account.financialInstitution
            ? `${account.name} - ${account.financialInstitution}`
            : account.name,
        })),
    ],
    [availableAccounts]
  );

  const resolveAccountLabel = useCallback(
    (value: string) => {
      if (value === ALL_ACCOUNTS_VALUE) {
        return "Todas as contas";
      }

      if (value === GLOBAL_ACCOUNT_VALUE) {
        return "Meta global (sem conta)";
      }

      const match = availableAccounts.find((account) => account.id === value);
      if (!match) {
        return value;
      }

      return match.financialInstitution
        ? `${match.name} - ${match.financialInstitution}`
        : match.name;
    },
    [availableAccounts]
  );

  return (
    <Card className={cn("w-full max-w-none")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Metas financeiras
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título da meta..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Em andamento</SelectItem>
                <SelectItem value="achieved">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select
            value={accountFilter}
            onValueChange={(value) => setAccountFilter(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por conta" />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Aplicar filtros
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <FilterX className="h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchInput && (
              <Badge variant="secondary" className="text-xs">
                Busca: {`"${searchInput}"`}
              </Badge>
            )}
            {accountFilter !== ALL_ACCOUNTS_VALUE && (
              <Badge variant="secondary" className="text-xs">
                Conta: {resolveAccountLabel(accountFilter)}
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {statusFilter === "achieved" ? "Concluídas" : "Em andamento"}
              </Badge>
            )}
          </div>
        )}

        <div className="rounded-md border w-full overflow-x-auto">
          <Table className="w-full min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Título</TableHead>
                <TableHead className="min-w-[180px]">Conta vinculada</TableHead>
                <TableHead className="min-w-[200px]">Progresso</TableHead>
                <TableHead className="min-w-[120px]">Meta</TableHead>
                <TableHead className="min-w-[120px]">Prazo</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goalsData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {isLoading
                      ? "Carregando metas..."
                      : "Nenhuma meta encontrada"}
                  </TableCell>
                </TableRow>
              ) : (
                goalsData.map((goal) => {
                  const progress = formatProgress(goal);
                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          {goal.title}
                          {goal.description && (
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {goal.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {goal.accountId ? goal.accountId : "Meta global"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(goal.targetAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {goal.deadline ? formatDate(goal.deadline) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={goal.achieved ? "default" : "outline"}
                          className={
                            goal.achieved ? "bg-green-600 text-white" : ""
                          }
                        >
                          {goal.achieved ? "Concluída" : "Em andamento"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {goalsData.length > 0 && (
          <div className="flex flex-col gap-4">
            <PaginationControls
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) =>
                handlePaginationChange(undefined, Number(value))
              }
              currentPage={currentPage}
              totalItems={totalItems}
              showBalance={false}
            />

            {totalPages > 1 && (
              <PaginationNumbers
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => handlePaginationChange(page)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsList;
