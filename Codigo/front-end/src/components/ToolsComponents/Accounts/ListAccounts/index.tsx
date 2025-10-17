"use client";

import { useEffect, useState } from "react";
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

interface IAccountsList {
  data: {
    nickname: string;
    accounts: AccountType[];
    totalOfAccounts: number;
  };
}

const AccountsList = ({ data }: IAccountsList) => {
  const accountNickname = data?.nickname ?? "";
  const accounts = data?.accounts ?? [];
  const totalOfAccounts = data?.totalOfAccounts ?? 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAccounts, setFilteredAccounts] =
    useState<AccountType[]>(accounts);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AccountFilterFormData>({
    nickname: "",
    financial_institution: "",
  });

  useEffect(() => {
    setSearchTerm(accountNickname || "");
  }, [accountNickname]);

  useEffect(() => {
    setFilteredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    let filtered = [...accounts];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (account) =>
          account.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.financial_institution
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.nickname && activeFilters.nickname.trim()) {
      const nicknameFilter = activeFilters.nickname.toLowerCase().trim();
      filtered = filtered.filter((account) =>
        account.nickname.toLowerCase().includes(nicknameFilter)
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
        account.financial_institution.toLowerCase().includes(institutionFilter)
      );
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, accounts, activeFilters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
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
              {filteredAccounts.length === 0 ? (
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
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.nickname}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {account.financial_institution}
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

        {filteredAccounts.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span>
              Mostrando {filteredAccounts.length} de {totalOfAccounts} contas
              {hasActiveFilters && " (filtradas)"}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Saldo total:{" "}
                {formatCurrency(
                  filteredAccounts.reduce(
                    (sum: number, account: { balance: number; }) => sum + account.balance,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsList;
