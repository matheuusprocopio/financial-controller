"use server";

import { getSessionId } from "@/utils/server-cookies";
import { createChat, deleteChat } from "@/utils/services/chat";
import { revalidateTag } from "next/cache";

export const createChatAction = async (payload: {
  name: string;
}) => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return {
      error: {
        messsage: "Invalid session"
      }
    };
  }

  const resp = await createChat(sessionId, payload.name);

  revalidateTag("list-chat");

  return resp;
};

export const deleteChatAction = async (chatId: string) => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return {
      error: {
        message: "Invalid session",
      },
    };
  }
  const resp = await deleteChat(chatId, sessionId);

  if (typeof resp !== "string" && "error" in resp) return resp;

  revalidateTag("list-chat");

  return resp as { id: string };
};
