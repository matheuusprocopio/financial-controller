"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const ErrorState = ({ message }: { message: string }) => {
  return (
    <Card className="p-4 border-destructive/50 bg-destructive/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-destructive mb-1">Erro</h4>
          <p className="text-sm text-destructive/90">{message}</p>
        </div>
      </div>
    </Card>
  )
};

export default ErrorState;