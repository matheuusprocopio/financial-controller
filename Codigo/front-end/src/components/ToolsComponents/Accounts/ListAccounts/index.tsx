"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Building2,
  DollarSign,
  FilterX,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { AccountType } from "@/types/account.type";
import BaseFormCard, {
  FormFieldConfig,
} from "@/components/ToolsComponents/Base/BaseFormCard";
import { accountFilterSchema, type AccountFilterFormData } from "@/formSchemas";
import { usePagination } from "@/hooks/usePagination";
import PaginationNumbers from "@/components/ToolsComponents/Base/Pagination/PaginationNumbers";
import PaginationControls from "@/components/ToolsComponents/Base/Pagination/PaginationControls";
import { RequestError } from "@/utils/requestProvider";

interface IAccountsList {
  data: {
    error?: RequestError;
    nickname: string;
    accounts: AccountType[];
    totalOfAccounts: number;
    currentPage?: number;
    pageLimit?: number;
  };
  onError?(errMsg: string, payload?: unknown): void;
}

const AccountsList = ({ data, onError }: IAccountsList) => {
  const accountNickname = data?.nickname ?? "";
  const accounts = useMemo(() => data?.accounts ?? [], [data?.accounts]);
  const totalOfAccounts = data?.totalOfAccounts ?? 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [accountsData, setAccountsData] = useState<AccountType[]>(accounts);
  const [totalItems, setTotalItems] = useState<number>(totalOfAccounts);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AccountFilterFormData>({
    nickname: "",
    financial_institution: "",
  });
  const hasMounted = useRef(false);

  const pagination = usePagination({
    totalItems,
    initialPage: data?.currentPage ?? 1,
    initialItemsPerPage: data?.pageLimit ?? 10,
  });

  const { resetPage } = pagination;

  useEffect(() => {
    setSearchTerm(accountNickname || "");
  }, [accountNickname]);

  useEffect(() => {
    setAccountsData(accounts);
    setTotalItems(totalOfAccounts);
  }, [accounts, totalOfAccounts]);

  const filteredAccounts = useMemo(() => {
    let filtered = [...accountsData];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (account) =>
          account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.financialInstitution
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.nickname && activeFilters.nickname.trim()) {
      const nicknameFilter = activeFilters.nickname.toLowerCase().trim();
      filtered = filtered.filter((account) =>
        account.name.toLowerCase().includes(nicknameFilter)
      );
    }

    if (
      activeFilters.financial_institution &&
      activeFilters.financial_institution.trim()
    ) {
      const institutionFilter = activeFilters.financial_institution
        .toLowerCase()
        .trim();
      filtered = filtered.filter((account) =>
        account.financialInstitution.toLowerCase().includes(institutionFilter)
      );
    }

    return filtered;
  }, [accountsData, searchTerm, activeFilters]);

  useEffect(() => {
    resetPage();
  }, [searchTerm, activeFilters, resetPage]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-emerald-400";
    if (balance < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  const getBalanceBadgeVariant = (balance: number) => {
    if (balance > 0) return "default";
    if (balance < 0) return "destructive";
    return "secondary";
  };

  const filterFields: FormFieldConfig[] = [
    {
      name: "nickname",
      label: "Nome da Conta",
      type: "text",
      placeholder: "Digite o nome da conta...",
      description: "Filtre contas pelo apelido ou nome",
    },
    {
      name: "financial_institution",
      label: "Instituição Financeira",
      type: "text",
      placeholder: "Digite a instituição financeira...",
      description: "Filtre contas pela instituição financeira",
    },
  ];

  const handleAdvancedFilter = (filterData: AccountFilterFormData) => {
    setActiveFilters(filterData);
    setShowAdvancedFilter(false);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({
      nickname: "",
      financial_institution: "",
    });
    setShowAdvancedFilter(false);
  };

  const hasActiveFilters =
    searchTerm.trim() ||
    (activeFilters.nickname && activeFilters.nickname.trim()) ||
    (activeFilters.financial_institution &&
      activeFilters.financial_institution.trim());

  const paginatedAccounts = filteredAccounts;

  const handlePaginationChange = async (
    page?: number,
    itemsPerPage?: number
  ) => {
    const newPage = page ?? pagination.currentPage;
    const newItemsPerPage = itemsPerPage ?? pagination.itemsPerPage;
    const targetPage = itemsPerPage ? 1 : newPage;
    const semanticalSearch = searchTerm.trim()
      ? `&semantical_search=${encodeURIComponent(searchTerm.trim())}`
      : "";

    try {
      const response = await fetch(
        `/api/pagination/accounts?page=${targetPage}&size=${newItemsPerPage}${semanticalSearch}`
      );

      const result = await response.json();

      if (!response.ok || "error" in result) {
        const errorMessage =
          (result as RequestError)?.error?.message ||
          "Erro ao buscar contas.";
        onError?.(errorMessage, result);
        return;
      }

      setAccountsData(result.data);
      setTotalItems((prev) => result.totalItems ?? prev);

      if (itemsPerPage) {
        pagination.setItemsPerPage(newItemsPerPage);
        pagination.resetPage();
      } else if (page) {
        pagination.setCurrentPage(newPage);
      }
    } catch (error) {
      onError?.("Erro ao buscar contas. Tente novamente.", error);
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      handlePaginationChange(1);
    }, 2000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <Card className={cn("w-full max-w-none")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Lista de contas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_auto_auto] gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar contas..."
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
              description="Use os campos abaixo para filtrar as contas por critérios específicos"
              fields={filterFields}
              submitLabel="Aplicar Filtros"
              onSubmit={handleAdvancedFilter}
              onCancel={() => setShowAdvancedFilter(false)}
              cancelLabel="Cancelar"
              defaultFormData={activeFilters}
              validationSchema={accountFilterSchema}
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Busca: &ldquo;{searchTerm}&rdquo;
              </Badge>
            )}
            {activeFilters.nickname && activeFilters.nickname.trim() && (
              <Badge variant="secondary" className="text-xs">
                Nome: &ldquo;{activeFilters.nickname}&rdquo;
              </Badge>
            )}
            {activeFilters.financial_institution &&
              activeFilters.financial_institution.trim() && (
                <Badge variant="secondary" className="text-xs">
                  Instituição: &ldquo;
                  {activeFilters.financial_institution}&rdquo;
                </Badge>
              )}
          </div>
        )}

        <div className="rounded-md border w-full overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Apelido</TableHead>
                <TableHead className="min-w-[200px]">Instituição</TableHead>
                <TableHead className="min-w-[120px]">Saldo</TableHead>
                <TableHead className="min-w-[100px]">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {hasActiveFilters
                      ? "Nenhuma conta encontrada com os filtros aplicados"
                      : "Nenhuma conta encontrada"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {account.financialInstitution}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className={getBalanceColor(account.balance)}>
                          {formatCurrency(account.balance)}
                        </span>
                        <Badge
                          variant={getBalanceBadgeVariant(account.balance)}
                          className="text-xs"
                        >
                          {account.balance > 0
                            ? "Positivo"
                            : account.balance < 0
                            ? "Negativo"
                            : "Zero"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(account.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredAccounts.length > 0 && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-4">
            <PaginationControls
              itemsPerPage={pagination.itemsPerPage}
              onItemsPerPageChange={(value) =>
                handlePaginationChange(undefined, Number(value))
              }
              currentPage={pagination.currentPage}
              totalItems={totalItems}
              showBalance={totalItems > 0}
              totalBalance={accountsData.reduce(
                (sum: number, account: { balance: number }) =>
                  sum + account.balance,
                0
              )}
              formatCurrency={formatCurrency}
            />

            {pagination.totalPages > 1 && (
              <PaginationNumbers
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => handlePaginationChange(page)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsList;
