"use server";

import { CreateItemType, UpdateItemType } from "@/types/item.type";
import { RequestError, createRequestError } from "@/utils/requestProvider";
import { getSessionId } from "@/utils/server-cookies";
import { createItem, updateItem, deleteItem } from "@/utils/services/items";

export const createItemAction = async (
  payload: CreateItemType
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return createRequestError(401, "Invalid session", "items");
  }

  const resp = await createItem(sessionId, payload);
  return resp;
};

export const updateItemAction = async (
  itemId: string,
  payload: UpdateItemType
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return createRequestError(401, "Invalid session", `items/${itemId}`);
  }

  const resp = await updateItem(itemId, sessionId, payload);
  return resp;
};

export const deleteItemAction = async (
  itemId: string
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return createRequestError(401, "Invalid session", `items/${itemId}`);
  }

  const resp = await deleteItem(itemId, sessionId);
  return resp;
};
