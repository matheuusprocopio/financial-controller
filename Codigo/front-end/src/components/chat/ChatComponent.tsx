"use client";
import { MessageType } from "@/types/message.types";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import ChatWrapper from "./ChatWrapper";

interface IChatComponent {
  messages: MessageType[];
}

const ChatComponent = ({ messages }: IChatComponent) => {
  const [showClearModal, setShowClearModal] = useState(false);

  return (
    <div className="chat-main-container">
      <div className="chat-grid-overlay">
        <div className="chat-grid-pattern" />
      </div>

      <div className="relative z-10 flex items-center justify-end p-2 border-b border-indigo-500/20 bg-black/20 backdrop-blur-sm">
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
          className="chat-clear-button text-xs"
        >
          <Trash2 className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Limpar</span>
        </Button>
      </div>

      <ChatWrapper />
    </div>
  );
};

export default ChatComponent;
