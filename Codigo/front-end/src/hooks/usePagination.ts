import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialItemsPerPage?: number;
}

export interface UsePaginationReturn extends PaginationState {
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  resetPage: () => void;
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  initialItemsPerPage = 10,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleSetCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(items);
  }, []);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    resetPage,
  };
};
