export type AccountType = {
  id: string;
  name: string;
  userId: string;
  financialInstitution: string;
  balance: number;
  createdAt: string;
};

export type CreateAccountType = {
  name: string;
  userId: string;
  financialInstitution: string;
  balance: number;
};

export type UpdateAccountType = {
  name?: string;
  financialInstitution?: string;
  balance?: number;
};
