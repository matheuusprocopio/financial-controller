"use client";
import { ServerMessageType } from "@/types/message.types";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import ChatWrapper from "./ChatWrapper";

interface IChatComponent {
  serverMessages: ServerMessageType[];
  chatId: string;
}

const ChatComponent = ({ serverMessages, chatId }: IChatComponent) => {
  const [showClearModal, setShowClearModal] = useState(false);

  return (
    <div className="relative z-20 flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
        <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.3)_1px,transparent_1px)] bg-[50px_50px]" />
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
          disabled={serverMessages.length <= 1}
          className="relative flex min-w-10 items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Limpar</span>
        </Button>
      </div>

      <ChatWrapper serverMessages={serverMessages} chatId={chatId} />
    </div>
  );
};

export default ChatComponent;
