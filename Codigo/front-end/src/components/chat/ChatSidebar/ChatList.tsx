"use client";

import { deleteChatAction } from "@/actions/chat";
import ChatListItem from "./ChatListItem";
import { ChatType } from "@/types/chat.types";

interface ChatListProps {
  chats: ChatType[];
  chatId: string;
  onSelectChat: (chatId: string) => void;
}

const ChatList = ({ chats, chatId, onSelectChat }: ChatListProps) => {
  return (
    <div className="p-3 space-y-2 pr-2">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          onSelect={() => onSelectChat(chat.id)}
          onDelete={async () => {
            const resp = await deleteChatAction(chat.id);

            if (chat.id == chatId) {
              onSelectChat(resp.id);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ChatList;
