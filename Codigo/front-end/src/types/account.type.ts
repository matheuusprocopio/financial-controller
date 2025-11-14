export type AccountType = {
  id: string;
  nickname: string;
  ownerId: string;
  financial_institution: string;
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
