import ChatComponent from "@/components/chat/ChatComponent";
import ChatLayout from "@/components/layout/ChatLayout";
import { listChats } from "@/utils/services/chat";
import { listMessages } from "@/utils/services/messages";

type ChatPageProps = {
  searchParams: Promise<{
    chat_id?: string;
  }>;
};

const ChatPage = async (props: ChatPageProps) => {
  const searchParams = await props.searchParams;


  const chatsResp = await listChats("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e");

  if ("error" in chatsResp) {
    return <div>Error to load the chats</div>;
  }

  const chatId = searchParams.chat_id ?? chatsResp.data[0].id;

  const messagesResp = await listMessages(chatId, "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e")

  if ("error" in messagesResp) {
    return <div>Error to load the messages</div>;
  }

  return (
    <ChatLayout chatsData={chatsResp}>
      <ChatComponent serverMessages={messagesResp} chatId={chatId} />
    </ChatLayout>
  );
};

export default ChatPage;
