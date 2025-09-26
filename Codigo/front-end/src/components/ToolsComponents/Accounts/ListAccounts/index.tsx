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
import { Search, Filter, ArrowUpDown, Building2, DollarSign } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { AccountType } from "@/types/account.type";

interface IAccountsList {
  accounts: AccountType[];
  totalOfAccounts: number;
  accountNickname?: string;
}

const AccountsList = ({
  accountNickname,
  accounts,
  totalOfAccounts,
}: IAccountsList) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(accountNickname || "");
  }, [accountNickname]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
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

  return (
    <Card className={cn("w-full max-w-none")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Lista de contas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
              }}
              className="px-3"
            >
              <Filter className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
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
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma conta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
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
                        <Badge variant={getBalanceBadgeVariant(account.balance)} className="text-xs">
                          {account.balance > 0 ? "Positivo" : account.balance < 0 ? "Negativo" : "Zero"}
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

        {accounts.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span>
              Mostrando {accounts.length} de {totalOfAccounts} contas
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Saldo total: {formatCurrency(accounts.reduce((sum, account) => sum + account.balance, 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsList;
