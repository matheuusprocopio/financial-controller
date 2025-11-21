"use server";

import { createChat, deleteChat } from "@/utils/services/chat";
import { revalidateTag } from "next/cache";

export const createChatAction = async (payload: {
  userId: string;
  name: string;
}) => {
  const resp = await createChat(payload.userId, payload.name);

  revalidateTag("list-chat");

  return resp;
};

export const deleteChatAction = async (userId: string, chatId: string) => {
  let resp = await deleteChat(chatId);

  if (typeof resp != "string" && "error" in resp) return resp;

  const now = new Date();

  resp = await createChat(userId, now.toString());

  revalidateTag("list-chat");

  return resp as { id: string };
};
