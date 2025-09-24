"use client";
import { MessageType } from "@/types/message.types";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import MessagesContainer from "@/components/chat/MessagesContainer";
import ChatInput from "@/components/chat/ChatInput";

interface IChatComponent {
  messages: MessageType[];
}

const ChatComponent = ({ messages }: IChatComponent) => {
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSendMessage = (message: string) => {};

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-end p-2 border-b bg-muted/30">
        <ConfirmationModal
          open={showClearModal}
          onOpenChange={setShowClearModal}
          title="Limpar Histórico"
          description="Tem certeza que deseja limpar todo o histórico de conversas? Esta ação não pode ser desfeita."
          confirmLabel="Limpar"
          cancelLabel="Cancelar"
          confirmVariant="destructive"
          confirmIcon={<Trash2 className="h-4 w-4" />}
          onConfirm={() => setShowClearModal(false)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowClearModal(true)}
          disabled={messages.length <= 1}
          className="text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      </div>
      <MessagesContainer messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatComponent;
