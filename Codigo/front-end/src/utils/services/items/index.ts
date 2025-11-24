import { ItemType, CreateItemType, UpdateItemType } from "@/types/item.type";
import { PaginationResponse } from "@/types/pagination.type";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_SERVICE_API_BASE_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const transformItemFromBackend = (backendItem: any): ItemType => ({
  id: backendItem.id,
  categoryId: backendItem.categoryId,
  userId: backendItem.userId,
  accountId: backendItem.accountId,
  name: backendItem.name,
  description: backendItem.description,
  amount: backendItem.amount,
  date: backendItem.date,
  type: backendItem.type,
});

const transformItemToBackend = (item: CreateItemType | UpdateItemType) => ({
  categoryId: (item as CreateItemType).categoryId,
  userId: (item as CreateItemType).userId,
  accountId: item.accountId,
  name: item.name,
  description: item.description,
  amount: item.amount,
  date: item.date,
  type: item.type,
});

export const listItems = async (
  userId: string,
  options?: {
    name?: string;
    categoryId?: string;
    accountId?: string;
    type?: "income" | "expense";
    startDate?: string;
    endDate?: string;
    page?: number;
    pageLimit?: number;
  }
) => {
  const params = new URLSearchParams();
  params.append("user_id", userId);

  if (options?.name) params.append("name", options.name);
  if (options?.categoryId) params.append("category_id", options.categoryId);
  if (options?.accountId) params.append("account_id", options.accountId);
  if (options?.type) params.append("type", options.type);
  if (options?.startDate) params.append("start_date", options.startDate);
  if (options?.endDate) params.append("end_date", options.endDate);
  if (options?.page) params.append("page", options.page.toString());
  if (options?.pageLimit) params.append("pageLimit", options.pageLimit.toString());

  const response = await provider.get<PaginationResponse<any>>(
    `items?${params.toString()}`
  );

  if (response && !("error" in response)) {
    return {
      ...response,
      data: response.data.map(transformItemFromBackend),
    };
  }

  return response;
};

export const getItemById = async (itemId: string) => {
  const response = await provider.get<any>(`items/${itemId}`);

  if (response && !("error" in response)) {
    return transformItemFromBackend(response);
  }

  return response;
};

export const createItem = async (payload: CreateItemType) => {
  const backendPayload = transformItemToBackend(payload);

  const response = await provider.post<any, any>(`items`, {
    body: backendPayload,
  });

  if (response && !("error" in response)) {
    return transformItemFromBackend(response);
  }

  return response;
};

export const updateItem = async (itemId: string, payload: UpdateItemType) => {
  const backendPayload: any = {};

  if (payload.categoryId !== undefined) {
    backendPayload.categoryId = payload.categoryId;
  }
  if (payload.accountId !== undefined) {
    backendPayload.accountId = payload.accountId;
  }
  if (payload.name !== undefined) {
    backendPayload.name = payload.name;
  }
  if (payload.description !== undefined) {
    backendPayload.description = payload.description;
  }
  if (payload.amount !== undefined) {
    backendPayload.amount = payload.amount;
  }
  if (payload.date !== undefined) {
    backendPayload.date = payload.date;
  }
  if (payload.type !== undefined) {
    backendPayload.type = payload.type;
  }

  const response = await provider.put<any, any>(`items/${itemId}`, {
    body: backendPayload,
  });

  if (response && typeof response === 'string') {
    return await getItemById(itemId);
  }

  if (response && typeof response === 'object' && !("error" in response)) {
    return await getItemById(itemId);
  }

  return response;
};

export const deleteItem = async (itemId: string) => {
  return await provider.delete(`items/${itemId}`);
};
