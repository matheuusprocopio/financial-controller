import { PaginationResponse } from "./pagination.type";

export type ChatType = {
  id: string;
  name: string;
  createdAt: string; // iso string date
  updatedAt: string; // iso string date
};

export type ChatListResponseType = PaginationResponse<ChatType>;

export type CreateChatReponseType = {
  id: string;
};
