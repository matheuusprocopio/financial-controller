"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmationCardProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onConfirm: () => void
  onCancel?: () => void
  children?: React.ReactNode
  className?: string
}

export function ConfirmationCard({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "default",
  onConfirm,
  onCancel,
  children,
  className,
}: ConfirmationCardProps) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending")

  const handleConfirm = () => {
    setStatus("confirmed")
    onConfirm()
  }

  const handleCancel = () => {
    setStatus("cancelled")
    onCancel?.()
  }

  if (status === "confirmed") {
    return (
      <Card className={cn("border-green-200 bg-green-50", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Ação confirmada</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "cancelled") {
    return (
      <Card className={cn("border-gray-200 bg-gray-50", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium">Ação cancelada</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-orange-200 bg-orange-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div>
            <CardTitle className="text-base text-orange-900">{title}</CardTitle>
            <CardDescription className="text-orange-700">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      {children && <CardContent className="py-3">{children}</CardContent>}

      <CardFooter className="flex gap-2 pt-3">
        <Button variant={confirmVariant} size="sm" onClick={handleConfirm} className="flex-1">
          {confirmLabel}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1 bg-transparent">
          {cancelLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
