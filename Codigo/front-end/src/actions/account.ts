"use server";

import { CreateAccountType, UpdateAccountType } from "@/types/account.type";
import { RequestError } from "@/utils/requestProvider";
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
    return {
      error: {
        message: "Invalid session",
      },
    };
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
    return {
      error: {
        message: "Invalid session",
      },
    } as RequestError;
  }

  const resp = await updateAccount(accountId, sessionId, payload);
  return resp;
};

export const deleteAccountAction = async (accountId: string) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    } as RequestError;
  }

  const resp = await deleteAccount(accountId, sessionId);
  return resp;
};
