import { ItemType, CreateItemType, UpdateItemType } from "@/types/item.type";
import { PaginatedResponse } from "@/types/pagination.type";
import newRequestProvider, { RequestError, createRequestError } from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

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
  duplicateConfirmed: (item as CreateItemType).duplicateConfirmed,
  categoryId: (item as CreateItemType).categoryId,
  userId: (item as CreateItemType).userId,
  accountId: item.accountId,
  name: item.name,
  description: item.description,
  amount: item.amount,
  date: item.date,
  type: item.type,
});

export type DuplicateMatch = {
  source: "history" | "batch";
  batchIndex: number;
  item: ItemType | null;
};

export const checkItemDuplicates = async (sessionId: string, items: CreateItemType[]) =>
  provider.post<DuplicateMatch[][], ReturnType<typeof transformItemToBackend>[]>("items/duplicates", {
    body: items.map(transformItemToBackend),
    headers: { "X-Session-Id": sessionId },
  });

export const listItems = async (
  sessionId: string,
  options?: {
    userId?: string;
    name?: string;
    categoryId?: string;
    accountId?: string;
    type?: "income" | "expense";
    startDate?: string;
    endDate?: string;
    page?: number;
    pageLimit?: number;
    semanticalSearch?: string;
  }
): Promise<PaginatedResponse<ItemType> | RequestError> => {
  const params = new URLSearchParams();
  if (options?.userId) params.append("user_id", options.userId);

  if (options?.name) params.append("name", options.name);
  if (options?.categoryId) params.append("category_id", options.categoryId);
  if (options?.accountId) params.append("account_id", options.accountId);
  if (options?.type) params.append("type", options.type);
  if (options?.startDate) params.append("start_date", options.startDate);
  if (options?.endDate) params.append("end_date", options.endDate);
  if (options?.page) params.append("page", options.page.toString());
  if (options?.pageLimit) params.append("pageLimit", options.pageLimit.toString());
  if (options?.semanticalSearch)
    params.append("semantical_search", options.semanticalSearch);

  const response = await provider.get<PaginatedResponse<ItemType>>(
    `items?${params.toString()}`,
    {
      ...withSession(sessionId),
    }
  );

  if (response && !("error" in response)) {
    return {
      ...response,
      data: response.data.map(transformItemFromBackend),
    };
  }

  return response;
};

export const getItemById = async (
  itemId: string,
  sessionId: string
): Promise<ItemType | RequestError> => {
  const response = await provider.get<ItemType>(`items/${itemId}`, {
    ...withSession(sessionId),
  });

  if (response && !("error" in response)) {
    return transformItemFromBackend(response);
  }

  return response;
};

export const createItem = async (
  sessionId: string,
  payload: CreateItemType
): Promise<ItemType | RequestError> => {
  if (!payload.userId) {
    return createRequestError(
      400,
      "O identificador do usuário é obrigatório para criar uma transação.",
      "items"
    );
  }

  const backendPayload = transformItemToBackend(payload);

  const response = await provider.post<any, any>(`items`, {
    body: backendPayload,
    headers: {
      "X-Session-Id": sessionId,
    },
  });

  if (response && !("error" in response)) {
    return transformItemFromBackend(response);
  }

  return response;
};

export const updateItem = async (
  itemId: string,
  sessionId: string,
  payload: UpdateItemType
): Promise<ItemType | RequestError> => {
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
    headers: {
      "X-Session-Id": sessionId,
    },
  });

  if (response && typeof response === "string") {
    return await getItemById(itemId, sessionId);
  }

  if (response && typeof response === "object" && !("error" in response)) {
    return await getItemById(itemId, sessionId);
  }

  return response;
};

export const deleteItem = async (
  itemId: string,
  sessionId: string
): Promise<{} | RequestError> => {
  return await provider.delete(`items/${itemId}`, {
    ...withSession(sessionId),
  });
};
