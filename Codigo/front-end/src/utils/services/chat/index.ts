import {
  ChatListResponseType,
  CreateChatReponseType,
} from "@/types/chat.types";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_SERVICE_API_BASE_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listChats = async (userId: string) => {
  return await provider.get<ChatListResponseType>(`chats?user_id=${userId}`, {
    next: {
      tags: ["list-chat"],
    }
  });
};

export const createChat = async (userId: string, name: string) => {
  return await provider.post<CreateChatReponseType, { name: string }>(
    `chats?user_id=${userId}`,
    {
      body: {
        name: name,
      },
    }
  );
};

export const deleteChat = async (chatId: string) => {
  return await provider.delete<any>(
    `chats/${chatId}`
  );
};
