import { Card } from "@/components/ui/card";
import { MessageType } from "@/types/message.types";

const intialMessages: MessageType[] = [
  {
    id: "1",
    content:
      "Olá! Sou seu assistente de finanças com IA. Como posso ajudá-lo hoje?",
    sender: "agent",
    timestamp: new Date(),
  },
  {
    id: "2",
    content:
      "Experimente estes comandos para ver os componentes Gen UI em ação:",
    sender: "agent",
    timestamp: new Date(),
    components: (
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Comandos Disponíveis:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              deletar
            </span>
            <span>- Mostra confirmação de exclusão</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              nova transação
            </span>
            <span>- Abre formulário de transação</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              ações
            </span>
            <span>- Mostra botões de ação</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              qualquer coisa
            </span>
            <span>- Mostra análise financeira</span>
          </div>
        </div>
      </Card>
    ),
  },
];

export { intialMessages };
