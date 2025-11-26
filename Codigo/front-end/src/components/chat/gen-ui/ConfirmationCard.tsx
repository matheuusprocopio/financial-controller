"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IConfirmationCard {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onConfirm: () => void | boolean | Promise<void | boolean>;
  onCancel?: () => void;
  alreadySubmitted?: boolean;
  onSubmitted?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const ConfirmationCard = ({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "default",
  onConfirm,
  onCancel,
  alreadySubmitted,
  onSubmitted,
  children,
  className,
}: IConfirmationCard) => {
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">(
    "pending"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (alreadySubmitted) {
      setStatus("confirmed");
    }
  }, [alreadySubmitted]);

  const handleConfirm = async () => {
    if (status === "confirmed") return;

    setIsSubmitting(true);
    try {
      const result = await onConfirm();
      if (result === false) {
        return;
      }
      setStatus("confirmed");
      onSubmitted?.();
    } catch (error) {
      setStatus("pending");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
    onCancel?.();
  };

  if (status === "confirmed") {
    return (
      <Card
        className={cn(
          "border-green-200 bg-green-50",
          "dark:border-green-500/50 dark:bg-green-950/20",
          className
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
            <span className="text-green-800 dark:text-green-100 font-medium">
              Ação confirmada
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "cancelled") {
    return (
      <Card
        className={cn(
          "border-gray-300 bg-gray-100",
          "dark:border-gray-700 dark:bg-gray-900/70",
          className
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              Ação cancelada
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-orange-200 bg-orange-50",
        "dark:border-orange-500/50 dark:bg-orange-950/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
          <div>
            <CardTitle className="text-base text-orange-900 dark:text-orange-100">
              {title}
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-200">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {children && <CardContent className="py-3">{children}</CardContent>}

      <CardFooter className="flex gap-2 pt-3">
        <Button
          variant={confirmVariant}
          size="sm"
          onClick={handleConfirm}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : confirmLabel}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex-1 bg-transparent dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          {cancelLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfirmationCard;
