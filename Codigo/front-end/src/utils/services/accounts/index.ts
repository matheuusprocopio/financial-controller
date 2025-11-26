import {
  AccountType,
  CreateAccountType,
  UpdateAccountType,
} from "@/types/account.type";
import { PaginatedResponse, PaginationParams } from "@/types/pagination.type";
import newRequestProvider, { RequestError } from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

export const listAccounts = async (
  sessionId: string,
  semanticalSearch?: string
) => {
  const params = new URLSearchParams();

  if (semanticalSearch) {
    params.append("semantical_search", semanticalSearch);
  }

  const response = await provider.get<AccountType[]>(
    `accounts${params.toString() ? `?${params.toString()}` : ""}`,
    {
      ...withSession(sessionId),
    }
  );

  return response;
};

export const listAccountsPaginated = async (
  sessionId: string,
  pagination: PaginationParams,
  semanticalSearch?: string
) => {
  const params = new URLSearchParams({
    page: `${pagination.page}`,
    size: `${pagination.size}`,
  });

  if (semanticalSearch) {
    params.append("semantical_search", semanticalSearch);
  }

  const response = await provider.get<PaginatedResponse<AccountType>>(
    `accounts/paginated?${params.toString()}`,
    {
      ...withSession(sessionId),
    }
  );

  return response;
};

export const getAccountById = async (accountId: string, sessionId: string) => {
  const response = await provider.get<AccountType>(`accounts/${accountId}`, {
    ...withSession(sessionId),
  });

  return response;
};

export const createAccount = async (
  sessionId: string,
  payload: CreateAccountType
) => {
  const response = await provider.post<AccountType, CreateAccountType>(
    `accounts`,
    {
      body: payload,
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );

  return response;
};

export const updateAccount = async (
  accountId: string,
  sessionId: string,
  payload: UpdateAccountType
): Promise<RequestError | any> => {
  const response = await provider.put<any, UpdateAccountType>(
    `accounts/${accountId}`,
    {
      body: payload,
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );

  return response;
};

export const deleteAccount = async (
  accountId: string,
  sessionId: string
): Promise<RequestError> => {
  return await provider.delete(`accounts/${accountId}`, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};
