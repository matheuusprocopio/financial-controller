"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUploadModal } from "@/components/ui/file-upload-modal"
import { Send, Mic, Paperclip } from "lucide-react"
import type { MessageType } from "./message"

interface ChatInputProps {
  onSendMessage: (message: MessageType) => void
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
  )
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setRecordingTime(0)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: MessageType = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    onSendMessage(newMessage)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = () => {
    setIsUploadModalOpen(true)
  }

  const handleFilesUploaded = (files: File[]) => {
    files.forEach((file) => {
      const newMessage: MessageType = {
        id: Date.now().toString() + Math.random(),
        content: `Arquivo enviado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        sender: "user",
        timestamp: new Date(),
      }
      onSendMessage(newMessage)
    })
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {isRecording && (
          <div className="flex items-center justify-center gap-4 mb-3 p-2 bg-destructive/10 rounded-lg">
            <VoiceWaveAnimation />
            <span className="text-sm font-medium text-destructive">Gravando: {formatTime(recordingTime)}</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <Button variant="ghost" size="icon" onClick={handleFileUpload} className="flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="min-h-[44px] max-h-32 resize-none pr-20"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="icon" className="flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>

          {/* Microphone Button */}
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            className="flex-shrink-0"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* FileUploadModal component */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFilesUploaded}
      />
    </div>
  )
}
