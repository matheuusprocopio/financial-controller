"use client";

import { ArrowUpRight } from "lucide-react";

const SUGGESTIONS = [
  { title: "Registrar um gasto", prompt: "Gastei R$ 50 no mercado hoje" },
  { title: "Ver meus gastos do mês", prompt: "Quanto eu gastei este mês, por categoria?" },
  { title: "Criar uma meta", prompt: "Quero criar uma meta para juntar R$ 5.000 até dezembro" },
  { title: "Listar minhas contas", prompt: "Quais contas eu tenho cadastradas?" },
];

interface ChatEmptyStateProps {
  userName?: string;
  onSendMessage: (message: string) => Promise<void>;
}

const ChatEmptyState = ({ userName, onSendMessage }: ChatEmptyStateProps) => {
  const firstName = userName?.split(" ")[0];

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center px-4 py-12">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-100">
        {firstName ? `Olá, ${firstName}.` : "Olá."}
      </h2>
      <p className="mt-2 text-neutral-400">
        Registre gastos, consulte relatórios ou crie metas. É só escrever ou falar.
      </p>
      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.title}
            type="button"
            onClick={() => void onSendMessage(suggestion.prompt)}
            className="group rounded-lg border border-white/10 p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.03]"
          >
            <span className="flex items-center justify-between text-sm font-medium text-neutral-200">
              {suggestion.title}
              <ArrowUpRight className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-neutral-300" />
            </span>
            <span className="mt-1 block text-sm text-neutral-500">“{suggestion.prompt}”</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatEmptyState;
