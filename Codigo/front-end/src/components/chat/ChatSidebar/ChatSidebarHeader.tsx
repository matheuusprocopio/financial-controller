"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  onClose: () => void;
}

const ChatSidebarHeader = ({ onNewChat, onClose }: ChatSidebarHeaderProps) => (
  <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-3">
    <h2 className="text-sm font-medium text-neutral-200">
      Conversas
    </h2>
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewChat}
        className="h-8 w-8 flex-shrink-0 rounded-md p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 flex-shrink-0 rounded-md p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default ChatSidebarHeader;
