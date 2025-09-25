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
import {} from "@/components/ui/popover";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CategorieType } from "@/types/categorie.type";

interface ICategoriesList {
  categories: CategorieType[];
  totalOfCategories: number;
  categoryName: string;
}

const CategoriesList = ({
  categoryName,
  categories,
  totalOfCategories,
}: ICategoriesList) => {
  const [searchTerm, setSearchTerm] = useState("");

categories.forEach((c) => console.log(typeof c.createdAt));

  useEffect(() => {
    setSearchTerm(categoryName);
  }, [categoryName]);

  return (
    <Card className={cn("w-full max-w-none")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Lista de categorias
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar categorias..."
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
          <Table className="w-full min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Categoria</TableHead>
                <TableHead className="min-w-[100px]">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma categoria encontrada
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((categorie) => (
                  <TableRow key={categorie.id}>
                    <TableCell className="font-medium">
                      {categorie.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(categorie.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {categories.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span>
              Mostrando {categories.length} de {totalOfCategories} categorias
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesList;
