"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  onClose: () => void;
}

const ChatSidebarHeader = ({ onNewChat, onClose }: ChatSidebarHeaderProps) => (
  <div className="relative z-10 flex items-center justify-between border-b border-purple-400/20 bg-gradient-to-r from-purple-500/20 to-cyan-400/10 px-4 py-3">
    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent">
      Conversas
    </h2>
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewChat}
        className="h-8 w-8 flex-shrink-0 rounded-lg border border-purple-400/30 bg-purple-500/10 p-2 text-white transition hover:border-purple-400/50 hover:bg-purple-500/20"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 flex-shrink-0 rounded-lg border border-purple-400/30 bg-purple-500/10 p-2 text-white transition hover:border-purple-400/50 hover:bg-purple-500/20"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default ChatSidebarHeader;
