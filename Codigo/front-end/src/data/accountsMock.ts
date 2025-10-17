import { AccountType } from "@/types/account.type";

export const accountsMock: AccountType[] = [
  {
    id: "1",
    nickname: "Conta Corrente",
    ownerId: "user-001",
    financial_institution: "Banco Itaú",
    balance: 2500.75,
    createdAt: "2025-01-10T09:15:00Z",
  },
  {
    id: "2",
    nickname: "Cartão de Crédito",
    ownerId: "user-001",
    financial_institution: "Nubank",
    balance: -1963.50,
    createdAt: "2025-03-12T08:00:00Z",
  },
  {
    id: "3",
    nickname: "Investimentos",
    ownerId: "user-001",
    financial_institution: "XP Investimentos",
    balance: 8500.25,
    createdAt: "2025-04-22T18:45:00Z",
  }
];
export type { AccountType };

