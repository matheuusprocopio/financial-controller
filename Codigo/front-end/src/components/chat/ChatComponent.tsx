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
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
        <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.3)_1px,transparent_1px)] bg-[50px_50px]" />
      </div>

      <ChatWrapper serverMessages={serverMessages} chatId={chatId} />
    </div>
  );
};

export default ChatComponent;
