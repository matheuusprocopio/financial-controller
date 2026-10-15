"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChatType } from "@/types/chat.types";
import { MoreHorizontal, Trash2 } from "lucide-react";

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
  isActive = false,
}: ChatListItemProps) => {
  return (
    <div
      className={cn(
        "group relative flex items-center rounded-md transition-colors",
        isActive ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "min-w-0 flex-1 truncate py-2 pl-3 pr-8 text-left text-sm outline-none",
          isActive ? "text-neutral-100" : "text-neutral-400 group-hover:text-neutral-200"
        )}
        title={chat.name}
      >
        {chat.name}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "absolute right-1 inline-flex h-6 w-6 items-center justify-center rounded text-neutral-500 transition hover:bg-white/10 hover:text-neutral-200 focus-visible:opacity-100 data-[state=open]:opacity-100",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            aria-label={`Opções da conversa ${chat.name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={async (e) => {
              e.stopPropagation();
              await onDelete();
            }}
            className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatListItem;
