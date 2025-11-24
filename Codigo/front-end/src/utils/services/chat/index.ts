import {
  ChatListResponseType,
  CreateChatReponseType,
  ListChatParamsType,
} from "@/types/chat.types";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

export const listChats = async (params: ListChatParamsType) => {
  return await provider.get<ChatListResponseType>(
    `chats?page=${params.page}&size=${params.size}`,
    {
      ...withSession(params.sessionId),
      next: {
        tags: ["list-chat"],
      },
    }
  );
};

export const createChat = async (sessionId: string, name: string) => {
  return await provider.post<CreateChatReponseType, { name: string }>(
    `chats`,
    {
      body: {
        name: name,
      },
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );
};

export const deleteChat = async (chatId: string, sessionId: string) => {
  return await provider.delete<any>(`chats/${chatId}`, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};
