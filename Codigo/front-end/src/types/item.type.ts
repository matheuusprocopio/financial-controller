export type ItemType = {
  id: string;
  categoryId: string;
  userId: string;
  accountId: string;
  name: string;
  description: string;
  amount: number;
  date: string; 
  type: "income" | "expense";
};

export type CreateItemType = {
  categoryId: string;
  userId: string;
  accountId: string;
  name: string;
  description: string;
  amount: number;
  date: string; 
  type: "income" | "expense";
};

export type UpdateItemType = {
  categoryId?: string;
  accountId?: string;
  name?: string;
  description?: string;
  amount?: number;
  date?: string; 
  type?: "income" | "expense";
};

export type ItemFilterType = {
  name?: string;
  categoryId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: "income" | "expense";
};
