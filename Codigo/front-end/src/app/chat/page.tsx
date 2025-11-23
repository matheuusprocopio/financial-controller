import ChatComponent from "@/components/chat/ChatComponent";
import ChatLayout from "@/components/layout/ChatLayout";
import { listChats } from "@/utils/services/chat";
import { listMessages } from "@/utils/services/messages";

type ChatPageProps = {
  searchParams: Promise<{
    chat_id?: string;
    chat_list_page?: string;
    chat_list_size?: string;
  }>;
};

const ChatPage = async (props: ChatPageProps) => {
  const searchParams = await props.searchParams;
  const chatListPageAsString = searchParams?.chat_list_page ?? "1";
  const chatListSizeAsString = searchParams?.chat_list_size ?? "10";

  const chatListPage = parseInt(chatListPageAsString);
  const chatListSize = parseInt(chatListSizeAsString);

  const userId = "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e";

  const chatsResp = await listChats({
    userId: userId,
    page: chatListPage,
    size: chatListSize,
  });

  if ("error" in chatsResp) {
    return <div>Error to load the chats</div>;
  }

  const chatId = searchParams.chat_id ?? chatsResp.data[0].id;
  
  const messagesResp = await listMessages(chatId, userId);

  if ("error" in messagesResp) {
    console.log(messagesResp.error);

    return <div>Error to load the messages</div>;
  }

  return (
    <ChatLayout chatsData={chatsResp} chatId={chatId}>
      <ChatComponent serverMessages={messagesResp} chatId={chatId} />
    </ChatLayout>
  );
};

export default ChatPage;
