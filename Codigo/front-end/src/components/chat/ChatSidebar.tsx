"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, X, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatType } from "@/types/Chat.types";
import { chatMocks } from "@/data/chatsMocks";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ isOpen, onClose }: ChatSidebarProps) => {
  const [chats] = useState<ChatType[]>([...chatMocks]);

  const handleNewChat = () => {
    console.log("Creating new chat...");
    onClose();
  };

  const handleSelectChat = (chatId: string) => {
    console.log("Selecting chat:", chatId);
    onClose();
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-16 bottom-0 w-80 bg-background border-r z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">Conversas</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                chat.isActive ? "bg-accent border-primary/20" : ""
              }`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {chat.lastMessage}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Renomear</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
