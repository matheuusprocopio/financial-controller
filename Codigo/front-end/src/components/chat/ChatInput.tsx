"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadModal } from "@/components/ui/file-upload-modal";
import { ArrowUp, Mic, Paperclip, Square, X } from "lucide-react";
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
    <div className="mb-2 flex items-center gap-2 px-1 text-xs text-neutral-400">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
      Transcrevendo seu áudio…
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
    <div className="shrink-0 px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {isTranscribing && <TranscribingIndicator />}
        {transcribeError && (
          <div className="mb-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {transcribeError}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-neutral-900 transition-colors focus-within:border-white/20">
          {isRecording ? (
            <div className="flex min-h-[52px] items-center gap-3 px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <VoiceWaveAnimation />
              <span className="text-sm tabular-nums text-neutral-300">
                Gravando · {formatTime(recordingTime)}
              </span>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pergunte ou registre algo, ex.: “gastei R$ 30 no almoço”"
              className="max-h-40 min-h-[52px] w-full resize-none border-0 bg-transparent px-4 pt-3.5 pb-1 text-[15px] text-neutral-100 shadow-none placeholder:text-neutral-500 focus-visible:ring-0 dark:bg-transparent"
              rows={1}
            />
          )}

          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            {isRecording ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelRecording}
                className="h-8 gap-1.5 rounded-md px-2.5 text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            ) : (
              <span className="hidden pl-2 text-xs text-neutral-600 sm:block">
                Enter para enviar · Shift + Enter para nova linha
              </span>
            )}

            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                aria-label={isRecording ? "Parar gravação" : "Gravar áudio"}
                className={`h-8 w-8 rounded-md ${
                  isRecording
                    ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 hover:text-red-200"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                }`}
              >
                {isRecording ? <Square className="h-3.5 w-3.5 fill-current" /> : <Mic className="h-4 w-4" />}
              </Button>
              {!isRecording && (
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="icon"
                  aria-label="Enviar mensagem"
                  className="h-8 w-8 rounded-md bg-neutral-100 text-neutral-950 transition-colors hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-500 disabled:opacity-100"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-neutral-600">
          O assistente pode cometer erros. Confira valores importantes.
        </p>
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
