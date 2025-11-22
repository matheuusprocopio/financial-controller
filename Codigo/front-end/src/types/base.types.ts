export type ActionItemType = {
  label: string;
  description: string;
  onClick?: () => void;
};

// Re-export pagination types for backwards compatibility
export type { PaginatedResponse, PaginationParams } from './pagination.type';
