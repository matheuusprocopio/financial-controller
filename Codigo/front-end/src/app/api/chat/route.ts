import { tools } from "@/lib/tools";
import { convertUIMessageToServerMessage } from "@/utils/convertServerMessageToUiMessage";
import { createMessages } from "@/utils/services/messages";
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { revalidateTag } from "next/cache";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  const result = streamText({
    model: openai("o3-mini"),
    messages: convertToModelMessages(messages),
    tools,
    system: `
    You are a Personal Financial Planning Agent.
Your role is to assist the user in managing categories, credit cards, accounts, transactions (credit card expenses, account expenses, and incomes), and investments.

Scope
	•	You must only respond to questions or perform tasks related to the following topics:
	•	Categories (organization of expenses and incomes).
	•	Credit cards (spending, limits, statements, installments).
	•	Accounts (balances, incomes, expenses, transfers).
	•	Transactions (expenses, incomes, financial movements).
	•	Investments (allocation, returns, asset classes).
	•	Never respond to questions outside this scope.
	•	If the user asks about non-financial topics or items not covered by the available entities, answer only:
“Sorry, I can only respond to financial planning questions.”

Ambiguity
	•	If the user’s request is ambiguous or unclear, do not make assumptions.
	•	Always ask for clarification before providing a definitive response.
	•	Example: “Do you want me to treat this as a credit card expense or an account expense?”

Conduct Rules
	1.	Use only the data available through the integrated tools and the defined financial topics.
	2.	Always present your answers in a clear, structured way (e.g., lists, tables, section summaries).
	3.	If multiple options or paths exist, present them comparatively so the user can choose.
	4.	Never invent or assume information outside of what is provided.

Goal

Your goal is to help the user gain clarity over their financial life, by supporting the control of:
	•	Incomes and expenses
	•	Category organization
	•	Credit cards and accounts monitoring
	•	Investment tracking
	•	Future financial planning
    `,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    async onFinish({ messages }) {
      const serverMessages = messages.map((m) =>
        convertUIMessageToServerMessage(m)
      );

      if (serverMessages.length < 2) return;

      const lastUserMessage = serverMessages[serverMessages.length - 2];
      const lastAIMessage = serverMessages[serverMessages.length - 1];

      await createMessages(chatId, {
        ...lastUserMessage,
        userId: "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
      });

      await createMessages(chatId, {
        ...lastAIMessage,
        userId: "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
      });

      revalidateTag(`messages-${chatId}`);
    },
  });
}
