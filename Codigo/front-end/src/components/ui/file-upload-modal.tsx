"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, X, File, ImageIcon, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
  title?: string
}

const ALLOWED_EXTENSIONS = [".jpg", ".png", ".pdf", ".xml", ".txt", ".json", ".csv"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function getFileIcon(fileName: string) {
  const extension = fileName.toLowerCase().split(".").pop()

  switch (extension) {
    case "jpg":
    case "png":
      return <ImageIcon className="w-4 h-4" />
    case "pdf":
      return <FileText className="w-4 h-4 text-red-500" />
    case "txt":
    case "json":
    case "csv":
    case "xml":
      return <FileText className="w-4 h-4 text-muted-foreground" />
    default:
      return <File className="w-4 h-4" />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUploadModal({ isOpen, onClose, onUpload, title = "Enviar arquivos" }: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const extension = "." + file.name.toLowerCase().split(".").pop()

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Extensão ${extension} não permitida. Extensões aceitas: ${ALLOWED_EXTENSIONS.join(", ")}`
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo ${file.name} é muito grande. Tamanho máximo: 10MB`
    }

    return null
  }

  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles: File[] = []
      const newErrors: string[] = []

      Array.from(files).forEach((file) => {
        const error = validateFile(file)
        if (error) {
          newErrors.push(error)
        } else {
          // Check if file already exists
          const exists = selectedFiles.some(
            (existingFile) => existingFile.name === file.name && existingFile.size === file.size,
          )
          if (!exists) {
            newFiles.push(file)
          }
        }
      })

      setSelectedFiles((prev) => [...prev, ...newFiles])
      setErrors(newErrors)
    },
    [selectedFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles)
      setSelectedFiles([])
      setErrors([])
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedFiles([])
    setErrors([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground">Extensões aceitas: {ALLOWED_EXTENSIONS.join(", ")}</p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <p className="text-sm font-medium">Arquivos selecionados ({selectedFiles.length})</p>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="flex-shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={selectedFiles.length === 0}>
              Enviar ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
