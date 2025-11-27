"use server";

import { UpdateAccountType } from "@/types/account.type";
import { RequestError, createRequestError } from "@/utils/requestProvider";
import { getSessionId } from "@/utils/server-cookies";
import {
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/utils/services/accounts";

export const createAccountAction = async (payload: {
  name: string;
  financialInstitution: string;
  balance: number;
}) => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return createRequestError(401, "Invalid session", "accounts");
  }

  const resp = await createAccount(sessionId, {
    ...payload,
  });

  return resp;
};

export const updateAccountAction = async (
  accountId: string,
  payload: UpdateAccountType
): Promise<RequestError | any> => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return createRequestError(401, "Invalid session", `accounts/${accountId}`);
  }

  const resp = await updateAccount(accountId, sessionId, payload);
  return resp;
};

export const deleteAccountAction = async (accountId: string) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return createRequestError(401, "Invalid session", `accounts/${accountId}`);
  }

  const resp = await deleteAccount(accountId, sessionId);
  return resp;
};
