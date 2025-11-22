import { UIMessage } from "ai";

export type ServerMessageType = {
  id: string;
  chatId: string;
  role: string;
  parts: any[];
  createdAt: string;
};

export type FrontMessageType = {
  createdAt: Date;
  message: UIMessage;
};

export type CreateMessageType = {
  id: string;
  userId: string;
  role: string;
  parts: any[];
};
