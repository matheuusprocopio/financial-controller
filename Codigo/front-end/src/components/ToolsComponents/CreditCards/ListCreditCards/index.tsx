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
import { Search, Filter, ArrowUpDown, CreditCard } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CreditCardType } from "@/types/creditcard.types";

interface ICreditCardsList {
  creditCards: CreditCardType[];
  totalOfCreditCards: number;
  cardName: string;
}

const CreditCardsList = ({
  cardName,
  creditCards,
  totalOfCreditCards,
}: ICreditCardsList) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(cardName);
  }, [cardName]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUsagePercentage = (debt: number, limit: number) => {
    return Math.round((debt / limit) * 100);
  };

  const getUsageBadgeVariant = (percentage: number) => {
    if (percentage < 30) return "default";
    if (percentage < 70) return "secondary";
    return "destructive";
  };

  return (
    <Card className={cn("w-full max-w-none")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Lista de cartões de crédito
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar cartões..."
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
                <TableHead className="min-w-[150px]">Cartão</TableHead>
                <TableHead className="min-w-[120px]">Banco</TableHead>
                <TableHead className="min-w-[100px]">Limite</TableHead>
                <TableHead className="min-w-[100px]">Dívida Atual</TableHead>
                <TableHead className="min-w-[80px]">Uso</TableHead>
                <TableHead className="min-w-[80px]">Vencimento</TableHead>
                <TableHead className="min-w-[100px]">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditCards.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum cartão de crédito encontrado
                  </TableCell>
                </TableRow>
              ) : (
                creditCards.map((card) => {
                  const usagePercentage = getUsagePercentage(card.currentDebt, card.limit);
                  return (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">
                        {card.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {card.bank}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(card.limit)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(card.currentDebt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getUsageBadgeVariant(usagePercentage)}>
                          {usagePercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Dia {card.dueDate}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(card.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {creditCards.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span>
              Mostrando {creditCards.length} de {totalOfCreditCards} cartões
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditCardsList;
