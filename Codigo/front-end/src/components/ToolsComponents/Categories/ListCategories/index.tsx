"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CategorieType } from "@/types/categorie.type";
import { usePagination } from "@/hooks/usePagination";
import PaginationNumbers from "@/components/ToolsComponents/Base/Pagination/PaginationNumbers";
import PaginationControls from "@/components/ToolsComponents/Base/Pagination/PaginationControls";
import type { RequestError } from "@/utils/requestProvider";

interface ICategoriesList {
  data: {
    name?: string;
    categories?: CategorieType[];
    totalOfCategories?: number;
    currentPage?: number;
    pageLimit?: number;
    error?: string | RequestError;
  };
  onError?(errMsg: string, payload?: unknown): void;
}

const CategoriesList = ({ data, onError }: ICategoriesList) => {
  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);
  const categoryName = data?.name ?? "";
  const totalOfCategories = data?.totalOfCategories ?? 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoriesData, setCategoriesData] = useState<CategorieType[]>(categories);
  const [totalItems, setTotalItems] = useState<number>(totalOfCategories);
  const hasMounted = useRef(false);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    resetPage,
  } = usePagination({
    totalItems,
    initialPage: data?.currentPage ?? 1,
    initialItemsPerPage: data?.pageLimit ?? 10,
  });

  useEffect(() => {
    setSearchTerm(categoryName);
  }, [categoryName]);

  useEffect(() => {
    setCategoriesData(categories);
    setTotalItems(totalOfCategories);
  }, [categories, totalOfCategories]);

  const filteredCategories = useMemo(() => {
    let filtered = [...categoriesData];

    if (searchTerm.trim()) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [categoriesData, searchTerm]);

  useEffect(() => {
    resetPage();
  }, [resetPage, searchTerm]);

  const paginatedCategories = filteredCategories;

  const handlePaginationChange = useCallback(
    async (page?: number, itemsPerPageOverride?: number) => {
      const newPage = page ?? currentPage;
      const newItemsPerPage = itemsPerPageOverride ?? itemsPerPage;
    const semantialSearch = searchTerm.trim()
      ? `&semantical_search=${encodeURIComponent(searchTerm.trim())}`
      : "";
      const targetPage = itemsPerPageOverride ? 1 : newPage;

      try {
        const response = await fetch(
          `/api/pagination/categories?page=${targetPage}&size=${newItemsPerPage}${semantialSearch}`
        );
        const result = await response.json();

        if (!response.ok || "error" in result) {
          const errorMessage =
            (result as RequestError)?.error?.message ||
            "Erro ao buscar categorias. Tente novamente.";
          onError?.(errorMessage);
          return;
        }

        setCategoriesData(result.data);
        setTotalItems((prev) => result.totalItems ?? prev);

        if (itemsPerPageOverride) {
          setItemsPerPage(newItemsPerPage);
          resetPage();
        } else if (page) {
          setCurrentPage(newPage);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao buscar categorias. Tente novamente.";
        onError?.(message);
      }
    },
    [currentPage, itemsPerPage, onError, resetPage, searchTerm, setCurrentPage, setItemsPerPage]
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const timeoutId = setTimeout(() => {
      handlePaginationChange(1);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [handlePaginationChange, searchTerm]);

  useEffect(() => {
    if (data?.error) {
      const message =
        typeof data.error === "string"
          ? data.error
          : data.error.error?.message || "Erro ao carregar categorias.";
      onError?.(message);
    }
  }, [data?.error, onError]);

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
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "Nenhuma categoria encontrada com os filtros aplicados"
                      : "Nenhuma categoria encontrada"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((categorie) => (
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

        {filteredCategories.length > 0 && totalPages > 0 && (
          <div className="flex flex-col gap-4">
            <PaginationControls
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => handlePaginationChange(undefined, Number(value))}
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

export default CategoriesList;
