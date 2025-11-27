import type { RequestError } from "@/utils/requestProvider";

export type ItemAnalyticsPoint = {
  month?: string;
  categoryName?: string;
  accountName?: string;
  type?: string;
  value: number;
};

export type ItemAnalyticsResponse = {
  metric: string;
  groupBy: string[];
  points: ItemAnalyticsPoint[];
  error?: RequestError;
};
