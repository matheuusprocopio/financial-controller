"use client";

import { PanelLeft } from "lucide-react";

interface ChatTopBarProps {
  title: string;
  onOpenSidebar: () => void;
}

const ChatTopBar = ({ title, onOpenSidebar }: ChatTopBarProps) => (
  <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4">
    <button
      type="button"
      onClick={onOpenSidebar}
      className="-ml-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100 lg:hidden"
      aria-label="Abrir conversas"
    >
      <PanelLeft className="h-4 w-4" />
    </button>
    <h1 className="truncate text-sm font-medium text-neutral-200">{title}</h1>
  </header>
);

export default ChatTopBar;
