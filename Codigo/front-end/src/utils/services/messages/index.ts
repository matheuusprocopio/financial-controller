import { CreateMessageType, ServerMessageType } from "@/types/message.types";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

export const listMessages = async (chatId: string, sessionId: string) => {
  const resp = await provider.get<ServerMessageType[]>(
    `chats/${chatId}/messages`,
    {
      ...withSession(sessionId),
    }
  );

  return resp;
};

export const createMessages = async (
  chatId: string,
  sessionId: string,
  message: CreateMessageType
) => {
  const resp = await provider.post(`chats/${chatId}/messages`, {
    body: {
      ...message,
    },
    headers: {
      "X-Session-Id": sessionId,
    },
  });

  return resp;
};

export const updateMessageParts = async (
  chatId: string,
  messageId: string,
  sessionId: string,
  parts: any[]
) => {
  const resp = await provider.patch(`chats/${chatId}/messages/${messageId}`, {
    body: {
      parts,
    },
    headers: {
      "X-Session-Id": sessionId,
    },
  });

  return resp;
};
