"use client";
import { ServerMessageType } from "@/types/message.types";
import ChatWrapper from "./ChatWrapper";

interface IChatComponent {
  serverMessages: ServerMessageType[];
  chatId: string;
}

const ChatComponent = ({ serverMessages, chatId }: IChatComponent) => {
  return (
    <div className="relative z-20 flex h-full min-h-0 w-full flex-1 flex-col">
      <ChatWrapper serverMessages={serverMessages} chatId={chatId} />
    </div>
  );
};

export default ChatComponent;
