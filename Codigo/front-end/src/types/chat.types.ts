import { PaginatedResponse, PaginationParams } from "./pagination.type";

export type ChatType = {
  id: string;
  name: string;
  createdAt: string; // iso string date
  updatedAt: string; // iso string date
};

export type ChatListResponseType = PaginatedResponse<ChatType>;

export type ListChatParamsType = {
  sessionId: string;
} & PaginationParams;

export type CreateChatReponseType = {
  id: string;
};
