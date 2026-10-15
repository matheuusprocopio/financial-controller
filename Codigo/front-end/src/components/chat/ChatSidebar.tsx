"use client";

import type React from "react";
import { useState } from "react";
import { createChatAction } from "@/actions/chat";
import { ChatListResponseType } from "@/types/chat.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useChatListPagination } from "@/hooks/useChatListPagination";
import ChatList from "./ChatSidebar/ChatList";
import ChatSidebarHeader from "./ChatSidebar/ChatSidebarHeader";
import CreateChatDialog from "./ChatSidebar/CreateChatDialog";
import SidebarUserMenu from "./SidebarUserMenu";

interface ChatSidebarProps {
  chatsData: ChatListResponseType;
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ isOpen, onClose, chatsData, chatId }: ChatSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatName, setChatName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const chats = chatsData?.data ?? [];

  const { chatListPage, chatListSize, handleScroll, scrollContainerRef } =
    useChatListPagination({
      chatsData,
      chatsCount: chats.length,
    });

  const handleNewChat = () => {
    setChatName("");
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleSelectChat = (chatId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("chat_id", chatId);
    params.set("chat_list_page", String(chatListPage));
    params.set("chat_list_size", String(chatListSize));

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreateChat = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = chatName.trim();

    if (!trimmedName) {
      setCreateError("Informe um nome para a conversa.");
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      const resp = await createChatAction({
        name: trimmedName,
      });

      if ("error" in resp) {
        setCreateError("Não foi possível criar o chat. Tente novamente.");
        return;
      }

      setShowCreateModal(false);
      setChatName("");
      handleSelectChat(resp.id);
    } catch (err) {
      setCreateError("Não foi possível criar o chat. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <CreateChatDialog
        open={showCreateModal}
        chatName={chatName}
        isCreating={isCreating}
        error={createError}
        onOpenChange={setShowCreateModal}
        onChatNameChange={setChatName}
        onSubmit={handleCreateChat}
      />

      {/* Fundo escuro da gaveta no mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-neutral-950 transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        data-state={isOpen ? "open" : "closed"}
      >
        <ChatSidebarHeader onNewChat={handleNewChat} onClose={onClose} />

        <div
          ref={scrollContainerRef}
          className="chat-scroll-dark flex-1 overflow-y-auto overflow-x-hidden"
          onScroll={handleScroll}
        >
          <ChatList
            chats={chats}
            onSelectChat={(id) => {
              onClose();
              handleSelectChat(id);
            }}
            chatId={chatId}
          />
        </div>

        <div className="border-t border-white/10 p-2">
          <SidebarUserMenu />
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
