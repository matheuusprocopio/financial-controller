export type CreditCardType = {
  id: string;
  name: string;
  financialInstitution: string;
  limit: number;
  currentDebt: number;
  dueDate: string;
  createdAt: string;
};

export const creditCardsMock: CreditCardType[] = [
  {
    id: "cc1b2c3d4-e5f6-4789-9abc-000000000001",
    name: "Cartão Platinum",
    financialInstitution: "Banco do Brasil",
    limit: 5000.00,
    currentDebt: 1250.75,
    dueDate: "2025-02",
    createdAt: "2025-01-10T09:15:00Z",
  },
  {
    id: "cc1b2c3d4-e5f6-4789-9abc-000000000002",
    name: "Cartão Gold",
    financialInstitution: "Itaú",
    limit: 3000.00,
    currentDebt: 890.30,
    dueDate: "2025-03",
    createdAt: "2025-02-05T14:30:00Z",
  },
  {
    id: "cc1b2c3d4-e5f6-4789-9abc-000000000003",
    name: "Cartão Black",
    financialInstitution: "Nubank",
    limit: 8000.00,
    currentDebt: 2340.50,
    dueDate: "2025-04",
    createdAt: "2025-03-12T08:00:00Z",
  },
];
