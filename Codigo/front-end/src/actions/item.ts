"use server";

import { CreateItemType, UpdateItemType } from "@/types/item.type";
import { createItem, updateItem, deleteItem } from "@/utils/services/items";

export const createItemAction = async (payload: CreateItemType) => {
  const resp = await createItem(payload);
  return resp;
};

export const updateItemAction = async (itemId: string, payload: UpdateItemType) => {
  const resp = await updateItem(itemId, payload);
  return resp;
};

export const deleteItemAction = async (itemId: string) => {
  const resp = await deleteItem(itemId);
  return resp;
};
