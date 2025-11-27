import newRequestProvider from "@/utils/requestProvider";
import { ItemAnalyticsResponse } from "@/types/analytics.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export type ItemAnalyticsRequest = {
  userId?: string;
  metric: "total_expenses" | "total_incomes" | "balance" | "count_items";
  groupBy: ("month" | "category" | "account" | "type")[];
  startDate: string; 
  endDate: string;  
  categoryId?: string;
  accountId?: string;
};

export const calculateItemsAnalytics = async (
  body: ItemAnalyticsRequest,
  sessionId: string
) => {
  return provider.post<ItemAnalyticsResponse, ItemAnalyticsRequest>(
    "items/analytics",
    { body, headers: { "X-Session-Id": sessionId } }
  );
};
