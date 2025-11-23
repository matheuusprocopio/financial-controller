import { CreateMessageType, ServerMessageType } from "@/types/message.types";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listMessages = async (chatId: string, userId: string) => {
  const resp = await provider.get<ServerMessageType[]>(
    `chats/${chatId}/messages?user_id=${userId}`
  );

  return resp;
};

export const createMessages = async (
  chatId: string,
  message: CreateMessageType
) => {
  const resp = await provider.post(`chats/${chatId}/messages`, {
    body: {
      ...message,
    },
  });

  return resp;
};
