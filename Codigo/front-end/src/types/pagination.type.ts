export type PaginationParams = {
  page: number;
  size: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  totalItems: number;
  currentPage: number;
  pageLimit: number;
};
