"use client";

import { deleteChatAction } from "@/actions/chat";
import ChatListItem from "./ChatListItem";
import { ChatType } from "@/types/chat.types";

interface ChatListProps {
  chats: ChatType[];
  chatId: string;
  onSelectChat: (chatId: string) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Agrupa pela última atividade, como em "Hoje", "Ontem", "Últimos 7 dias"
const getGroupLabel = (isoDate: string, todayStart: number) => {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return "Anteriores";
  if (time >= todayStart) return "Hoje";
  if (time >= todayStart - DAY_MS) return "Ontem";
  if (time >= todayStart - 7 * DAY_MS) return "Últimos 7 dias";
  if (time >= todayStart - 30 * DAY_MS) return "Últimos 30 dias";
  return "Anteriores";
};

const ChatList = ({ chats, chatId, onSelectChat }: ChatListProps) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const groups: { label: string; chats: ChatType[] }[] = [];
  for (const chat of chats) {
    const label = getGroupLabel(chat.updatedAt, todayStart);
    const group = groups.find((g) => g.label === label);
    if (group) {
      group.chats.push(chat);
    } else {
      groups.push({ label, chats: [chat] });
    }
  }

  if (chats.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-neutral-500">Nenhuma conversa ainda.</p>
    );
  }

  return (
    <div className="space-y-5 px-3 pb-4">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="px-3 pb-1 text-xs font-medium text-neutral-500">{group.label}</h3>
          <div className="space-y-0.5">
            {group.chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === chatId}
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
        </section>
      ))}
    </div>
  );
};

export default ChatList;
