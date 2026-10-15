"use client";

import Link from "next/link";
import { Plus, Wallet, X } from "lucide-react";

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  onClose: () => void;
}

const ChatSidebarHeader = ({ onNewChat, onClose }: ChatSidebarHeaderProps) => (
  <div className="space-y-3 px-3 pb-3">
    <div className="flex h-14 items-center justify-between px-1">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/5">
          <Wallet className="h-4 w-4 text-neutral-200" />
        </div>
        <span className="text-[15px] font-medium tracking-tight text-neutral-100">
          FinancialController
        </span>
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100 lg:hidden"
        aria-label="Fechar conversas"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    <button
      type="button"
      onClick={onNewChat}
      className="flex w-full items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/5"
    >
      <Plus className="h-4 w-4 text-neutral-400" />
      Nova conversa
    </button>
  </div>
);

export default ChatSidebarHeader;
