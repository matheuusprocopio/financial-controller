
import { AccountType, CreateAccountType, UpdateAccountType } from "@/types/account.type";
import { PaginatedResponse, PaginationParams } from "@/types/base.types";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_SERVICE_API_BASE_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const transformAccountFromBackend = (backendAccount: any): AccountType => ({
  id: backendAccount.id,
  nickname: backendAccount.name, 
  ownerId: backendAccount.userId,
  financial_institution: backendAccount.financialInstitution, 
  balance: backendAccount.balance,
  createdAt: backendAccount.createdAt,
});

const transformAccountToBackend = (account: CreateAccountType | UpdateAccountType) => ({
  name: account.name, 
  userId: (account as CreateAccountType).userId,
  financialInstitution: account.financialInstitution, 
  balance: account.balance,
});

export const listAccounts = async (userId: string) => {
  const response = await provider.get<any[]>(
    `accounts?user_id=${userId}`
  );
  
  if (Array.isArray(response)) {
    return response.map(transformAccountFromBackend);
  }
  
  return response;
};

export const listAccountsPaginated = async (userId: string, pagination: PaginationParams) => {
  const response = await provider.get<any>(
    `accounts/paginated?user_id=${userId}&page=${pagination.page}&size=${pagination.size}`
  );
  
  if (response && response.data && Array.isArray(response.data)) {
    const paginatedResponse: PaginatedResponse<AccountType> = {
      data: response.data.map(transformAccountFromBackend),
      totalItems: response.totalItems,
      currentPage: response.currentPage,
      pageLimit: response.pageLimit,
    };
    return paginatedResponse;
  }
  
  return response;
};

export const getAccountById = async (accountId: string) => {
  const response = await provider.get<any>(
    `accounts/${accountId}`
  );
  
  if (response && !response.error) {
    return transformAccountFromBackend(response);
  }
  
  return response;
};

export const createAccount = async (payload: CreateAccountType) => {
  const backendPayload = transformAccountToBackend(payload);
  
  const response = await provider.post<any, any>(
    `accounts`,
    {
      body: backendPayload,
    }
  );
  
  if (response && !response.error) {
    return transformAccountFromBackend(response);
  }
  
  return response;
};

export const updateAccount = async (accountId: string, payload: UpdateAccountType) => {
  const backendPayload: any = {};
  
  if (payload.name !== undefined) {
    backendPayload.name = payload.name;
  }
  if (payload.financialInstitution !== undefined) {
    backendPayload.financialInstitution = payload.financialInstitution;
  }
  if (payload.balance !== undefined) {
    backendPayload.balance = payload.balance;
  }
  
  const response = await provider.put<any, any>(
    `accounts/${accountId}`,
    {
      body: backendPayload,
    }
  );
  if (response && !response.error) {
    return await getAccountById(accountId);
  }
  
  return response;
};

export const deleteAccount = async (accountId: string) => {
  return await provider.delete(
    `accounts/${accountId}`
  );
};
