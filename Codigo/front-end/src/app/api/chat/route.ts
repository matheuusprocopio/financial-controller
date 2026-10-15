import { AGENT_MODEL } from "@/lib/agent/model";
import { buildSystemPrompt } from "@/lib/agent/systemPrompt";
import { tools } from "@/lib/tools";
import { convertUIMessageToServerMessage } from "@/utils/convertServerMessageToUiMessage";
import { createMessages } from "@/utils/services/messages";
import { generateMessageId } from "@/utils/messageId";
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export const maxDuration = 30;
const COOKIE_NAME = "financialcontroller_session_id";


export async function POST(req: NextRequest) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();
  const result = streamText({
    model: openai(AGENT_MODEL),
    messages: convertToModelMessages(messages),
    tools,
    system: buildSystemPrompt(),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId,
    async onFinish({ messages }) {
      const serverMessages = messages.map((m) =>
        convertUIMessageToServerMessage(m)
      );

      if (serverMessages.length < 2) return;

      const lastUserMessage = serverMessages[serverMessages.length - 2];
      const lastAIMessage = serverMessages[serverMessages.length - 1];

      const sessionId = req.cookies.get(COOKIE_NAME)?.value;

      if (!sessionId) {
        return;
      }

      await createMessages(chatId, sessionId, {
        ...lastUserMessage,
      });

      await createMessages(chatId, sessionId, {
        ...lastAIMessage,
      });

      revalidateTag(`messages-${chatId}`);
    },
  });
}