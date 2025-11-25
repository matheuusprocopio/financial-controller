"use server";

import { updateMessageParts } from "@/utils/services/messages";
import { getSessionId } from "@/utils/server-cookies";
import { createRequestError } from "@/utils/requestProvider";

export const updateMessagePartsAction = async (
  chatId: string,
  messageId: string,
  parts: any[]
) => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return createRequestError(
      401,
      "Invalid session",
      `chats/${chatId}/messages/${messageId}`
    );
  }

  const resp = await updateMessageParts(chatId, messageId, sessionId, parts);

  return resp;
};
