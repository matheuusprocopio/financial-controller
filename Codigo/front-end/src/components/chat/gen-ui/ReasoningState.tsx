"use client"

import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

const ReasoningState = () => {
  return (
   <Card className="p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">Pensando na melhor solução</h4>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
            </div>
          </div>
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-muted-foreground/40 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">Analisando sua solicitação...</p>
        </div>
      </div>
    </Card>
  )
}

export default ReasoningState;