"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadModal } from "@/components/ui/file-upload-modal";
import { Send, Mic, Paperclip, X } from "lucide-react";
import { transcribeAudio } from "@/utils/services/audio-transcript";

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

function TranscribingIndicator() {
  return (
    <div className="mb-3 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-neutral-300">
      <div className="flex items-center gap-2">
        <span className="flex h-4 w-4 items-center justify-center">
          <span className="h-4 w-4 rounded-full border-2 border-b-transparent border-neutral-400 animate-spin" />
        </span>
        <div className="flex flex-col">
          <span className="font-medium text-neutral-200">
            Processando
          </span>
          <span className="text-neutral-400">
            Transcrevendo seu áudio e preparando a resposta...
          </span>
        </div>
      </div>
    </div>
  );
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
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

  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const shouldDiscardRecordingRef = useRef(false);

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

  const handleTranscription = async (file: File) => {
    try {
      setIsTranscribing(true);
      setTranscribeError(null);
      const { text } = await transcribeAudio(file);
      await onSendMessage(text);
    } catch (error) {
      console.error("Erro ao transcrever áudio:", error);
      setTranscribeError("Não foi possível transcrever o áudio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = ({ discard = false }: { discard?: boolean } = {}) => {
    const recorder = mediaRecorderRef.current;
    shouldDiscardRecordingRef.current = discard;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      shouldDiscardRecordingRef.current = false;
      setTranscribeError(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const shouldDiscardRecording = shouldDiscardRecordingRef.current;
        shouldDiscardRecordingRef.current = false;

        stream.getTracks().forEach((track) => track.stop());

        if (shouldDiscardRecording) {
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([audioBlob], `gravacao-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        void handleTranscription(file);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar a gravação:", error);
      setIsRecording(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    return () => {
      stopRecording({ discard: true });
      mediaRecorderRef.current?.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    };
  }, []);

  const handleCancelRecording = () => {
    if (!isRecording) return;
    stopRecording({ discard: true });
  };

  return (
    <div className="relative z-10 border-t border-white/10 bg-neutral-950 px-4 py-4 sm:px-6">
      <div className="relative mx-auto max-w-3xl">
        {isRecording && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-4">
              <VoiceWaveAnimation />
              <span className="text-sm font-medium text-red-400">
                Gravando: {formatTime(recordingTime)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelRecording}
              className="h-8 rounded-full border border-red-300/40 bg-transparent text-red-200 hover:border-red-300 hover:bg-red-500/20"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar áudio
            </Button>
          </div>
        )}
        {isTranscribing && (
          <TranscribingIndicator />
        )}
        {transcribeError && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border border-red-400/30 bg-red-500/10 text-xs text-red-200">
            {transcribeError}
          </div>
        )}
        <div className="flex items-center gap-3">
        
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="min-h-[44px] max-h-32 w-full resize-none rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 pr-12 text-neutral-100 placeholder:text-neutral-500 focus-visible:border-white/25 focus-visible:ring-0"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-md bg-neutral-100 text-neutral-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:opacity-100"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            className={`h-11 w-11 flex-shrink-0 rounded-lg ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "border border-white/10 bg-transparent text-neutral-300 transition-colors hover:bg-white/5 hover:text-neutral-100"
            }`}
          >
            <Mic className="h-4 w-4" />
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
