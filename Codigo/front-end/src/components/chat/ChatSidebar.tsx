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
    <div className="chat-sidebar fixed left-0 top-16 bottom-0 w-80 z-40 flex flex-col">
      <div className="chat-sidebar-header flex items-center justify-between">
        <h2 className="chat-sidebar-title">Conversas</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewChat}
            className="chat-button border-0 p-2 h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="chat-button border-0 p-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-card ${chat.isActive ? "chat-card-active" : ""}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate text-gray-200">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {chat.lastMessage}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-indigo-500/20"
                    >
                      <MoreVertical className="h-3 w-3 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="bg-gray-900 border-indigo-500/30"
                  >
                    <DropdownMenuItem className="text-gray-200 hover:bg-indigo-500/20">
                      Renomear
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/20">
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
