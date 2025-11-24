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

interface ChatSidebarProps {
  chatsData: ChatListResponseType;
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

const HEADER_HEIGHT = 64;

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

      <div
        className={`fixed z-30 bg-black/40 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          top: `${HEADER_HEIGHT}px`,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 z-40 flex w-80 flex-col transform transition-transform duration-300 ease-in-out rounded-r-2xl border-r border-purple-400/30 bg-black/95 shadow-[4px_0_32px_rgba(139,92,246,0.2)] backdrop-blur-3xl ${
          isOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none"
        }`}
        style={{
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
        aria-hidden={!isOpen}
        data-state={isOpen ? "open" : "closed"}
      >
        <ChatSidebarHeader onNewChat={handleNewChat} onClose={onClose} />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          onScroll={handleScroll}
        >
          <ChatList
            chats={chats}
            onSelectChat={handleSelectChat}
            chatId={chatId}
          />
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
