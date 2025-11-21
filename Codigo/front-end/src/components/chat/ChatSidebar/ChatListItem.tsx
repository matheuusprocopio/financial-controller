"use client";

import { deleteChatAction } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimestamp } from "@/lib/utils";
import { ChatType } from "@/types/chat.types";
import { MessageSquare, MoreVertical } from "lucide-react";

interface ChatListItemProps {
  chat: ChatType;
  onSelect: () => void;
  onDelete: () => Promise<void>;
  isActive?: boolean;
}

const ChatListItem = ({
  chat,
  onSelect,
  onDelete,
  isActive = true,
}: ChatListItemProps) => {

  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 p-3 sm:p-3.5 ${
        isActive
          ? "translate-x-1.5 border-purple-400/50 bg-gradient-to-br from-purple-500/15 via-transparent to-cyan-400/10 shadow-[-3px_0_0_#8b5cf6,0_8px_24px_rgba(139,92,246,0.25)]"
          : "border-purple-400/15 bg-purple-500/5 hover:translate-x-1 hover:border-purple-400/35 hover:bg-purple-500/10"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="mt-1 relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full"></div>
            <MessageSquare className="h-4 w-4 text-purple-400 relative z-10" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="font-medium text-sm truncate text-gray-200 leading-5">
              {chat.name}
            </h3>
            <p className="text-xs text-gray-400 truncate">{"last message"}</p>
            <span className="text-[11px] text-gray-500 block">
              {formatTimestamp(chat.updatedAt)}
            </span>
          </div>
        </div>
        <div className="pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-purple-500/20 transition-colors"
              >
                <MoreVertical className="h-3 w-3 text-gray-400 hover:text-purple-400 transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-black/95 border-purple-500/30 backdrop-blur-xl"
            >
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
