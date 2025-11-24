import {
  AccountType,
  CreateAccountType,
  UpdateAccountType,
} from "@/types/account.type";
import { PaginatedResponse, PaginationParams } from "@/types/pagination.type";
import newRequestProvider, { RequestError } from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listAccounts = async (userId: string) => {
  const response = await provider.get<AccountType[]>(
    `accounts?user_id=${userId}`
  );

  return response;
};

export const listAccountsPaginated = async (
  userId: string,
  pagination: PaginationParams
) => {
  const response = await provider.get<PaginatedResponse<AccountType>>(
    `accounts/paginated?user_id=${userId}&page=${pagination.page}&size=${pagination.size}`
  );

  return response;
};

export const getAccountById = async (accountId: string) => {
  const response = await provider.get<AccountType>(`accounts/${accountId}`);

  return response;
};

export const createAccount = async (payload: CreateAccountType) => {
  const response = await provider.post<AccountType, CreateAccountType>(
    `accounts`,
    {
      body: payload,
    }
  );

  return response;
};

export const updateAccount = async (
  accountId: string,
  payload: UpdateAccountType
): Promise<RequestError | any> => {
  const response = await provider.put<any, UpdateAccountType>(
    `accounts/${accountId}`,
    {
      body: payload,
    }
  );

  return response;
};

export const deleteAccount = async (
  accountId: string
): Promise<RequestError> => {
  return await provider.delete(`accounts/${accountId}`);
};
