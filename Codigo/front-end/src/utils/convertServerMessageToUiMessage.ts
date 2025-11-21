import { FrontMessageType, ServerMessageType } from "@/types/message.types";
import { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai";

export const convertServerMessageToUIMessage = (
  message: ServerMessageType
): UIMessage => {
  const parts: UIMessagePart<UIDataTypes, UITools>[] = [];

  message.parts.forEach((part) => {
    parts.push(part);
  });

  return {
    id: message.id,
    role: message.role,
    parts: parts,
  } as UIMessage;
};

export const convertUIMessageToServerMessage = (
  message: UIMessage
): ServerMessageType => {
  return {
    parts: message.parts,
    role: message.role,
  } as ServerMessageType;
};

export const getFrontMessages = (
  serverMsgs: ServerMessageType[],
  uiMsgs: UIMessage[]
): FrontMessageType[] => {
  return uiMsgs.map((msg) => {
    const serverMsg = serverMsgs.find((sv) => sv.id == msg.id);

    if (!serverMsg) {
      return {
        createdAt: new Date(),
        message: msg,
      };
    }

    return {
      createdAt: new Date(serverMsg.createdAt),
      message: msg,
    };
  });
};
