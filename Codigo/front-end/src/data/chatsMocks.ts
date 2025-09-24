import { ChatType } from "@/types/Chat.types";

const chatMocks: ChatType[] = [
  {
    id: "1",
    title: "Análise de Gastos Mensais",
    lastMessage: "Vou processar essas informações financeiras...",
    timestamp: new Date(),
    isActive: true,
  },
  {
    id: "2",
    title: "Planejamento Orçamentário",
    lastMessage: "Configurando seu orçamento mensal...",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    title: "Relatório de Investimentos",
    lastMessage: "Analisando performance dos investimentos...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "4",
    title: "Controle de Despesas",
    lastMessage: "Categorizando suas despesas...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export { chatMocks };
