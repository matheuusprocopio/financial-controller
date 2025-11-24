"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";

interface PaginationControlsProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: string) => void;
  currentPage: number;
  totalItems: number;
  showBalance?: boolean;
  totalBalance?: number;
  formatCurrency?: (value: number) => string;
}

const ITEMS_PER_PAGE_OPTIONS = ["5", "10", "20", "50"];

const PaginationControls: React.FC<PaginationControlsProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  totalItems,
  showBalance = false,
  totalBalance = 0,
  formatCurrency = (val) => `R$ ${val.toFixed(2)}`,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col gap-4">
      {showBalance && totalItems > 0 && (
        <div className="flex justify-end items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>
              Saldo total: <strong>{formatCurrency(totalBalance)}</strong>
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalItems}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
