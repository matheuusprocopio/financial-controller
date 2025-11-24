import ChatComponent from "@/components/chat/ChatComponent";
import ChatLayout from "@/components/layout/ChatLayout";
import { getFirebaseId } from "@/utils/server-cookies";
import { listChats } from "@/utils/services/chat";
import { listMessages } from "@/utils/services/messages";

type ChatPageProps = {
  searchParams: Promise<{
    chat_id?: string;
  }>;
};

const ChatPage = async (props: ChatPageProps) => {
  const searchParams = await props.searchParams;

  const firebaseId = await getFirebaseId();

  if (!firebaseId) {
    return <div>Error to load user data</div>;
  }

  const chatsResp = await listChats(firebaseId);

  if ("error" in chatsResp) {
    return <div>Error to load the chats</div>;
  }

  const chatId = searchParams.chat_id ?? chatsResp.data[0].id;

  const messagesResp = await listMessages(chatId, firebaseId);

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
