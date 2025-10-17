import { intialMessages } from "@/data/initialMessages";

import ChatComponent from "@/components/chat/ChatComponent";

const ChatPage = async () => {
  return <ChatComponent messages={intialMessages} />;
};

export default ChatPage;

