"use client";

import { deleteChatAction } from "@/actions/chat";
import ChatListItem from "./ChatListItem";
import { ChatType } from "@/types/chat.types";

interface ChatListProps {
  chats: ChatType[];
  onSelectChat: (chatId: string) => void;
}

const ChatList = ({ chats, onSelectChat }: ChatListProps) => {
  return (
    <div className="p-3 space-y-2 pr-2">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          onSelect={() => onSelectChat(chat.id)}
          onDelete={async () => {
            const resp = await deleteChatAction(
              "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
              chat.id
            );

            onSelectChat(resp.id);
          }}
        />
      ))}
    </div>
  );
};

export default ChatList;
