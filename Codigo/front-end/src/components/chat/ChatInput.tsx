"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadModal } from "@/components/ui/file-upload-modal";
import { Send, Mic, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

function VoiceWaveAnimation() {
  return (
    <div className="flex items-center gap-1">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-destructive rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 16 + 8}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    onSendMessage(inputValue);

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleFilesUploaded = (files: File[]) => {
    files.forEach((file) => {
      onSendMessage(
        `Arquivo enviado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      );
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="relative z-10 border-t border-purple-400/20 bg-black/60 p-6 backdrop-blur-2xl">
      <div className="relative mx-auto max-w-5xl">
        {isRecording && (
          <div className="flex items-center justify-center gap-4 mb-3 p-2 bg-red-500/10 rounded-lg border border-red-500/30">
            <VoiceWaveAnimation />
            <span className="text-sm font-medium text-red-400">
              Gravando: {formatTime(recordingTime)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileUpload}
            className="h-11 w-11 flex-shrink-0 rounded-lg border border-purple-400/30 bg-purple-500/10 text-white transition hover:border-purple-400/50 hover:bg-purple-500/20"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="min-h-[44px] max-h-32 w-full resize-none rounded-2xl border border-purple-400/30 bg-purple-500/5 px-4 py-3 pr-14 text-white placeholder:text-white/40 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-purple-400/50 bg-gradient-to-r from-purple-600 to-cyan-600 p-3 text-white shadow-[0_10px_15px_-3px_rgba(139,92,246,0.5)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            className={`flex-shrink-0 h-11 w-11 ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600" 
                : "rounded-lg border border-purple-400/30 bg-purple-500/10 text-white transition hover:border-purple-400/50 hover:bg-purple-500/20"
            }`}
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFilesUploaded}
      />
    </div>
  );
};

export default ChatInput;
