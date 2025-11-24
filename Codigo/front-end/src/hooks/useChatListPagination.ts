"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChatListResponseType } from "@/types/chat.types";

type UseChatListPaginationParams = {
  chatsData: ChatListResponseType;
  chatsCount: number;
};

export const useChatListPagination = ({
  chatsData,
  chatsCount,
}: UseChatListPaginationParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastRequestedPaginationRef = useRef<string | null>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChatCountRef = useRef<number>(chatsCount);
  const canAdvanceRef = useRef<boolean>(true);

  const chatListPageFromQuery = searchParams.get("chat_list_page");
  const parsedPage = chatListPageFromQuery ? parseInt(chatListPageFromQuery, 10) : NaN;
  const chatListPage =
    !Number.isNaN(parsedPage) && parsedPage > 0
      ? parsedPage
      : Math.max(1, chatsData.currentPage ?? 1);

  const chatListSizeFromQuery = searchParams.get("chat_list_size");
  const parsedSize = chatListSizeFromQuery ? parseInt(chatListSizeFromQuery, 10) : NaN;
  const chatListSize =
    !Number.isNaN(parsedSize) && parsedSize > 0
      ? parsedSize
      : Math.max(1, chatsData.pageLimit ?? 10);

  useEffect(() => {
    lastRequestedPaginationRef.current = null;
    canAdvanceRef.current = true;
  }, [chatListPage, chatListSize]);

  useEffect(() => {
    if (chatsCount > lastChatCountRef.current) {
      canAdvanceRef.current = true;
    } else if (
      chatsCount === lastChatCountRef.current &&
      lastRequestedPaginationRef.current
    ) {
      canAdvanceRef.current = false;
    }

    lastChatCountRef.current = chatsCount;
  }, [chatsCount]);

  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  const handleChatListEndReach = useCallback(() => {
    if (!chatsCount) {
      return;
    }

    if (!canAdvanceRef.current) {
      return;
    }

    const nextSize = chatListSize >= 50 ? 50 : Math.min(chatListSize * 2, 50);
    const nextPage = chatListSize >= 50 ? chatListPage + 1 : chatListPage;
    const signature = `${nextPage}-${nextSize}`;

    if (lastRequestedPaginationRef.current === signature) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("chat_list_page", String(nextPage));
    params.set("chat_list_size", String(nextSize));

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    lastRequestedPaginationRef.current = signature;
  }, [chatListPage, chatListSize, chatsCount, pathname, router, searchParams]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
    }

    scrollDebounceRef.current = setTimeout(() => {
      const isAtTop = container.scrollTop <= 8;
      if (isAtTop && chatListPage > 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("chat_list_page", "1");
        params.set("chat_list_size", String(chatListSize));

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        canAdvanceRef.current = true;
        lastRequestedPaginationRef.current = null;
        return;
      }

      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 8;

      if (isAtBottom) {
        handleChatListEndReach();
      }
    }, 150);
  }, [chatListPage, chatListSize, handleChatListEndReach, pathname, router, searchParams]);

  return {
    chatListPage,
    chatListSize,
    handleScroll,
    scrollContainerRef,
  };
};
