"use server";

import { CreateAccountType, UpdateAccountType } from "@/types/account.type";
import { PaginationParams } from "@/types/base.types";
import { createAccount, updateAccount, deleteAccount, listAccountsPaginated } from "@/utils/services/accounts";

export const createAccountAction = async (payload: CreateAccountType) => {
  const resp = await createAccount(payload);
  return resp;
};

export const updateAccountAction = async (accountId: string, payload: UpdateAccountType) => {
  const resp = await updateAccount(accountId, payload);
  return resp;
};

export const deleteAccountAction = async (accountId: string) => {
  const resp = await deleteAccount(accountId);
  return resp;
};

export const listAccountsPaginatedAction = async (userId: string, pagination: PaginationParams) => {
  const resp = await listAccountsPaginated(userId, pagination);
  return resp;
};
