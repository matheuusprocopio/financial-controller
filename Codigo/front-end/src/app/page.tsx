"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, DollarSign, PlusCircle, FileText } from "lucide-react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ConfirmationCard } from "@/components/chat/gen-ui/confirmation-card";
import { ActionCard } from "@/components/chat/gen-ui/action-card";
import { FormCard } from "@/components/chat/gen-ui/form-card";
import type { MessageType } from "@/components/chat/message";

const initialMessages: MessageType[] = [
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

export default function ChatPage() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  const handleSendMessage = (newMessage: MessageType) => {
    setMessages((prev) => [...prev, newMessage]);

    if (newMessage.sender === "user") {
      setTimeout(() => {
        const userMessage = newMessage.content.toLowerCase();

        if (
          userMessage.includes("deletar") ||
          userMessage.includes("remover") ||
          userMessage.includes("excluir")
        ) {
          const agentResponse: MessageType = {
            id: (Date.now() + 1).toString(),
            content:
              "Detectei que você quer deletar algo. Preciso de sua confirmação:",
            sender: "agent",
            timestamp: new Date(),
            components: (
              <ConfirmationCard
                title="Confirmar Exclusão"
                description="Você tem certeza que deseja deletar este item?"
                confirmLabel="Sim, deletar"
                cancelLabel="Cancelar"
                confirmVariant="destructive"
                onConfirm={() => {
                  const confirmResponse: MessageType = {
                    id: (Date.now() + 2).toString(),
                    content: "Item deletado com sucesso!",
                    sender: "agent",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, confirmResponse]);
                }}
                onCancel={() => {
                  const cancelResponse: MessageType = {
                    id: (Date.now() + 2).toString(),
                    content: "Operação cancelada. Nenhum item foi deletado.",
                    sender: "agent",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, cancelResponse]);
                }}
              >
                <Card className="p-3 border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Transação #1234</div>
                      <div className="text-xs text-muted-foreground">
                        Compra no supermercado - R$ 150,00
                      </div>
                    </div>
                  </div>
                </Card>
              </ConfirmationCard>
            ),
          };
          setMessages((prev) => [...prev, agentResponse]);
        } else if (
          userMessage.includes("adicionar") ||
          userMessage.includes("nova transação")
        ) {
          const agentResponse: MessageType = {
            id: (Date.now() + 1).toString(),
            content:
              "Vou ajudá-lo a adicionar uma nova transação. Preencha os dados abaixo:",
            sender: "agent",
            timestamp: new Date(),
            components: (
              <FormCard
                title="Nova Transação"
                description="Preencha os dados da transação financeira"
                fields={[
                  {
                    name: "description",
                    label: "Descrição",
                    type: "text",
                    placeholder: "Ex: Compra no supermercado",
                    required: true,
                  },
                  {
                    name: "amount",
                    label: "Valor",
                    type: "number",
                    placeholder: "0.00",
                    required: true,
                  },
                  {
                    name: "category",
                    label: "Categoria",
                    type: "text",
                    placeholder: "Ex: Alimentação",
                  },
                  {
                    name: "notes",
                    label: "Observações",
                    type: "textarea",
                    placeholder: "Informações adicionais...",
                  },
                ]}
                submitLabel="Adicionar Transação"
                onSubmit={(data) => {
                  const confirmResponse: MessageType = {
                    id: (Date.now() + 2).toString(),
                    content: `Transação adicionada: ${data.description} - R$ ${data.amount}`,
                    sender: "agent",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, confirmResponse]);
                }}
              />
            ),
          };
          setMessages((prev) => [...prev, agentResponse]);
        } else if (
          userMessage.includes("ações") ||
          userMessage.includes("opções")
        ) {
          const agentResponse: MessageType = {
            id: (Date.now() + 1).toString(),
            content: "Aqui estão algumas ações que você pode realizar:",
            sender: "agent",
            timestamp: new Date(),
            components: (
              <ActionCard
                title="Ações Disponíveis"
                description="Escolha uma das opções abaixo:"
                actions={[
                  {
                    label: "Ver Relatório Mensal",
                    icon: <FileText className="h-4 w-4" />,
                    onClick: () => {
                      const response: MessageType = {
                        id: (Date.now() + 2).toString(),
                        content: "Gerando relatório mensal...",
                        sender: "agent",
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, response]);
                    },
                  },
                  {
                    label: "Adicionar Receita",
                    icon: <PlusCircle className="h-4 w-4" />,
                    variant: "default" as const,
                    onClick: () => {
                      const response: MessageType = {
                        id: (Date.now() + 2).toString(),
                        content: "Vamos adicionar uma nova receita...",
                        sender: "agent",
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, response]);
                    },
                  },
                  {
                    label: "Configurar Orçamento",
                    icon: <DollarSign className="h-4 w-4" />,
                    variant: "outline" as const,
                    onClick: () => {
                      const response: MessageType = {
                        id: (Date.now() + 2).toString(),
                        content: "Abrindo configurações de orçamento...",
                        sender: "agent",
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, response]);
                    },
                  },
                ]}
              />
            ),
          };
          setMessages((prev) => [...prev, agentResponse]);
        } else {
          const agentResponse: MessageType = {
            id: (Date.now() + 1).toString(),
            content:
              "Entendi sua solicitação. Vou processar essas informações financeiras para você.",
            sender: "agent",
            timestamp: new Date(),
            components: (
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Análise Financeira</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Receitas:</span>
                    <span className="text-green-600">R$ 5.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Despesas:</span>
                    <span className="text-red-600">R$ 3.200,00</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Saldo:</span>
                    <span className="text-green-600">R$ 1.800,00</span>
                  </div>
                </div>
              </Card>
            ),
          };
          setMessages((prev) => [...prev, agentResponse]);
        }
      }, 1000);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "1",
        content:
          "Olá! Sou seu assistente de finanças com IA. Como posso ajudá-lo hoje?",
        sender: "agent",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Assistente Financeiro</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowClearModal(true)}
          disabled={messages.length <= 1}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Histórico
        </Button>
      </div>

      <MessageList messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} />

      <ConfirmationModal
        open={showClearModal}
        onOpenChange={setShowClearModal}
        title="Limpar Histórico"
        description="Tem certeza que deseja limpar todo o histórico de conversas? Esta ação não pode ser desfeita."
        confirmLabel="Limpar"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        confirmIcon={<Trash2 className="h-4 w-4" />}
        onConfirm={() => {
          setMessages([
            {
              id: "1",
              content:
                "Olá! Sou seu assistente de finanças com IA. Como posso ajudá-lo hoje?",
              sender: "agent",
              timestamp: new Date(),
            },
          ]);
        }}
      />
    </div>
  );
}
