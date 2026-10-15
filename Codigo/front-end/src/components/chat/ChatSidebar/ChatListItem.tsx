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
      className={`group relative cursor-pointer rounded-md px-3 py-2.5 transition-colors ${
        isActive
          ? "bg-white/10"
          : "hover:bg-white/5"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className="truncate text-sm leading-5 text-neutral-200">
              {chat.name}
            </h3>
            <span className="block text-xs text-neutral-500">
              {formatTimestamp(chat.updatedAt)}
            </span>
          </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-neutral-500 transition-colors hover:bg-white/10 hover:text-neutral-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-white/10 bg-neutral-900"
            >
              <DropdownMenuItem
                onClick={async (e) => {
                  e.stopPropagation();
                  await onDelete();
                }}
                className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
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
