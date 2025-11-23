"use client";
"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateChatDialogProps {
  open: boolean;
  chatName: string;
  isCreating: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onChatNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const CreateChatDialog = ({
  open,
  chatName,
  isCreating,
  error,
  onOpenChange,
  onChatNameChange,
  onSubmit,
}: CreateChatDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Novo chat</DialogTitle>
          <DialogDescription>
            Defina um nome para identificar esta conversa.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="chat-name">Nome</Label>
            <Input
              id="chat-name"
              value={chatName}
              onChange={(event) => onChatNameChange(event.target.value)}
              placeholder="Ex: Planejamento financeiro"
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar chat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
