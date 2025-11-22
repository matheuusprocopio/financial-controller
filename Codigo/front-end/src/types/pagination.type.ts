export type PaginationResponse<T> = {
  data: T[];
  totalItems: number;
  currentPage: number;
  pageLimit: number;
};
